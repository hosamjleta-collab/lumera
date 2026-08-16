import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/site/ProductCard";
import AddToCartBox from "@/components/site/AddToCartBox";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id, 4);
  const images: string[] = (() => {
    try {
      return JSON.parse(product.images);
    } catch {
      return [];
    }
  })();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square bg-blush/20 rounded-2xl flex items-center justify-center overflow-hidden">
          {images[0] ? (
            <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gold text-6xl">✦</span>
          )}
        </div>

        <div className="flex flex-col">
          {product.brand && <span className="text-gold font-medium text-sm mb-1">{product.brand}</span>}
          <h1 className="text-2xl font-bold mb-3">{product.name}</h1>

          {product.ratingCount > 0 && (
            <div className="flex items-center gap-1 text-sm text-charcoal/60 mb-4">
              <span className="text-gold">★</span>
              <span>{product.rating.toFixed(1)}</span>
              <span>({product.ratingCount} تقييم)</span>
            </div>
          )}

          <div className="text-3xl font-extrabold text-charcoal mb-6">
            {formatPrice(product.sellingPrice)}
          </div>

          <p className="text-charcoal/70 leading-relaxed mb-6">{product.description}</p>

          <div className="text-sm mb-6">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">✔ متوفر في المخزون ({product.stock})</span>
            ) : (
              <span className="text-red-500 font-medium">✕ نفدت الكمية حاليًا</span>
            )}
          </div>

          <AddToCartBox productId={product.id} inStock={product.stock > 0} maxQty={product.stock} />
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">منتجات ذات صلة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
