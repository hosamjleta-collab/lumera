import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { generateId } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "اسم التصنيف قصير جدًا"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "الرابط يجب أن يحتوي أحرف إنجليزية وأرقام وشرطات فقط"),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "بيانات غير صحيحة" }, { status: 400 });
  }

  try {
    await db.insert(categories).values({
      id: generateId("cat"),
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "هذا الرابط (slug) مستخدم بالفعل" }, { status: 409 });
  }
}
