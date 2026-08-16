import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts } from "@/lib/data";
import ProductCard from "@/components/site/ProductCard";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { items } = await getProducts({ categorySlug: slug, limit: 48 });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-2">{category.name}</h1>
      {category.description && <p className="text-charcoal/60 mb-6">{category.description}</p>}
      <p className="text-sm text-charcoal/50 mb-6">{items.length} منتج</p>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl card-shadow p-10 text-center text-charcoal/60">
          لا توجد منتجات في هذا التصنيف حاليًا.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
