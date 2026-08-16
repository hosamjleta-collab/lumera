import Link from "next/link";
import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

const categoryIcons: Record<string, string> = {
  makeup: "💄",
  skincare: "✨",
  perfumes: "🌸",
  haircare: "💆‍♀️",
  other: "🎀",
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">جميع التصنيفات</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="flex flex-col items-center gap-3 bg-white rounded-2xl p-8 card-shadow transition-all"
          >
            <span className="text-4xl">{categoryIcons[cat.slug] ?? "🎀"}</span>
            <span className="font-medium">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
