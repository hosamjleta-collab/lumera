import { db } from "./index";
import { users } from "./schema";
import { hashPassword } from "../lib/auth";
import { generateId } from "../lib/utils";
import { getUserByEmail } from "../lib/data";
import { eq } from "drizzle-orm";

async function main() {
  const name = "Hosam Jleta";
  const email = "hosam.jleta@gmail.com";
  // ضع كلمة المرور التي تريدها للحساب في حال إنشاء حساب جديد
  const defaultPassword = "AdminPassword123!"; 

  console.log("=== جاري التحقق من حساب المدير ===");

  try {
    const existing = await getUserByEmail(email);

    if (existing) {
      // إذا كان الحساب موجوداً، نكتفي بترقيته إلى admin
      await db
        .update(users)
        .set({ role: "admin", status: "active" })
        .where(eq(users.email, email));
      console.log(`✔ تم ترقية الحساب الحالي (${email}) إلى admin بنجاح!`);
    } else {
      // إذا لم يكن الحساب موجوداً، نقوم بإنشائه مباشرة
      const passwordHash = await hashPassword(defaultPassword);
      const id = generateId("usr");

      await db.insert(users).values({
        id,
        name,
        email,
        passwordHash,
        role: "admin",
        status: "active",
      });
      console.log(`✔ تم إنشاء حساب مدير جديد بنجاح: ${email}`);
    }
  } catch (err) {
    console.error("خطأ أثناء إعداد حساب الأدمن:", err);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});