import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { payments, orders, notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { eq } from "drizzle-orm";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params; // orderId
  const orderRows = await db.select().from(orders).where(eq(orders.id, id));
  const order = orderRows[0];
  if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

  const paymentRows = await db.select().from(payments).where(eq(payments.orderId, id));
  const payment = paymentRows[0];
  if (!payment) return NextResponse.json({ error: "لا يوجد سجل دفع لهذا الطلب" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });

  if (parsed.data.action === "approve") {
    await db
      .update(payments)
      .set({ status: "approved", reviewedBy: user.id, reviewedAt: new Date().toISOString() })
      .where(eq(payments.orderId, id));
    await db
      .update(orders)
      .set({ status: "payment_confirmed", updatedAt: new Date().toISOString() })
      .where(eq(orders.id, id));
    await db.insert(notifications).values({
      id: generateId("ntf"),
      userId: order.userId,
      title: "تم تأكيد دفعتك",
      message: `تم تأكيد دفعتك لطلب ${order.referenceNumber} وسيتم تجهيز طلبك قريبًا.`,
      link: `/account/orders/${id}`,
    });
  } else {
    await db
      .update(payments)
      .set({
        status: "rejected",
        reviewedBy: user.id,
        reviewedAt: new Date().toISOString(),
        rejectionReason: parsed.data.reason || null,
      })
      .where(eq(payments.orderId, id));
    await db
      .update(orders)
      .set({ status: "awaiting_payment", updatedAt: new Date().toISOString() })
      .where(eq(orders.id, id));
    await db.insert(notifications).values({
      id: generateId("ntf"),
      userId: order.userId,
      title: "تم رفض إثبات الدفع",
      message: `تم رفض إثبات الدفع لطلبك ${order.referenceNumber}. ${
        parsed.data.reason ? `السبب: ${parsed.data.reason}` : ""
      } يرجى رفع إثبات جديد.`,
      link: `/account/orders/${id}`,
    });
  }

  return NextResponse.json({ success: true });
}
