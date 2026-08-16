import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { calculateSellingPrice } from "@/lib/utils";
import { getProductById, getActiveCommissionPercentage } from "@/lib/data";
import { eq, and } from "drizzle-orm";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  categoryId: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
  supplierPrice: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "supplier") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;
  const product = await getProductById(id);
  if (!product || product.supplierId !== user.id) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "supplier") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;
  const product = await getProductById(id);
  if (!product || product.supplierId !== user.id) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  const data = parsed.data;

  const newCategoryId = data.categoryId ?? product.categoryId;
  const newSupplierPrice = data.supplierPrice ?? product.supplierPrice;
  const commission = await getActiveCommissionPercentage(newCategoryId);
  const sellingPrice = calculateSellingPrice(newSupplierPrice, commission);

  await db
    .update(products)
    .set({
      name: data.name ?? product.name,
      categoryId: newCategoryId,
      brand: data.brand !== undefined ? data.brand : product.brand,
      description: data.description !== undefined ? data.description : product.description,
      supplierPrice: newSupplierPrice,
      commissionPercentage: commission,
      sellingPrice,
      stock: data.stock ?? product.stock,
      images: data.images ? JSON.stringify(data.images) : product.images,
      isActive: data.isActive ?? product.isActive,
      // أي تعديل جوهري يعيد المنتج لحالة "قيد المراجعة" ليضمن مراجعة الإدارة
      status: "pending",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(products.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "supplier") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;
  const product = await getProductById(id);
  if (!product || product.supplierId !== user.id) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  await db.delete(products).where(and(eq(products.id, id), eq(products.supplierId, user.id)));
  return NextResponse.json({ success: true });
}
