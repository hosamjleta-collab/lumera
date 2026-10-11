import fs from "fs";
import path from "path";
import { config } from "dotenv";
config({ path: ".env.local" });
import { Pool } from "@neondatabase/serverless";

const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");
let migrationPromise: Promise<void> | null = null;

function sanitizeSqlForPostgres(statement: string) {
  return statement
    .replace(/`([^`]+)`/g, '"$1"')
    .replace(/\s*;\s*$/g, ";")
    .trim();
}

export function runMigrations() {
  if (!migrationPromise) {
    migrationPromise = (async () => {
      const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error("DATABASE_URL is required for migrations.");
      }

      const pool = new Pool({ connectionString });

      try {
        console.log("[migrate] connecting to Neon/Postgres...");

        const client = await pool.connect();

        try {
          await client.query(`
            CREATE TABLE IF NOT EXISTS __custom_migrations (
              name TEXT PRIMARY KEY,
              applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);

          if (!fs.existsSync(MIGRATIONS_DIR)) {
            console.log("[migrate] migrations directory not found, skipping.");
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
              console.log(`[migrate] already applied: ${file}, skipping.`);
              continue;
            }

            const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
            const statements = content
              .split("--> statement-breakpoint")
              .map((s) => s.trim())
              .filter(Boolean);

            console.log(`[migrate] applying ${file} (${statements.length} statements)...`);
            for (const statement of statements) {
              const normalizedStatement = sanitizeSqlForPostgres(statement);
              await client.query(normalizedStatement);
            }

            await client.query("INSERT INTO __custom_migrations (name) VALUES ($1);", [file]);
          }

          console.log("[migrate] all migrations applied.");
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
      console.error("[migrate] error during migration:", err);
      process.exit(1);
    });
}
