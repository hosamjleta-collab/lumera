// يُشغَّل تلقائيًا قبل بدء السيرفر (انظري package.json -> "start").
// الهدف: إذا كان المشروع يعمل على Railway (أو أي استضافة توفر قرص تخزين دائم
// عبر متغير البيئة DATA_DIR)، يجهّز هذا السكربت المجلدات اللازمة، ويجعل مجلد
// public/uploads رابطًا رمزيًا (symlink) يشير إلى القرص الدائم، حتى لا تُفقد
// صور المنتجات وإثباتات الدفع مع كل عملية نشر جديدة.
//
// إذا كنتِ تشغّلين المشروع محليًا على جهازك (بدون DATA_DIR)، هذا السكربت
// لا يفعل شيئًا ولا يؤثر على شيء.

const fs = require("fs");
const path = require("path");

const configuredDataDir = process.env.DATA_DIR;

if (!configuredDataDir) {
  console.log("[prepare-volume] DATA_DIR غير مضبوط - تشغيل محلي عادي، لا حاجة لإعداد إضافي.");
  process.exit(0);
}

let dataDir = configuredDataDir;
try {
  fs.mkdirSync(dataDir, { recursive: true });
} catch {
  dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`[prepare-volume] DATA_DIR غير قابل للكتابة، تم التبديل إلى: ${dataDir}`);
}

const dbDir = path.join(dataDir, "db");
const uploadsDir = path.join(dataDir, "uploads");
const publicUploadsPath = path.join(process.cwd(), "public", "uploads");

fs.mkdirSync(dbDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(path.join(uploadsDir, "products"), { recursive: true });
fs.mkdirSync(path.join(uploadsDir, "payment-proofs"), { recursive: true });

// إذا كان public/uploads موجودًا كمجلد عادي (وليس رابطًا رمزيًا)، نحذفه لنستبدله برابط
try {
  const stat = fs.lstatSync(publicUploadsPath);
  if (!stat.isSymbolicLink()) {
    fs.rmSync(publicUploadsPath, { recursive: true, force: true });
  }
} catch {
  // المسار غير موجود أصلاً، لا مشكلة
}

if (!fs.existsSync(publicUploadsPath)) {
  fs.symlinkSync(uploadsDir, publicUploadsPath, "dir");
  console.log(`[prepare-volume] تم ربط public/uploads -> ${uploadsDir}`);
} else {
  console.log("[prepare-volume] public/uploads مرتبط مسبقًا بالتخزين الدائم.");
}

console.log(`[prepare-volume] قاعدة البيانات ستُحفظ في: ${path.join(dbDir, "lumera.db")}`);
