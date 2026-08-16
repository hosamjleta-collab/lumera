import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { products, notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getProductById } from "@/lib/data";
import { generateId } from "@/lib/utils";
import { eq } from "drizzle-orm";

const schema = z.object({
  action: z.enum(["approve", "reject", "toggleActive"]),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });

  if (parsed.data.action === "approve") {
    await db.update(products).set({ status: "approved" }).where(eq(products.id, id));
    await db.insert(notifications).values({
      id: generateId("ntf"),
      userId: product.supplierId,
      title: "تمت الموافقة على منتجك",
      message: `تمت الموافقة على منتج "${product.name}" وهو الآن ظاهر للعملاء.`,
      link: "/supplier/products",
    });
  } else if (parsed.data.action === "reject") {
    await db.update(products).set({ status: "rejected" }).where(eq(products.id, id));
    await db.insert(notifications).values({
      id: generateId("ntf"),
      userId: product.supplierId,
      title: "تم رفض منتجك",
      message: `للأسف تم رفض منتج "${product.name}". يرجى مراجعته وإعادة تعديله.`,
      link: "/supplier/products",
    });
  } else if (parsed.data.action === "toggleActive") {
    await db
      .update(products)
      .set({ isActive: parsed.data.isActive ?? !product.isActive })
      .where(eq(products.id, id));
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;
  await db.delete(products).where(eq(products.id, id));
  return NextResponse.json({ success: true });
}
