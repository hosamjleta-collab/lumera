import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users, supplierProfiles } from "@/db/schema";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { getUserByEmail } from "@/lib/data";

const schema = z.object({
  name: z.string().min(2, "الاسم قصير جدًا"),
  email: z.string().email("بريد إلكتروني غير صحيح"),
  phone: z.string().optional(),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  role: z.enum(["customer", "supplier"]).default("customer"),
  storeName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات غير صحيحة" },
        { status: 400 }
      );
    }
    const { name, email, phone, password, role, storeName } = parsed.data;

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "هذا البريد الإلكتروني مسجل بالفعل" }, { status: 409 });
    }

    if (role === "supplier" && !storeName) {
      return NextResponse.json({ error: "اسم المتجر مطلوب للموردين" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const userId = generateId("usr");

    await db.insert(users).values({
      id: userId,
      name,
      email,
      phone: phone || null,
      passwordHash,
      role,
      status: role === "supplier" ? "pending" : "active",
    });

    if (role === "supplier") {
      await db.insert(supplierProfiles).values({
        id: generateId("sup"),
        userId,
        storeName: storeName!,
        approved: false,
      });
      // الموردون بانتظار موافقة الإدارة - لا نُنشئ جلسة تلقائية كاملة الصلاحية
      return NextResponse.json({
        success: true,
        pendingApproval: true,
        message: "تم إنشاء حسابك كمورد بنجاح. حسابك الآن بانتظار موافقة الإدارة.",
      });
    }

    await setSessionCookie({ id: userId, name, email, role });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
