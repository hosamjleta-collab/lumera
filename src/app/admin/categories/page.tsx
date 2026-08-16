"use client";

import { useEffect, useState } from "react";

type Category = { id: string; name: string; slug: string; description: string | null };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, description }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "حدث خطأ");
      setLoading(false);
      return;
    }
    setName("");
    setSlug("");
    setDescription("");
    setLoading(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("هل تريدين حذف هذا التصنيف؟")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "تعذر الحذف");
      return;
    }
    load();
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">إدارة التصنيفات</h1>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl card-shadow p-6 mb-6 flex flex-col gap-4">
        <h3 className="font-semibold">إضافة تصنيف جديد</h3>
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم التصنيف</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الرابط (بالإنجليزية)</label>
            <input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="example-slug"
              className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5"
              dir="ltr"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">الوصف (اختياري)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-gold rounded-full py-2.5 font-semibold w-fit px-6 disabled:opacity-60">
          {loading ? "جارٍ الإضافة..." : "إضافة"}
        </button>
      </form>

      <div className="bg-white rounded-2xl card-shadow overflow-x-auto">
        {categories === null ? (
          <div className="p-10 text-center text-charcoal/50">جارٍ التحميل...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-charcoal/60 text-right">
                <th className="p-4 font-medium">الاسم</th>
                <th className="p-4 font-medium">الرابط</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-charcoal/5">
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4 text-charcoal/60" dir="ltr">
                    /{c.slug}
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline text-xs">
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
