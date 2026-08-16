import { DatabaseSync } from "node:sqlite";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import path from "path";
import fs from "fs";
import * as schema from "./schema";

// نستخدم node:sqlite (مدمجة داخل Node.js نفسه منذ الإصدار 22.5) بدلاً من
// حزمة better-sqlite3 الخارجية. السبب: better-sqlite3 كود C++ يُترجم خصيصًا
// لمعمارية المعالج، وقد يتعارض بين مرحلة البناء ومرحلة التشغيل الفعلية على
// بعض منصات الاستضافة السحابية (يسبب انهيار Segmentation fault). بما أن
// node:sqlite جزء من Node.js نفسه، فهي متوافقة دائمًا مع أي بيئة تشغيل بدون
// أي عملية "بناء" منفصلة قد تفشل.

let _raw: DatabaseSync | null = null;

function getRawDb(): DatabaseSync {
  if (_raw) return _raw;

  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "lumera.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  _raw = new DatabaseSync(dbPath);
  _raw.exec("PRAGMA journal_mode = WAL;");
  _raw.exec("PRAGMA foreign_keys = ON;");

  return _raw;
}

export const db = drizzle(async (sqlText, params, method) => {
  const raw = getRawDb();
  const stmt = raw.prepare(sqlText);
  stmt.setReturnArrays(true);

  if (method === "run") {
    stmt.run(...(params as unknown as []));
    return { rows: [] };
  }

  if (method === "get") {
    const row = stmt.get(...(params as unknown as []));
    return { rows: row === undefined ? undefined : (row as unknown as unknown[]) } as {
      rows: unknown[];
    };
  }

  // "all" أو "values"
  const rows = stmt.all(...(params as unknown as [])) as unknown as unknown[][];
  return { rows };
}, { schema });

/**
 * واجهة مبسطة لتنفيذ استعلامات SQL خام (تُستخدم فقط في سكربتات الصيانة مثل
 * seed.ts و create-admin.ts و reset-demo.ts و prepare-volume، وليس في كود
 * التطبيق نفسه الذي يجب أن يستخدم `db` أعلاه دائمًا).
 */
export const sqlite = {
  exec(sqlText: string) {
    getRawDb().exec(sqlText);
  },
  query<T = Record<string, unknown>>(sqlText: string, params: unknown[] = []): T[] {
    const stmt = getRawDb().prepare(sqlText);
    return stmt.all(...(params as unknown as [])) as unknown as T[];
  },
};
