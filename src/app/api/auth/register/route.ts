import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, supplierProfiles } from "@/db/schema";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { generateId } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جدًا"),
  email: z.union([z.string().trim().email("بريد إلكتروني غير صحيح"), z.literal("")]).optional(),
  phone: z.union([z.string().trim().min(7, "رقم الهاتف غير صحيح"), z.literal("")]).optional(),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  role: z.enum(["customer", "supplier"]).default("customer"),
  storeName: z.string().trim().optional(),
  authMethod: z.enum(["email", "phone"]).default("email"),
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

    const { name, email: rawEmail, phone: rawPhone, password, role, storeName, authMethod } = parsed.data;
    const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
    const phone = typeof rawPhone === "string" ? rawPhone.trim() : "";

    if (authMethod === "email" && !email) {
      return NextResponse.json({ error: "البريد الإلكتروني مطلوب عند التسجيل بالبريد" }, { status: 400 });
    }

    if (authMethod === "phone" && !phone) {
      return NextResponse.json({ error: "رقم الهاتف مطلوب عند التسجيل بالهاتف" }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json({ error: "يجب إدخال بريد إلكتروني أو رقم هاتف واحد على الأقل" }, { status: 400 });
    }

    if (role === "supplier" && !storeName?.trim()) {
      return NextResponse.json({ error: "اسم المتجر مطلوب للموردين" }, { status: 400 });
    }

    if (email) {
      const existingEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingEmail[0]) {
        return NextResponse.json({ error: "هذا البريد الإلكتروني مسجل بالفعل" }, { status: 409 });
      }
    }

    if (phone) {
      const existingPhone = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
      if (existingPhone[0]) {
        return NextResponse.json({ error: "هذا الرقم مسجل بالفعل" }, { status: 409 });
      }
    }

    const passwordHash = await hashPassword(password);
    const userId = generateId("usr");
    const normalizedEmail = authMethod === "email" ? email : null;
    const normalizedPhone = authMethod === "phone" ? phone : phone || null;

    await db.insert(users).values({
      id: userId,
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash,
      role,
      status: role === "supplier" ? "pending" : "active",
    });

    if (role === "supplier") {
      await db.insert(supplierProfiles).values({
        id: generateId("sup"),
        userId,
        storeName: storeName!.trim(),
        approved: false,
      });

      return NextResponse.json({
        success: true,
        pendingApproval: true,
        message: "تم إنشاء حسابك كمورد بنجاح. حسابك الآن بانتظار موافقة الإدارة.",
      });
    }

    if (email) {
      await setSessionCookie({ id: userId, name, email, role });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({
      success: true,
      needsLogin: true,
      message: "تم إنشاء الحساب بنجاح. يمكنك تسجيل الدخول باستخدام رقم الهاتف.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
