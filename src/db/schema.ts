import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["customer", "supplier", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "pending", "suspended"]);
export const productStatusEnum = pgEnum("product_status", ["pending", "approved", "rejected"]);
export const orderStatusEnum = pgEnum("order_status", [
  "new",
  "awaiting_payment",
  "proof_uploaded",
  "payment_review",
  "payment_confirmed",
  "processing",
  "shipped",
  "completed",
  "cancelled",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "under_review", "approved", "rejected"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  phone: text("phone").unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("customer"),
  status: userStatusEnum("status").notNull().default("active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

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
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

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
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const commissionSettings = pgTable("commission_settings", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  percentage: real("percentage").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

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
  supplierPrice: real("supplier_price").notNull(),
  commissionPercentage: real("commission_percentage").notNull(),
  sellingPrice: real("selling_price").notNull(),
  stock: integer("stock").notNull().default(0),
  images: text("images").notNull().default("[]"),
  status: productStatusEnum("status").notNull().default("pending"),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  rating: real("rating").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const cartItems = pgTable("cart_items", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  referenceNumber: text("reference_number").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  addressId: text("address_id").references(() => addresses.id),
  status: orderStatusEnum("status").notNull().default("new"),
  subtotal: real("subtotal").notNull(),
  total: real("total").notNull(),
  customerNote: text("customer_note"),
  adminNote: text("admin_note"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

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
  supplierPrice: real("supplier_price").notNull(),
  commissionPercentage: real("commission_percentage").notNull(),
  sellingPrice: real("selling_price").notNull(),
  lineTotal: real("line_total").notNull(),
});

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  method: text("method").notNull().default("bank_transfer"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  reviewedBy: text("reviewed_by").references(() => users.id),
  reviewedAt: text("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const paymentProofs = pgTable("payment_proofs", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  imagePath: text("image_path").notNull(),
  note: text("note"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  link: text("link"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});