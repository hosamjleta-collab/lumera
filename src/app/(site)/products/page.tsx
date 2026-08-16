import { getProducts, getCategories } from "@/lib/data";
import ProductCard from "@/components/site/ProductCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  category?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const pageSize = 24;

  const [categories, { items, total }] = await Promise.all([
    getCategories(),
    getProducts({
      search: sp.q,
      categorySlug: sp.category,
      sort: (sp.sort as "newest" | "price_asc" | "price_desc" | "rating") || "newest",
      minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { ...sp, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    return `/products?${params.toString()}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-2">
        {sp.q ? `نتائج البحث عن "${sp.q}"` : "كل المنتجات"}
      </h1>
      <p className="text-sm text-charcoal/60 mb-6">{total} منتج</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* الفلاتر */}
        <aside className="md:col-span-1">
          <div className="bg-white rounded-2xl card-shadow p-5 sticky top-24">
            <h3 className="font-semibold mb-3">التصنيفات</h3>
            <ul className="space-y-2 text-sm mb-6">
              <li>
                <Link
                  href={buildUrl({ category: undefined, page: undefined })}
                  className={!sp.category ? "text-gold font-semibold" : "text-charcoal/70 hover:text-gold"}
                >
                  الكل
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={buildUrl({ category: c.slug, page: undefined })}
                    className={sp.category === c.slug ? "text-gold font-semibold" : "text-charcoal/70 hover:text-gold"}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="font-semibold mb-3">الترتيب</h3>
            <ul className="space-y-2 text-sm">
              {[
                { key: "newest", label: "الأحدث" },
                { key: "price_asc", label: "السعر: من الأقل" },
                { key: "price_desc", label: "السعر: من الأعلى" },
                { key: "rating", label: "الأعلى تقييمًا" },
              ].map((s) => (
                <li key={s.key}>
                  <Link
                    href={buildUrl({ sort: s.key, page: undefined })}
                    className={
                      (sp.sort || "newest") === s.key
                        ? "text-gold font-semibold"
                        : "text-charcoal/70 hover:text-gold"
                    }
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>

            <form action="/products" method="get" className="mt-6">
              {sp.q && <input type="hidden" name="q" value={sp.q} />}
              {sp.category && <input type="hidden" name="category" value={sp.category} />}
              <h3 className="font-semibold mb-3">نطاق السعر</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="من"
                  defaultValue={sp.minPrice}
                  className="w-full border border-charcoal/15 rounded-lg px-2 py-1.5 text-sm"
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="إلى"
                  defaultValue={sp.maxPrice}
                  className="w-full border border-charcoal/15 rounded-lg px-2 py-1.5 text-sm"
                />
              </div>
              <button type="submit" className="w-full mt-3 btn-gold rounded-full py-2 text-sm font-medium">
                تطبيق
              </button>
            </form>
          </div>
        </aside>

        {/* النتائج */}
        <div className="md:col-span-3">
          {items.length === 0 ? (
            <div className="bg-white rounded-2xl card-shadow p-10 text-center text-charcoal/60">
              لا توجد منتجات مطابقة لبحثك.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildUrl({ page: String(p) })}
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-sm ${
                    p === page ? "btn-gold" : "bg-white text-charcoal/70 hover:bg-blush/20"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
