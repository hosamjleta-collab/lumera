import type { Config } from "drizzle-kit";

const dbPath = process.env.DATABASE_PATH || "./data/lumera.db";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: dbPath,
  },
} satisfies Config;
