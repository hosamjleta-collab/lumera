// حذف كل بيانات التجربة (الحسابات التجريبية، المنتجات التجريبية، الطلبات...)
// مع الإبقاء على التصنيفات الأساسية وإعدادات العمولة والموقع (يمكن تعديلها لاحقًا
// من لوحة الإدارة). لا تُشغّلي هذا السكربت إلا مرة واحدة قبل الانطلاق الفعلي،
// وبعد إنشاء حساب المدير الحقيقي الخاص بك (npm run db:create-admin).
//
// تشغيل: npm run db:reset-demo

import readline from "readline/promises";
import { db } from "./index";
import { sql } from "drizzle-orm";

async function executeSqlStatements(sqlText: string) {
  const statements = sqlText
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await db.execute(sql.raw(statement));
  }
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log("⚠️  هذا سيحذف كل الحسابات والمنتجات والطلبات التجريبية نهائيًا.");
  const confirm = await rl.question('اكتبي "تأكيد" للمتابعة: ');
  rl.close();

  if (confirm.trim() !== "تأكيد") {
    console.log("تم الإلغاء. لم يتم حذف أي شيء.");
    process.exit(0);
  }

  await executeSqlStatements(`
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM payment_proofs;
    DELETE FROM payments;
    DELETE FROM cart_items;
    DELETE FROM notifications;
    DELETE FROM products;
    DELETE FROM addresses;
    DELETE FROM supplier_profiles;
    DELETE FROM users;
  `);

  console.log("\n✔ تم حذف كل بيانات التجربة (الحسابات، المنتجات، الطلبات).");
  console.log("التصنيفات وإعدادات العمولة وبيانات التحويل البنكي لم تتأثر.");
  console.log("\nالخطوة التالية: أنشئي حساب المدير الحقيقي إن لم تكوني فعلتِ ذلك:");
  console.log("  npm run db:create-admin");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
