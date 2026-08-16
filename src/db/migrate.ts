// مُشغّل ترحيلات (migrations) مخصص وبسيط، يستخدم node:sqlite المدمجة بدلاً
// من الاعتماد على درايفر better-sqlite3 الداخلي في drizzle-kit، والذي قد
// يسبب تعارضًا وانهيارًا (Segmentation fault) على بعض بيئات الاستضافة
// السحابية. يقرأ هذا السكربت ملفات SQL من مجلد drizzle/ ويطبّقها مرة واحدة
// فقط لكل ملف (تتبّع الملفات المُطبّقة مسبقًا في جدول __custom_migrations).

import fs from "fs";
import path from "path";
import { sqlite } from "./index";

const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");

async function main() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS __custom_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT DEFAULT (current_timestamp)
    );
  `);

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const already = sqlite.query<{ name: string }>(
      `SELECT name FROM __custom_migrations WHERE name = ?`,
      [file]
    );
    if (already.length > 0) {
      console.log(`[migrate] تم تطبيق ${file} مسبقًا، تخطي.`);
      continue;
    }

    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    const statements = content
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    console.log(`[migrate] تطبيق ${file} (${statements.length} استعلام)...`);
    for (const statement of statements) {
      sqlite.exec(statement);
    }

    sqlite.exec(
      `INSERT INTO __custom_migrations (name) VALUES ('${file.replace(/'/g, "''")}');`
    );
  }

  console.log("[migrate] اكتمل تطبيق كل الترحيلات ✔");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[migrate] خطأ أثناء الترحيل:", err);
    process.exit(1);
  });
