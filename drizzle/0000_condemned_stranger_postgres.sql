CREATE TABLE "addresses" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "label" text DEFAULT 'المنزل' NOT NULL,
  "full_name" text NOT NULL,
  "phone" text NOT NULL,
  "city" text NOT NULL,
  "area" text,
  "address_line" text NOT NULL,
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "cart_items" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "product_id" text NOT NULL,
  "quantity" integer DEFAULT 1 NOT NULL,
  "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "categories" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "image" text,
  "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX "categories_slug_unique" ON "categories" ("slug");

CREATE TABLE "commission_settings" (
  "id" text PRIMARY KEY NOT NULL,
  "category_id" text,
  "percentage" real NOT NULL,
  "updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "notifications" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "is_read" boolean DEFAULT false NOT NULL,
  "link" text,
  "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "order_items" (
  "id" text PRIMARY KEY NOT NULL,
  "order_id" text NOT NULL,
  "product_id" text NOT NULL,
  "supplier_id" text NOT NULL,
  "product_name" text NOT NULL,
  "product_image" text,
  "quantity" integer NOT NULL,
  "supplier_price" real NOT NULL,
  "commission_percentage" real NOT NULL,
  "selling_price" real NOT NULL,
  "line_total" real NOT NULL
);

CREATE TABLE "orders" (
  "id" text PRIMARY KEY NOT NULL,
  "reference_number" text NOT NULL,
  "user_id" text NOT NULL,
  "address_id" text,
  "status" text DEFAULT 'new' NOT NULL,
  "subtotal" real NOT NULL,
  "total" real NOT NULL,
  "customer_note" text,
  "admin_note" text,
  "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX "orders_reference_number_unique" ON "orders" ("reference_number");

CREATE TABLE "payment_proofs" (
  "id" text PRIMARY KEY NOT NULL,
  "order_id" text NOT NULL,
  "image_path" text NOT NULL,
  "note" text,
  "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "payments" (
  "id" text PRIMARY KEY NOT NULL,
  "order_id" text NOT NULL,
  "amount" real NOT NULL,
  "method" text DEFAULT 'bank_transfer' NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "reviewed_by" text,
  "reviewed_at" text,
  "rejection_reason" text,
  "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX "payments_order_id_unique" ON "payments" ("order_id");

CREATE TABLE "products" (
  "id" text PRIMARY KEY NOT NULL,
  "supplier_id" text NOT NULL,
  "category_id" text NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "brand" text,
  "description" text,
  "supplier_price" real NOT NULL,
  "commission_percentage" real NOT NULL,
  "selling_price" real NOT NULL,
  "stock" integer DEFAULT 0 NOT NULL,
  "images" text DEFAULT '[]' NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "is_featured" boolean DEFAULT false NOT NULL,
  "rating" real DEFAULT 0 NOT NULL,
  "rating_count" integer DEFAULT 0 NOT NULL,
  "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX "products_slug_unique" ON "products" ("slug");

CREATE TABLE "site_settings" (
  "key" text PRIMARY KEY NOT NULL,
  "value" text NOT NULL
);

CREATE TABLE "supplier_profiles" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "store_name" text NOT NULL,
  "store_description" text,
  "bank_account_info" text,
  "approved" boolean DEFAULT false NOT NULL,
  "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX "supplier_profiles_user_id_unique" ON "supplier_profiles" ("user_id");

CREATE TABLE "users" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "password_hash" text NOT NULL,
  "role" text DEFAULT 'customer' NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email");

ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "commission_settings" ADD CONSTRAINT "commission_settings_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_supplier_id_users_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payments" ADD CONSTRAINT "payments_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_users_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "supplier_profiles" ADD CONSTRAINT "supplier_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
