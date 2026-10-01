import fs from "fs";
import path from "path";
import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const preferredDataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
const fallbackDataDir = (() => {
  try {
    fs.mkdirSync(preferredDataDir, { recursive: true });
    return preferredDataDir;
  } catch {
    const localFallback = path.join(process.cwd(), "data");
    fs.mkdirSync(localFallback, { recursive: true });
    return localFallback;
  }
})();
const fallbackDbPath = path.join(fallbackDataDir, "lumera.db");

const rawDatabaseUrl = (process.env.DATABASE_URL || "").trim();
const isLegacyPostgresUrl = Boolean(
  rawDatabaseUrl && (rawDatabaseUrl.startsWith("postgres") || rawDatabaseUrl.includes("sslmode="))
);
const normalizedDatabaseUrl = isLegacyPostgresUrl
  ? `file:${fallbackDbPath.replace(/\\/g, "/")}`
  : rawDatabaseUrl.startsWith("file:")
    ? rawDatabaseUrl
    : rawDatabaseUrl
      ? `file:${path.resolve(rawDatabaseUrl).replace(/\\/g, "/")}`
      : `file:${fallbackDbPath.replace(/\\/g, "/")}`;

export const sqlite = createClient({ url: normalizedDatabaseUrl });
export const db = drizzle(sqlite, { schema });