import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

// تحديد مسار قاعدة البيانات مباشرة لضمان عدم حدوث خطأ في الاتصال
const dbPath = process.env.DATABASE_URL?.replace("sqlite://", "") || path.join(process.cwd(), "sqlite.db");
const sqlite = new Database(dbPath);

const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");

async function main() {
  console.log(`[migrate] الاتصال بقاعدة البيانات في المسار: ${dbPath}`);
  
  sqlite.exec(`
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
    const stmt = sqlite.prepare(`SELECT name FROM __custom_migrations WHERE name = ?`);
    const already = stmt.get(file);
    
    if (already) {
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

    sqlite.prepare(`INSERT INTO __custom_migrations (name) VALUES (?)`).run(file);
  }

  console.log("[migrate] اكتمل تطبيق كل الترحيلات ✔");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[migrate] خطأ أثناء الترحيل:", err);
    process.exit(1);
  });