import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { generateId, calculateSellingPrice } from "@/lib/utils";
import { getSupplierProducts, getActiveCommissionPercentage, getCategoryBySlug } from "@/lib/data";
import { eq } from "drizzle-orm";
import { categories } from "@/db/schema";

const createSchema = z.object({
  name: z.string().min(2, "اسم المنتج قصير جدًا"),
  categoryId: z.string().min(1, "التصنيف مطلوب"),
  brand: z.string().optional(),
  description: z.string().optional(),
  supplierPrice: z.number().positive("السعر يجب أن يكون أكبر من صفر"),
  stock: z.number().int().min(0, "الكمية غير صحيحة"),
  images: z.array(z.string()).default([]),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "supplier") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }
  const list = await getSupplierProducts(user.id);
  return NextResponse.json({ products: list });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "supplier") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "بيانات غير صحيحة" }, { status: 400 });
  }
  const data = parsed.data;

  const catRows = await db.select().from(categories).where(eq(categories.id, data.categoryId));
  if (!catRows[0]) {
    return NextResponse.json({ error: "التصنيف غير موجود" }, { status: 400 });
  }

  const commission = await getActiveCommissionPercentage(data.categoryId);
  const sellingPrice = calculateSellingPrice(data.supplierPrice, commission);
  const id = generateId("prd");

  await db.insert(products).values({
    id,
    supplierId: user.id,
    categoryId: data.categoryId,
    name: data.name,
    slug: id,
    brand: data.brand || null,
    description: data.description || null,
    supplierPrice: data.supplierPrice,
    commissionPercentage: commission,
    sellingPrice,
    stock: data.stock,
    images: JSON.stringify(data.images),
    status: "pending",
    isActive: true,
  });

  return NextResponse.json({ success: true, id });
}
