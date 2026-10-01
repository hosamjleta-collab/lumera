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

if (process.env.DATABASE_URL) {
  void runMigrations().catch((error) => {
    console.error("[db] فشل تشغيل الترحيلات عند بداية التطبيق:", error);
  });
}