import { db } from "@/db";
import {
  products,
  categories,
  cartItems,
  users,
  supplierProfiles,
  orders,
  orderItems,
  commissionSettings,
  siteSettings,
} from "@/db/schema";
import { eq, and, desc, sql, like, or, inArray } from "drizzle-orm";

export async function getCategories() {
  return db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryBySlug(slug: string) {
  const rows = await db.select().from(categories).where(eq(categories.slug, slug));
  return rows[0] || null;
}

type ProductFilters = {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "rating";
  limit?: number;
  offset?: number;
};

export async function getProducts(filters: ProductFilters = {}) {
  const conditions = [eq(products.status, "approved"), eq(products.isActive, true)];

  if (filters.categorySlug) {
    const cat = await getCategoryBySlug(filters.categorySlug);
    if (cat) conditions.push(eq(products.categoryId, cat.id));
    else return { items: [], total: 0 };
  }
  if (filters.search) {
    conditions.push(
      or(
        like(products.name, `%${filters.search}%`),
        like(products.brand, `%${filters.search}%`)
      )!
    );
  }
  if (filters.minPrice !== undefined) {
    conditions.push(sql`${products.sellingPrice} >= ${filters.minPrice}`);
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(sql`${products.sellingPrice} <= ${filters.maxPrice}`);
  }

  const whereClause = and(...conditions);

  let orderBy = desc(products.createdAt);
  if (filters.sort === "price_asc") orderBy = products.sellingPrice as unknown as ReturnType<typeof desc>;
  if (filters.sort === "price_desc") orderBy = desc(products.sellingPrice);
  if (filters.sort === "rating") orderBy = desc(products.rating);

  const items = await db
    .select()
    .from(products)
    .where(whereClause)
    .orderBy(filters.sort === "price_asc" ? products.sellingPrice : orderBy)
    .limit(filters.limit ?? 24)
    .offset(filters.offset ?? 0);

  const totalRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(whereClause);

  return { items, total: totalRes[0]?.count ?? 0 };
}

export async function getFeaturedProducts(limit = 8) {
  return db
    .select()
    .from(products)
    .where(and(eq(products.status, "approved"), eq(products.isActive, true), eq(products.isFeatured, true)))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function getNewProducts(limit = 8) {
  return db
    .select()
    .from(products)
    .where(and(eq(products.status, "approved"), eq(products.isActive, true)))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function getBestSellingProducts(limit = 8) {
  return db
    .select()
    .from(products)
    .where(and(eq(products.status, "approved"), eq(products.isActive, true)))
    .orderBy(desc(products.ratingCount))
    .limit(limit);
}

export async function getProductBySlug(slug: string) {
  const rows = await db.select().from(products).where(eq(products.slug, slug));
  return rows[0] || null;
}

export async function getProductById(id: string) {
  const rows = await db.select().from(products).where(eq(products.id, id));
  return rows[0] || null;
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 4) {
  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.categoryId, categoryId),
        eq(products.status, "approved"),
        eq(products.isActive, true),
        sql`${products.id} != ${excludeId}`
      )
    )
    .limit(limit);
}

export async function getCartWithProducts(userId: string) {
  const rows = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      product: products,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));
  return rows;
}

export async function getCartCount(userId: string) {
  const res = await db
    .select({ total: sql<number>`coalesce(sum(${cartItems.quantity}), 0)` })
    .from(cartItems)
    .where(eq(cartItems.userId, userId));
  return res[0]?.total ?? 0;
}

export async function getActiveCommissionPercentage(categoryId?: string) {
  if (categoryId) {
    const specific = await db
      .select()
      .from(commissionSettings)
      .where(eq(commissionSettings.categoryId, categoryId));
    if (specific[0]) return specific[0].percentage;
  }
  const general = await db.select().from(commissionSettings).where(sql`${commissionSettings.categoryId} IS NULL`);
  return general[0]?.percentage ?? 20;
}

export async function getSiteSettings() {
  const rows = await db.select().from(siteSettings);
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}

export async function getUserOrders(userId: string) {
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getOrderWithItems(orderId: string) {
  const orderRows = await db.select().from(orders).where(eq(orders.id, orderId));
  const order = orderRows[0];
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  return { order, items };
}

export async function getSupplierProfile(userId: string) {
  const rows = await db.select().from(supplierProfiles).where(eq(supplierProfiles.userId, userId));
  return rows[0] || null;
}

export async function getUserByEmail(email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email));
  return rows[0] || null;
}

export async function getUserById(id: string) {
  const rows = await db.select().from(users).where(eq(users.id, id));
  return rows[0] || null;
}

// ---------------------------------------------------------------------------
// دوال المورد
// ---------------------------------------------------------------------------
export async function getSupplierProducts(supplierId: string) {
  return db
    .select()
    .from(products)
    .where(eq(products.supplierId, supplierId))
    .orderBy(desc(products.createdAt));
}

export async function getSupplierOrderItems(supplierId: string) {
  const rows = await db
    .select({
      item: orderItems,
      order: orders,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(eq(orderItems.supplierId, supplierId))
    .orderBy(desc(orders.createdAt));
  return rows;
}

export async function getSupplierStats(supplierId: string) {
  const productCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.supplierId, supplierId));

  const salesRows = await db
    .select({
      totalSales: sql<number>`coalesce(sum(${orderItems.lineTotal}), 0)`,
      totalProfit: sql<number>`coalesce(sum(${orderItems.supplierPrice} * ${orderItems.quantity}), 0)`,
      orderCount: sql<number>`count(distinct ${orderItems.orderId})`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orderItems.supplierId, supplierId),
        inArray(orders.status, ["payment_confirmed", "processing", "shipped", "completed"])
      )
    );

  return {
    productCount: productCount[0]?.count ?? 0,
    totalSales: salesRows[0]?.totalSales ?? 0, // ما دفعه العميل لمنتجات هذا المورد
    supplierEarnings: salesRows[0]?.totalProfit ?? 0, // ما يستحقه المورد (سعره الأساسي)
    orderCount: salesRows[0]?.orderCount ?? 0,
  };
}

// ---------------------------------------------------------------------------
// دوال الإدارة
// ---------------------------------------------------------------------------
export async function getAllSuppliers() {
  const rows = await db
    .select({ supplier: supplierProfiles, user: users })
    .from(supplierProfiles)
    .innerJoin(users, eq(supplierProfiles.userId, users.id))
    .orderBy(desc(supplierProfiles.createdAt));
  return rows;
}

export async function getAllCustomers() {
  return db.select().from(users).where(eq(users.role, "customer")).orderBy(desc(users.createdAt));
}

export async function getAllProductsAdmin(status?: "pending" | "approved" | "rejected") {
  if (status) {
    return db.select().from(products).where(eq(products.status, status)).orderBy(desc(products.createdAt));
  }
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getAllOrdersAdmin() {
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getAdminStats() {
  const totalSales = await db
    .select({ total: sql<number>`coalesce(sum(${orders.total}), 0)` })
    .from(orders)
    .where(inArray(orders.status, ["payment_confirmed", "processing", "shipped", "completed"]));

  const totalOrders = await db.select({ count: sql<number>`count(*)` }).from(orders);
  const pendingProducts = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.status, "pending"));
  const pendingSuppliers = await db
    .select({ count: sql<number>`count(*)` })
    .from(supplierProfiles)
    .where(eq(supplierProfiles.approved, false));
  const totalCustomers = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "customer"));

  const commissionRows = await db
    .select({
      totalCommission: sql<number>`coalesce(sum((${orderItems.sellingPrice} - ${orderItems.supplierPrice}) * ${orderItems.quantity}), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(inArray(orders.status, ["payment_confirmed", "processing", "shipped", "completed"]));

  return {
    totalSales: totalSales[0]?.total ?? 0,
    totalOrders: totalOrders[0]?.count ?? 0,
    pendingProducts: pendingProducts[0]?.count ?? 0,
    pendingSuppliers: pendingSuppliers[0]?.count ?? 0,
    totalCustomers: totalCustomers[0]?.count ?? 0,
    totalCommission: commissionRows[0]?.totalCommission ?? 0,
  };
}

export async function getPendingPayments() {
  return db
    .select({
      order: orders,
    })
    .from(orders)
    .where(inArray(orders.status, ["proof_uploaded", "payment_review"]))
    .orderBy(desc(orders.updatedAt));
}
