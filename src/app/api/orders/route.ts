import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, payments, addresses, notifications, products as productsTable } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getCartWithProducts, getUserOrders } from "@/lib/data";
import { generateId, generateOrderReference } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { cartItems } from "@/db/schema";
import { z } from "zod";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  const list = await getUserOrders(user.id);
  return NextResponse.json({ orders: list });
}

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  city: z.string().min(2),
  area: z.string().optional(),
  addressLine: z.string().min(3),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  if (user.role !== "customer") {
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "يرجى تعبئة بيانات الشحن كاملة" }, { status: 400 });
  }

  const cart = await getCartWithProducts(user.id);
  if (cart.length === 0) {
    return NextResponse.json({ error: "السلة فارغة" }, { status: 400 });
  }

  // التحقق من توفر المخزون
  for (const item of cart) {
    if (item.quantity > item.product.stock) {
      return NextResponse.json(
        { error: `الكمية المطلوبة من "${item.product.name}" غير متوفرة` },
        { status: 400 }
      );
    }
  }

  const addressId = generateId("addr");
  await db.insert(addresses).values({
    id: addressId,
    userId: user.id,
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    city: parsed.data.city,
    area: parsed.data.area || null,
    addressLine: parsed.data.addressLine,
    isDefault: false,
  });

  const subtotal = cart.reduce((sum, i) => sum + i.product.sellingPrice * i.quantity, 0);
  const orderId = generateId("ord");
  const reference = generateOrderReference();

  await db.insert(orders).values({
    id: orderId,
    referenceNumber: reference,
    userId: user.id,
    addressId,
    status: "awaiting_payment",
    subtotal,
    total: subtotal,
    customerNote: parsed.data.note || null,
  });

  for (const item of cart) {
    const images: string[] = (() => {
      try {
        return JSON.parse(item.product.images);
      } catch {
        return [];
      }
    })();
    await db.insert(orderItems).values({
      id: generateId("oit"),
      orderId,
      productId: item.product.id,
      supplierId: item.product.supplierId,
      productName: item.product.name,
      productImage: images[0] || null,
      quantity: item.quantity,
      supplierPrice: item.product.supplierPrice,
      commissionPercentage: item.product.commissionPercentage,
      sellingPrice: item.product.sellingPrice,
      lineTotal: item.product.sellingPrice * item.quantity,
    });

    // خصم من المخزون
    await db
      .update(productsTable)
      .set({ stock: item.product.stock - item.quantity })
      .where(eq(productsTable.id, item.product.id));
  }

  await db.insert(payments).values({
    id: generateId("pay"),
    orderId,
    amount: subtotal,
    method: "bank_transfer",
    status: "pending",
  });

  await db.insert(notifications).values({
    id: generateId("ntf"),
    userId: user.id,
    title: "تم إنشاء طلبك بنجاح",
    message: `رقمك المرجعي هو ${reference}. يرجى إتمام التحويل البنكي ورفع إثبات الدفع.`,
    link: `/account/orders/${orderId}`,
  });

  // إفراغ السلة
  await db.delete(cartItems).where(eq(cartItems.userId, user.id));

  return NextResponse.json({ success: true, orderId, reference });
}
