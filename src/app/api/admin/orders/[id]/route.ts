import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orders, notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { generateId, ORDER_STATUS_LABELS } from "@/lib/utils";
import { eq } from "drizzle-orm";

const schema = z.object({
  status: z.enum([
    "new",
    "awaiting_payment",
    "proof_uploaded",
    "payment_review",
    "payment_confirmed",
    "processing",
    "shipped",
    "completed",
    "cancelled",
  ]),
  adminNote: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;
  const orderRows = await db.select().from(orders).where(eq(orders.id, id));
  const order = orderRows[0];
  if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });

  await db
    .update(orders)
    .set({
      status: parsed.data.status,
      adminNote: parsed.data.adminNote ?? order.adminNote,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(orders.id, id));

  await db.insert(notifications).values({
    id: generateId("ntf"),
    userId: order.userId,
    title: "تحديث حالة طلبك",
    message: `تم تحديث حالة طلبك ${order.referenceNumber} إلى: ${ORDER_STATUS_LABELS[parsed.data.status]}`,
    link: `/account/orders/${id}`,
  });

  return NextResponse.json({ success: true });
}
