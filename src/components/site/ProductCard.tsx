import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  sellingPrice: number;
  images: string;
  rating: number;
  ratingCount: number;
  stock: number;
};

export default function ProductCard({ product }: { product: Product }) {
  const images: string[] = (() => {
    try {
      return JSON.parse(product.images);
    } catch {
      return [];
    }
  })();
  const image = images[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden card-shadow transition-all"
    >
      <div className="relative aspect-square bg-blush/20 flex items-center justify-center overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-gold text-4xl">✦</span>
        )}
        {product.stock <= 0 && (
          <span className="absolute top-2 right-2 bg-charcoal text-white text-xs px-2 py-1 rounded-full">
            نفدت الكمية
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        {product.brand && (
          <span className="text-xs text-gold font-medium">{product.brand}</span>
        )}
        <h3 className="text-sm font-semibold text-charcoal line-clamp-2 leading-relaxed">
          {product.name}
        </h3>
        {product.ratingCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-charcoal/60">
            <span className="text-gold">★</span>
            <span>{product.rating.toFixed(1)}</span>
            <span>({product.ratingCount})</span>
          </div>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="font-bold text-charcoal">{formatPrice(product.sellingPrice)}</span>
        </div>
      </div>
    </Link>
  );
}
