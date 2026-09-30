import fs from "fs";
import path from "path";
import { createClient } from "@libsql/client";

// إعداد الاتصال باستخدام LibSQL العميل السحابي الخفيف
const dbUrl = process.env.DATABASE_URL || `file:${path.join(process.cwd(), "sqlite.db")}`;
const db = createClient({ url: dbUrl });

const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");

async function main() {
  console.log(`[migrate] الاتصال بقاعدة البيانات عبر LibSQL في المسار: ${dbUrl}`);
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS __custom_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT DEFAULT (current_timestamp)
    );
  `);

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log("[migrate] مجلد الترحيلات غير موجود، تخطي.");
    return;
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const result = await db.execute({
      sql: `SELECT name FROM __custom_migrations WHERE name = ?`,
      args: [file],
    });

    if (result.rows.length > 0) {
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
      await db.execute(statement);
    }

    await db.execute({
      sql: `INSERT INTO __custom_migrations (name) VALUES (?);`,
      args: [file],
    });
  }

  console.log("[migrate] اكتمل تطبيق كل الترحيلات ✔");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[migrate] خطأ أثناء الترحيل:", err);
    process.exit(1);
  });