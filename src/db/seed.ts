import { db } from "./index";
import { users, supplierProfiles, categories, products, commissionSettings, siteSettings } from "./schema";
import { generateId, calculateSellingPrice } from "../lib/utils";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

async function executeSqlStatements(sqlText: string) {
  const statements = sqlText
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await db.execute(sql.raw(statement));
  }
}

async function seed() {
  console.log("بدء زراعة البيانات التجريبية...");

  // تنظيف الجداول (لإعادة التشغيل بأمان)
  await executeSqlStatements(`
    DELETE FROM order_items; DELETE FROM orders; DELETE FROM payment_proofs; DELETE FROM payments;
    DELETE FROM cart_items; DELETE FROM notifications; DELETE FROM products; DELETE FROM addresses;
    DELETE FROM commission_settings; DELETE FROM categories; DELETE FROM supplier_profiles;
    DELETE FROM users; DELETE FROM site_settings;
  `);

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // ---- المستخدمون ----
  const adminId = generateId("usr");
  const supplierUserId = generateId("usr");
  const supplier2Id = generateId("usr");
  const customerId = generateId("usr");

  await db.insert(users).values([
    {
      id: adminId,
      name: "مدير المنصة",
      email: "admin@lumera.test",
      passwordHash,
      role: "admin",
      status: "active",
    },
    {
      id: supplierUserId,
      name: "متجر روز الذهبي",
      email: "supplier1@lumera.test",
      passwordHash,
      role: "supplier",
      status: "active",
    },
    {
      id: supplier2Id,
      name: "متجر لمسة جمال",
      email: "supplier2@lumera.test",
      passwordHash,
      role: "supplier",
      status: "active",
    },
    {
      id: customerId,
      name: "عميلة تجريبية",
      email: "customer@lumera.test",
      passwordHash,
      role: "customer",
      status: "active",
    },
  ]);

  await db.insert(supplierProfiles).values([
    {
      id: generateId("sup"),
      userId: supplierUserId,
      storeName: "روز الذهبي لمستحضرات التجميل",
      storeDescription: "متخصصون في منتجات العناية بالبشرة الفاخرة",
      approved: true,
    },
    {
      id: generateId("sup"),
      userId: supplier2Id,
      storeName: "لمسة جمال",
      storeDescription: "مكياج وعطور مختارة بعناية",
      approved: true,
    },
  ]);

  // ---- التصنيفات ----
  const catData = [
    { name: "المكياج", slug: "makeup" },
    { name: "العناية بالبشرة", slug: "skincare" },
    { name: "العطور", slug: "perfumes" },
    { name: "العناية بالشعر", slug: "haircare" },
    { name: "منتجات أخرى", slug: "other" },
  ];
  const catIds: Record<string, string> = {};
  for (const c of catData) {
    const id = generateId("cat");
    catIds[c.slug] = id;
    await db.insert(categories).values({ id, name: c.name, slug: c.slug });
  }

  // ---- إعداد العمولة الافتراضية ----
  await db.insert(commissionSettings).values({
    id: generateId("com"),
    categoryId: null,
    percentage: 25,
  });

  // ---- إعدادات الموقع (بيانات التحويل البنكي) ----
  await db.insert(siteSettings).values([
    { key: "bank_name", value: "مصرف الجمهورية" },
    { key: "account_holder", value: "حسام ابراهيم نصر جليطة" },
    { key: "account_number", value: "141206000004280" },
    { key: "iban", value: "LY05002141141206000004280" },
    { key: "contact_phone", value: "+218-94-536-7328" },
    { key: "contact_email", value: "HOSAM@lumera.test" },
  ]);

  // ---- المنتجات ----
  const sampleProducts = [
    { name: "أحمر شفاه مطفي - وردي دافئ", cat: "makeup", brand: "Lumera Beauty", price: 35, supplier: supplierUserId, featured: true },
    { name: "باليت ظلال عيون فاخرة", cat: "makeup", brand: "Rose Gold", price: 95, supplier: supplier2Id, featured: true },
    { name: "كريم أساس طويل الثبات", cat: "makeup", brand: "Lumera Beauty", price: 60, supplier: supplierUserId, featured: false },
    { name: "سيروم فيتامين C للوجه", cat: "skincare", brand: "GlowLab", price: 80, supplier: supplierUserId, featured: true },
    { name: "كريم مرطب ليلي بالكولاجين", cat: "skincare", brand: "GlowLab", price: 70, supplier: supplierUserId, featured: false },
    { name: "غسول وجه لطيف بالصبار", cat: "skincare", brand: "Pure Aloe", price: 40, supplier: supplier2Id, featured: false },
    { name: "عطر ورد دمشقي فاخر", cat: "perfumes", brand: "Lumera Oud", price: 150, supplier: supplier2Id, featured: true },
    { name: "عطر عود ملكي 50 مل", cat: "perfumes", brand: "Lumera Oud", price: 220, supplier: supplier2Id, featured: false },
    { name: "زيت أرغان للشعر الجاف", cat: "haircare", brand: "Nature Touch", price: 45, supplier: supplierUserId, featured: false },
    { name: "شامبو معالج لتساقط الشعر", cat: "haircare", brand: "Nature Touch", price: 55, supplier: supplierUserId, featured: true },
    { name: "فرش مكياج احترافية (طقم 8 قطع)", cat: "other", brand: "Lumera Tools", price: 65, supplier: supplier2Id, featured: false },
    { name: "مرآة مكياج مضيئة LED", cat: "other", brand: "Lumera Tools", price: 120, supplier: supplierUserId, featured: false },
  ];

  const commission = 25;
  for (const p of sampleProducts) {
    const id = generateId("prd");
    const sellingPrice = calculateSellingPrice(p.price, commission);
    await db.insert(products).values({
      id,
      supplierId: p.supplier,
      categoryId: catIds[p.cat],
      name: p.name,
      slug: `${id}`,
      brand: p.brand,
      description: `${p.name} - منتج أصلي بجودة عالية من ${p.brand}. مناسب لجميع أنواع البشرة والاستخدام اليومي.`,
      supplierPrice: p.price,
      commissionPercentage: commission,
      sellingPrice,
      stock: Math.floor(20 + Math.random() * 80),
      images: JSON.stringify([]),
      status: "approved",
      isActive: true,
      isFeatured: p.featured,
      rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      ratingCount: Math.floor(5 + Math.random() * 120),
    });
  }

  console.log("تمت الزراعة بنجاح ✔");
  console.log("---------------------------------------------");
  console.log("حسابات تجريبية (كلمة المرور للجميع: Password123!)");
  console.log("مدير:   admin@lumera.test");
  console.log("مورد 1: supplier1@lumera.test");
  console.log("مورد 2: supplier2@lumera.test");
  console.log("عميل:   customer@lumera.test");
  console.log("---------------------------------------------");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
