import { config } from "dotenv";
config({ path: ".env.local" });
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import { runMigrations } from "./migrate";

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for Neon/Postgres runtime.");
}

const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
export const sql = pool;

if (connectionString && process.env.RUN_DB_MIGRATIONS === "true") {
  void runMigrations().catch((error) => {
    console.error("[db] automatic migrations disabled. Use RUN_DB_MIGRATIONS=true or npm run db:migrate.", error);
  });
} else if (connectionString) {
  console.log("[db] automatic migrations disabled during build/startup.");
}
