import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { paymentProofs, orders, payments, notifications, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { eq } from "drizzle-orm";

const schema = z.object({
  imagePath: z.string().min(1),
  note: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  const { id } = await params;
  const orderRows = await db.select().from(orders).where(eq(orders.id, id));
  const order = orderRows[0];
  if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  if (order.userId !== user.id) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });

  await db.insert(paymentProofs).values({
    id: generateId("prf"),
    orderId: id,
    imagePath: parsed.data.imagePath,
    note: parsed.data.note || null,
  });

  await db.update(orders).set({ status: "proof_uploaded", updatedAt: new Date().toISOString() }).where(eq(orders.id, id));
  await db.update(payments).set({ status: "under_review" }).where(eq(payments.orderId, id));

  // إشعار الإدارة (كل المدراء)
  const admins = await db.select().from(users).where(eq(users.role, "admin"));
  for (const admin of admins) {
    await db.insert(notifications).values({
      id: generateId("ntf"),
      userId: admin.id,
      title: "إثبات دفع جديد بحاجة للمراجعة",
      message: `تم رفع إثبات دفع للطلب رقم ${order.referenceNumber}`,
      link: `/admin/orders/${id}`,
    });
  }

  return NextResponse.json({ success: true });
}
