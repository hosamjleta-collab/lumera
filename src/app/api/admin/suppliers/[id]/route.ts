import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { supplierProfiles, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

const schema = z.object({
  action: z.enum(["approve", "suspend", "activate"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params; // id هنا هو userId الخاص بالمورد
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });

  const profileRows = await db.select().from(supplierProfiles).where(eq(supplierProfiles.userId, id));
  if (!profileRows[0]) return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });

  if (parsed.data.action === "approve") {
    await db.update(supplierProfiles).set({ approved: true }).where(eq(supplierProfiles.userId, id));
    await db.update(users).set({ status: "active" }).where(eq(users.id, id));
  } else if (parsed.data.action === "suspend") {
    await db.update(users).set({ status: "suspended" }).where(eq(users.id, id));
  } else if (parsed.data.action === "activate") {
    await db.update(users).set({ status: "active" }).where(eq(users.id, id));
  }

  return NextResponse.json({ success: true });
}
