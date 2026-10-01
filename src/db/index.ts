import fs from "fs";
import path from "path";
import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const dbDir = path.join(process.cwd(), "data");
fs.mkdirSync(dbDir, { recursive: true });

const dbUrl = process.env.DATABASE_URL || path.join(dbDir, "lumera.db");
const sqliteUrl = dbUrl.startsWith("file:") ? dbUrl : `file:${dbUrl}`;

export const sqlite = createClient({ url: sqliteUrl });
export const db = drizzle(sqlite, { schema });