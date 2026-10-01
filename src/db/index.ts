import "dotenv/config";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import { runMigrations } from "./migrate";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for Neon/Postgres runtime.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
export const sql = pool;

if (process.env.DATABASE_URL && process.env.RUN_DB_MIGRATIONS === "true") {
  void runMigrations().catch((error) => {
    console.error("[db] تم تعطيل التشغيل التلقائي للترحيلات. استخدم RUN_DB_MIGRATIONS=true أو npm run db:migrate يدويًا.", error);
  });
} else if (process.env.DATABASE_URL) {
  console.log("[db] تم تعطيل الترحيلات التلقائية أثناء التشغيل/البناء.");
}