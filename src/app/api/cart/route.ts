import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { cartItems } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { getCartWithProducts, getProductById } from "@/lib/data";
import { eq, and } from "drizzle-orm";

const addSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(50).default(1),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  const items = await getCartWithProducts(user.id);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
  if (user.role !== "customer") {
    return NextResponse.json({ error: "هذه الميزة متاحة للعملاء فقط" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }
  const { productId, quantity } = parsed.data;

  const product = await getProductById(productId);
  if (!product || product.status !== "approved" || !product.isActive) {
    return NextResponse.json({ error: "المنتج غير متوفر" }, { status: 404 });
  }
  if (product.stock < quantity) {
    return NextResponse.json({ error: "الكمية المطلوبة غير متوفرة في المخزون" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, productId)));

  if (existing[0]) {
    const newQty = Math.min(product.stock, existing[0].quantity + quantity);
    await db.update(cartItems).set({ quantity: newQty }).where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({
      id: generateId("cart"),
      userId: user.id,
      productId,
      quantity: Math.min(quantity, product.stock),
    });
  }

  return NextResponse.json({ success: true });
}
