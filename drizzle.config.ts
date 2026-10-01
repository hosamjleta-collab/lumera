import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const rawDatabaseUrl = process.env.DATABASE_URL || './data/lumera.db';
const sqliteDatabaseUrl = rawDatabaseUrl.startsWith('file:')
  ? rawDatabaseUrl.replace(/^file:/, '')
  : rawDatabaseUrl;

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: sqliteDatabaseUrl,
  },
});