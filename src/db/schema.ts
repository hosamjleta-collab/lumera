import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// المستخدمون (عملاء / موردون / إدارة) - جدول موحد بحقل role
// ---------------------------------------------------------------------------
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["customer", "supplier", "admin"] })
    .notNull()
    .default("customer"),
  status: text("status", { enum: ["active", "pending", "suspended"] })
    .notNull()
    .default("active"), // للموردين: pending حتى توافق الإدارة
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// بيانات المورد الإضافية (تُنشأ عند تسجيل مورد جديد)
// ---------------------------------------------------------------------------
export const supplierProfiles = sqliteTable("supplier_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  storeName: text("store_name").notNull(),
  storeDescription: text("store_description"),
  bankAccountInfo: text("bank_account_info"), // معلومات استلام المورد لأرباحه (نصية حاليًا)
  approved: integer("approved", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// عناوين العملاء
// ---------------------------------------------------------------------------
export const addresses = sqliteTable("addresses", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull().default("المنزل"),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  area: text("area"),
  addressLine: text("address_line").notNull(),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// التصنيفات
// ---------------------------------------------------------------------------
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// إعدادات العمولة (تتحكم بها الإدارة، ممكن تكون نسبة افتراضية عامة أو لكل تصنيف)
// ---------------------------------------------------------------------------
export const commissionSettings = sqliteTable("commission_settings", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }), // null = عمولة افتراضية عامة
  percentage: real("percentage").notNull(), // مثال: 20 تعني 20%
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// المنتجات
// ---------------------------------------------------------------------------
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  supplierId: text("supplier_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  brand: text("brand"),
  description: text("description"),
  supplierPrice: real("supplier_price").notNull(), // سعر المورد
  commissionPercentage: real("commission_percentage").notNull(), // العمولة وقت إضافة/تعديل المنتج
  sellingPrice: real("selling_price").notNull(), // يُحسب تلقائيًا = supplierPrice * (1 + commission/100)
  stock: integer("stock").notNull().default(0),
  images: text("images").notNull().default("[]"), // JSON array of paths
  status: text("status", {
    enum: ["pending", "approved", "rejected"],
  })
    .notNull()
    .default("pending"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  rating: real("rating").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// عربة التسوق
// ---------------------------------------------------------------------------
export const cartItems = sqliteTable("cart_items", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// الطلبات
// ---------------------------------------------------------------------------
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  referenceNumber: text("reference_number").notNull().unique(), // رقم مرجعي يظهر للعميل
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  addressId: text("address_id").references(() => addresses.id),
  status: text("status", {
    enum: [
      "new",
      "awaiting_payment",
      "proof_uploaded",
      "payment_review",
      "payment_confirmed",
      "processing",
      "shipped",
      "completed",
      "cancelled",
    ],
  })
    .notNull()
    .default("new"),
  subtotal: real("subtotal").notNull(),
  total: real("total").notNull(),
  customerNote: text("customer_note"),
  adminNote: text("admin_note"),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// تفاصيل الطلب - نحفظ سعر المورد والعمولة وسعر البيع وقت الطلب (لا تتأثر بتغييرات لاحقة)
// ---------------------------------------------------------------------------
export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  supplierId: text("supplier_id")
    .notNull()
    .references(() => users.id),
  productName: text("product_name").notNull(), // نسخة ثابتة من الاسم وقت الشراء
  productImage: text("product_image"),
  quantity: integer("quantity").notNull(),
  supplierPrice: real("supplier_price").notNull(), // سعر المورد وقت الطلب
  commissionPercentage: real("commission_percentage").notNull(), // العمولة وقت الطلب
  sellingPrice: real("selling_price").notNull(), // سعر البيع للعميل وقت الطلب
  lineTotal: real("line_total").notNull(), // sellingPrice * quantity
});

// ---------------------------------------------------------------------------
// المدفوعات (سجل الدفعة المرتبطة بالطلب)
// ---------------------------------------------------------------------------
export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  method: text("method").notNull().default("bank_transfer"),
  status: text("status", {
    enum: ["pending", "under_review", "approved", "rejected"],
  })
    .notNull()
    .default("pending"),
  reviewedBy: text("reviewed_by").references(() => users.id),
  reviewedAt: text("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// إثباتات الدفع (يمكن رفع أكثر من إثبات لنفس الطلب لو رُفض الأول)
// ---------------------------------------------------------------------------
export const paymentProofs = sqliteTable("payment_proofs", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  imagePath: text("image_path").notNull(),
  note: text("note"),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// الإشعارات
// ---------------------------------------------------------------------------
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  link: text("link"),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
});

// ---------------------------------------------------------------------------
// إعدادات الموقع العامة (بيانات الحساب البنكي المعروضة للعملاء وغيرها)
// ---------------------------------------------------------------------------
export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
