import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

const schema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });

  await db
    .update(categories)
    .set({
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
    })
    .where(eq(categories.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;
  const inUse = await db.select().from(products).where(eq(products.categoryId, id));
  if (inUse.length > 0) {
    return NextResponse.json(
      { error: "لا يمكن حذف هذا التصنيف لأنه مرتبط بمنتجات حالية" },
      { status: 400 }
    );
  }

  await db.delete(categories).where(eq(categories.id, id));
  return NextResponse.json({ success: true });
}
