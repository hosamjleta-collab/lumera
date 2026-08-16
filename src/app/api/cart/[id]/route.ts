import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { cartItems } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { getProductById } from "@/lib/data";

const updateSchema = z.object({ quantity: z.number().int().min(1).max(50) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });

  const rows = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.id, id), eq(cartItems.userId, user.id)));
  const item = rows[0];
  if (!item) return NextResponse.json({ error: "العنصر غير موجود" }, { status: 404 });

  const product = await getProductById(item.productId);
  if (!product) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });

  const qty = Math.min(parsed.data.quantity, product.stock);
  await db.update(cartItems).set({ quantity: qty }).where(eq(cartItems.id, id));

  return NextResponse.json({ success: true, quantity: qty });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  const { id } = await params;
  await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(cartItems.userId, user.id)));

  return NextResponse.json({ success: true });
}
