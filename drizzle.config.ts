import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const preferredDataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const fallbackDbPath = path.join(preferredDataDir, 'lumera.db');
const rawDatabaseUrl = (process.env.DATABASE_URL || '').trim();
const isLegacyPostgresUrl = Boolean(
  rawDatabaseUrl && (rawDatabaseUrl.startsWith('postgres') || rawDatabaseUrl.includes('sslmode='))
);
const sqliteDatabaseUrl = isLegacyPostgresUrl
  ? fallbackDbPath
  : rawDatabaseUrl.startsWith('file:')
    ? rawDatabaseUrl.replace(/^file:/, '')
    : rawDatabaseUrl || fallbackDbPath;

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: sqliteDatabaseUrl,
  },
});