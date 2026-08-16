import Link from "next/link";
import ProductCard from "@/components/site/ProductCard";
import {
  getCategories,
  getFeaturedProducts,
  getNewProducts,
  getBestSellingProducts,
} from "@/lib/data";

export const dynamic = "force-dynamic";

const categoryIcons: Record<string, string> = {
  makeup: "💄",
  skincare: "✨",
  perfumes: "🌸",
  haircare: "💆‍♀️",
  other: "🎀",
};

export default async function HomePage() {
  const [categories, featured, newest, bestSelling] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getNewProducts(8),
    getBestSellingProducts(8),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blush/40 to-cream">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 flex flex-col items-center text-center">
          <span className="text-gold tracking-[0.3em] text-sm font-semibold mb-4">LUMERA BEAUTY</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-charcoal leading-tight max-w-2xl">
            جمالك يستحق لمسة <span className="text-gold">فاخرة</span>
          </h1>
          <p className="mt-4 text-charcoal/70 max-w-lg">
            اكتشفي تشكيلة مختارة من مستحضرات التجميل والعناية بالبشرة والعطور من أفضل الماركات
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/products" className="btn-gold px-8 py-3 rounded-full font-semibold">
              تسوقي الآن
            </Link>
            <Link
              href="/categories/skincare"
              className="px-8 py-3 rounded-full border border-charcoal/20 font-semibold hover:bg-white transition-colors"
            >
              العناية بالبشرة
            </Link>
          </div>
        </div>
      </section>

      {/* التصنيفات */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold mb-6">تسوقي حسب التصنيف</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="flex flex-col items-center gap-2 bg-white rounded-2xl p-5 card-shadow transition-all"
            >
              <span className="text-3xl">{categoryIcons[cat.slug] ?? "🎀"}</span>
              <span className="text-sm font-medium text-charcoal">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* الأكثر مبيعًا */}
      {bestSelling.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">الأكثر مبيعًا</h2>
            <Link href="/products?sort=rating" className="text-sm text-gold hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {bestSelling.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* منتجات جديدة */}
      {newest.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">وصل حديثًا</h2>
            <Link href="/products?sort=newest" className="text-sm text-gold hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {newest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* عروض خاصة */}
      {featured.length > 0 && (
        <section className="bg-charcoal mt-8">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">عروض ومنتجات مختارة ✦</h2>
              <Link href="/products" className="text-sm text-gold hover:underline">
                عرض الكل
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
