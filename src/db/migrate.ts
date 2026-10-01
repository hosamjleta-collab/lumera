import fs from "fs";
import path from "path";
import "dotenv/config";
import { Pool } from "@neondatabase/serverless";

const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");
let migrationPromise: Promise<void> | null = null;

export function runMigrations() {
  if (!migrationPromise) {
    migrationPromise = (async () => {
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is required for migrations.");
      }

      const pool = new Pool({ connectionString: process.env.DATABASE_URL });

      try {
        console.log("[migrate] الاتصال بقاعدة البيانات عبر Neon/Postgres.");

        const client = await pool.connect();

        try {
          await client.query(`
            CREATE TABLE IF NOT EXISTS __custom_migrations (
              name TEXT PRIMARY KEY,
              applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);

          if (!fs.existsSync(MIGRATIONS_DIR)) {
            console.log("[migrate] مجلد الترحيلات غير موجود، تخطي.");
            return;
          }

          const files = fs
            .readdirSync(MIGRATIONS_DIR)
            .filter((f) => f.endsWith(".sql") && !f.endsWith(".sql.disabled"))
            .sort();

          for (const file of files) {
            const result = await client.query(
              "SELECT name FROM __custom_migrations WHERE name = $1",
              [file]
            );

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
              const normalizedStatement = statement.replace(
                /DROP TABLE\s+`([^`]+)`/gi,
                "DROP TABLE IF EXISTS \"$1\""
              );
              await client.query(normalizedStatement);
            }

            await client.query("INSERT INTO __custom_migrations (name) VALUES ($1);", [file]);
          }

          console.log("[migrate] اكتمل تطبيق كل الترحيلات ✔");
        } finally {
          client.release();
        }
      } finally {
        await pool.end();
      }
    })();
  }

  return migrationPromise;
}

async function main() {
  await runMigrations();
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[migrate] خطأ أثناء الترحيل:", err);
      process.exit(1);
    });
}
