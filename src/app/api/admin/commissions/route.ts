import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { commissionSettings, products } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { generateId, calculateSellingPrice } from "@/lib/utils";
import { eq, sql, isNull } from "drizzle-orm";

const schema = z.object({
  categoryId: z.string().nullable(), // null = عمولة عامة افتراضية
  percentage: z.number().min(0).max(500),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const rows = await db.select().from(commissionSettings);
  return NextResponse.json({ settings: rows });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  const { categoryId, percentage } = parsed.data;

  const existing = categoryId
    ? await db.select().from(commissionSettings).where(eq(commissionSettings.categoryId, categoryId))
    : await db.select().from(commissionSettings).where(isNull(commissionSettings.categoryId));

  if (existing[0]) {
    await db
      .update(commissionSettings)
      .set({ percentage, updatedAt: new Date().toISOString() })
      .where(eq(commissionSettings.id, existing[0].id));
  } else {
    await db.insert(commissionSettings).values({
      id: generateId("com"),
      categoryId,
      percentage,
    });
  }

  // إعادة حساب أسعار البيع للمنتجات المتأثرة (لا يؤثر على الطلبات السابقة لأنها محفوظة بشكل ثابت)
  const affectedProducts = categoryId
    ? await db.select().from(products).where(eq(products.categoryId, categoryId))
    : await db.select().from(products);

  for (const p of affectedProducts) {
    // إذا كانت هناك عمولة خاصة بتصنيف المنتج ولسنا نُحدّث تلك التصنيف تحديدًا، تجاهل (فقط عند تحديث العام تجاهل من له عمولة خاصة)
    if (!categoryId) {
      const specific = await db
        .select()
        .from(commissionSettings)
        .where(eq(commissionSettings.categoryId, p.categoryId));
      if (specific[0]) continue; // لهذا التصنيف عمولة خاصة، لا نغيرها بتحديث العمولة العامة
    }
    const newSellingPrice = calculateSellingPrice(p.supplierPrice, percentage);
    await db
      .update(products)
      .set({ commissionPercentage: percentage, sellingPrice: newSellingPrice })
      .where(eq(products.id, p.id));
  }

  return NextResponse.json({ success: true });
}
