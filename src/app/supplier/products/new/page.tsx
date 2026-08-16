"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/site/ImageUploader";

type Category = { id: string; name: string };

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [supplierPrice, setSupplierPrice] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories || []);
        if (d.categories?.[0]) setCategoryId(d.categories[0].id);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/supplier/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryId,
          brand,
          description,
          supplierPrice: Number(supplierPrice),
          stock: Number(stock),
          images,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setLoading(false);
        return;
      }
      router.push("/supplier/products");
    } catch {
      setError("تعذر الاتصال بالخادم");
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">إضافة منتج جديد</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl card-shadow p-6 flex flex-col gap-4">
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

        <div>
          <label className="block text-sm font-medium mb-1">اسم المنتج</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">التصنيف</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">العلامة التجارية</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">الوصف</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">سعرك (سعر الجملة)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={supplierPrice}
              onChange={(e) => setSupplierPrice(e.target.value)}
              className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الكمية المتوفرة</label>
            <input
              type="number"
              min="0"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">صور المنتج</label>
          <ImageUploader images={images} onChange={setImages} />
        </div>

        <p className="text-xs text-charcoal/50">
          سيتم احتساب سعر البيع النهائي للعميل تلقائيًا بإضافة نسبة عمولة المنصة إلى سعرك. سيخضع المنتج للمراجعة قبل النشر.
        </p>

        <button type="submit" disabled={loading} className="btn-gold rounded-full py-3 font-semibold disabled:opacity-60">
          {loading ? "جارٍ الحفظ..." : "حفظ المنتج"}
        </button>
      </form>
    </div>
  );
}
