import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrderWithItems } from "@/lib/data";
import { db } from "@/db";
import { paymentProofs, addresses } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  const { id } = await params;
  const result = await getOrderWithItems(id);
  if (!result) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

  const { order, items } = result;

  const isOwner = order.userId === user.id;
  const isAdmin = user.role === "admin";
  const isSupplierOfItem = user.role === "supplier" && items.some((i) => i.supplierId === user.id);

  if (!isOwner && !isAdmin && !isSupplierOfItem) {
    return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 });
  }

  const proofs = await db.select().from(paymentProofs).where(eq(paymentProofs.orderId, id));
  const addressRows = order.addressId
    ? await db.select().from(addresses).where(eq(addresses.id, order.addressId))
    : [];

  // إن كان مورد، أظهر فقط عناصره
  const visibleItems = isSupplierOfItem && !isAdmin && !isOwner ? items.filter((i) => i.supplierId === user.id) : items;

  return NextResponse.json({
    order,
    items: visibleItems,
    proofs,
    address: addressRows[0] || null,
  });
}
