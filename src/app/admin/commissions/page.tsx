"use client";

import { useEffect, useState } from "react";

type Category = { id: string; name: string };
type CommissionSetting = { id: string; categoryId: string | null; percentage: number };

export default function AdminCommissionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<CommissionSetting[]>([]);
  const [generalPct, setGeneralPct] = useState("20");
  const [categoryPct, setCategoryPct] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function load() {
    const [catRes, settingsRes] = await Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/admin/commissions").then((r) => r.json()),
    ]);
    const cats: Category[] = catRes.categories || [];
    const sett: CommissionSetting[] = settingsRes.settings || [];
    setCategories(cats);
    setSettings(sett);

    const general = sett.find((s) => s.categoryId === null);
    if (general) setGeneralPct(String(general.percentage));

    const catMap: Record<string, string> = {};
    for (const c of cats) {
      const s = sett.find((x) => x.categoryId === c.id);
      catMap[c.id] = s ? String(s.percentage) : "";
    }
    setCategoryPct(catMap);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveGeneral() {
    setError("");
    setMessage("");
    setLoading("general");
    const res = await fetch("/api/admin/commissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: null, percentage: Number(generalPct) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "حدث خطأ");
    } else {
      setMessage("تم تحديث العمولة العامة وتحديث أسعار المنتجات تلقائيًا");
      load();
    }
    setLoading(null);
  }

  async function saveCategory(categoryId: string) {
    const value = categoryPct[categoryId];
    if (value === "" || value === undefined) return;
    setError("");
    setMessage("");
    setLoading(categoryId);
    const res = await fetch("/api/admin/commissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, percentage: Number(value) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "حدث خطأ");
    } else {
      setMessage("تم تحديث عمولة التصنيف وتحديث أسعار منتجاته تلقائيًا");
      load();
    }
    setLoading(null);
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">إدارة العمولات</h1>
      <p className="text-sm text-charcoal/60 mb-6">
        سعر البيع للعميل = سعر المورد × (1 + نسبة العمولة). أي تغيير هنا يُحدّث أسعار المنتجات الحالية تلقائيًا، دون أن يؤثر على الطلبات السابقة.
      </p>

      {message && <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3 mb-4">{message}</div>}
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
        <h3 className="font-semibold mb-4">العمولة العامة الافتراضية</h3>
        <p className="text-xs text-charcoal/50 mb-3">
          تُطبّق على كل التصنيفات التي ليس لها عمولة خاصة بها.
        </p>
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-[160px]">
            <input
              type="number"
              min="0"
              step="0.5"
              value={generalPct}
              onChange={(e) => setGeneralPct(e.target.value)}
              className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 pl-10"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/50">%</span>
          </div>
          <button
            onClick={saveGeneral}
            disabled={loading === "general"}
            className="btn-gold rounded-full px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {loading === "general" ? "جارٍ الحفظ..." : "حفظ"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-6">
        <h3 className="font-semibold mb-4">عمولات خاصة بكل تصنيف (اختياري)</h3>
        <div className="flex flex-col gap-3">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="flex-1 text-sm">{c.name}</span>
              <div className="relative w-32">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="افتراضي"
                  value={categoryPct[c.id] ?? ""}
                  onChange={(e) => setCategoryPct((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  className="w-full border border-charcoal/15 rounded-xl px-4 py-2 pl-8 text-sm"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/50 text-sm">%</span>
              </div>
              <button
                onClick={() => saveCategory(c.id)}
                disabled={loading === c.id}
                className="text-gold text-xs font-medium hover:underline disabled:opacity-60"
              >
                حفظ
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
