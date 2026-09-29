import {
  pgTable,
  text,
  integer,
  doublePrecision,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// المستخدمون (عملاء / موردون / إدارة) - إمكانية التسجيل بالإيميل أو الهاتف
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(), // اختياري للتسجيل بالهاتف
  phone: text("phone").unique(), // إضافة حقل رقم الهاتف
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["customer", "supplier", "admin"] })
    .notNull()
    .default("customer"),
  status: text("status", { enum: ["active", "pending", "suspended"] })
    .notNull()
    .default("active"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------------------------------------
// بيانات المورد الإضافية
// ---------------------------------------------------------------------------
export const supplierProfiles = pgTable("supplier_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  storeName: text("store_name").notNull(),
  storeDescription: text("store_description"),
  bankAccountInfo: text("bank_account_info"),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------------------------------------
// عناوين العملاء
// ---------------------------------------------------------------------------
export const addresses = pgTable("addresses", {
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
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------------------------------------
// التصنيفات
// ---------------------------------------------------------------------------
export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------------------------------------
// إعدادات العمولة
// ---------------------------------------------------------------------------
export const commissionSettings = pgTable("commission_settings", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  percentage: doublePrecision("percentage").notNull(),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------------------------------------
// المنتجات
// ---------------------------------------------------------------------------
export const products = pgTable("products", {
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
  supplierPrice: doublePrecision("supplier_price").notNull(),
  commissionPercentage: doublePrecision("commission_percentage").notNull(),
  sellingPrice: doublePrecision("selling_price").notNull(),
  stock: integer("stock").notNull().default(0),
  images: text("images").notNull().default("[]"),
  status: text("status", {
    enum: ["pending", "approved", "rejected"],
  })
    .notNull()
    .default("pending"),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  rating: doublePrecision("rating").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------------------------------------
// عربة التسوق
// ---------------------------------------------------------------------------
export const cartItems = pgTable("cart_items", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------------------------------------
// الطلبات
// ---------------------------------------------------------------------------
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  referenceNumber: text("reference_number").notNull().unique(),
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
  subtotal: doublePrecision("subtotal").notNull(),
  total: doublePrecision("total").notNull(),
  customerNote: text("customer_note"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------------------------------------
// تفاصيل الطلب
// ---------------------------------------------------------------------------
export const orderItems = pgTable("order_items", {
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
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
  quantity: integer("quantity").notNull(),
  supplierPrice: doublePrecision("supplier_price").notNull(),
  commissionPercentage: doublePrecision("commission_percentage").notNull(),
  sellingPrice: doublePrecision("selling_price").notNull(),
  lineTotal: doublePrecision("line_total").notNull(),
});

// ---------------------------------------------------------------------------
// المدفوعات
// ---------------------------------------------------------------------------
export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: "cascade" }),
  amount: doublePrecision("amount").notNull(),
  method: text("method").notNull().default("bank_transfer"),
  status: text("status", {
    enum: ["pending", "under_review", "approved", "rejected"],
  })
    .notNull()
    .default("pending"),
  reviewedBy: text("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------------------------------------
// إثباتات الدفع
// ---------------------------------------------------------------------------
export const paymentProofs = pgTable("payment_proofs", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  imagePath: text("image_path").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------------------------------------
// الإشعارات
// ---------------------------------------------------------------------------
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  link: text("link"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------------------------------------
// إعدادات الموقع العامة
// ---------------------------------------------------------------------------
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});