// إنشاء حساب مدير (Admin) حقيقي وآمن.
// شغّليه بالأمر: npm run db:create-admin
// سيسألك عن الاسم والبريد الإلكتروني وكلمة مرور قوية، وينشئ الحساب مباشرة
// في قاعدة البيانات الحالية (المحلية أو الحقيقية حسب DATABASE_PATH).

import readline from "readline/promises";
import { db } from "./index";
import { users } from "./schema";
import { hashPassword } from "../lib/auth";
import { generateId } from "../lib/utils";
import { getUserByEmail } from "../lib/data";

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log("=== إنشاء حساب مدير جديد ===\n");

  const name = await rl.question("الاسم الكامل: ");
  const email = await rl.question("البريد الإلكتروني: ");
  let password = "";
  while (password.length < 8) {
    password = await rl.question("كلمة المرور (8 أحرف على الأقل): ");
    if (password.length < 8) console.log("كلمة المرور قصيرة جدًا، حاولي مرة أخرى.\n");
  }

  rl.close();

  const existing = await getUserByEmail(email);
  if (existing) {
    console.log(`\nيوجد حساب بالفعل بهذا البريد (${email}). لم يتم إنشاء حساب جديد.`);
    console.log("إذا أردتِ ترقيته إلى مدير، عدّلي حقل role يدويًا أو أخبري Claude لمساعدتك.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const id = generateId("usr");

  await db.insert(users).values({
    id,
    name,
    email,
    passwordHash,
    role: "admin",
    status: "active",
  });

  console.log(`\n✔ تم إنشاء حساب المدير بنجاح: ${email}`);
  console.log("يمكنك الآن تسجيل الدخول بهذا الحساب من صفحة /login");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
