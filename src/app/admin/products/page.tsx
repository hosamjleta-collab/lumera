"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  brand: string | null;
  supplierPrice: number;
  sellingPrice: number;
  stock: number;
  status: "pending" | "approved" | "rejected";
  isActive: boolean;
};

const tabs = [
  { key: "", label: "الكل" },
  { key: "pending", label: "قيد المراجعة" },
  { key: "approved", label: "مقبولة" },
  { key: "rejected", label: "مرفوضة" },
];

export default function AdminProductsPage() {
  const [tab, setTab] = useState("pending");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");

  async function load(status: string) {
    setProducts(null);
    const res = await fetch(`/api/admin/products${status ? `?status=${status}` : ""}`);
    const data = await res.json();
    setProducts(data.products || []);
  }

  useEffect(() => {
    load(tab);
  }, [tab]);

  async function handleAction(id: string, action: "approve" | "reject") {
    setError("");
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "حدث خطأ");
      return;
    }
    load(tab);
  }

  async function handleDelete(id: string) {
    if (!confirm("هل تريدين حذف هذا المنتج نهائيًا؟")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "تعذر الحذف");
      return;
    }
    load(tab);
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6">إدارة المنتجات</h1>
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              tab === t.key ? "btn-gold" : "bg-white text-charcoal/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl card-shadow overflow-x-auto">
        {products === null ? (
          <div className="p-10 text-center text-charcoal/50">جارٍ التحميل...</div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-charcoal/60">لا توجد منتجات في هذا القسم.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-charcoal/60 text-right">
                <th className="p-4 font-medium">المنتج</th>
                <th className="p-4 font-medium">سعر المورد</th>
                <th className="p-4 font-medium">سعر البيع</th>
                <th className="p-4 font-medium">المخزون</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-charcoal/5">
                  <td className="p-4">
                    <div className="font-medium">{p.name}</div>
                    {p.brand && <div className="text-xs text-charcoal/50">{p.brand}</div>}
                  </td>
                  <td className="p-4">{formatPrice(p.supplierPrice)}</td>
                  <td className="p-4">{formatPrice(p.sellingPrice)}</td>
                  <td className="p-4">{p.stock}</td>
                  <td className="p-4">
                    <ProductStatusBadge status={p.status} />
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {p.status !== "approved" && (
                      <button
                        onClick={() => handleAction(p.id, "approve")}
                        className="text-green-600 hover:underline text-xs ml-3"
                      >
                        موافقة
                      </button>
                    )}
                    {p.status !== "rejected" && (
                      <button
                        onClick={() => handleAction(p.id, "reject")}
                        className="text-amber-600 hover:underline text-xs ml-3"
                      >
                        رفض
                      </button>
                    )}
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-xs">
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

function ProductStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = { pending: "قيد المراجعة", approved: "مقبول", rejected: "مرفوض" };
  return <span className={`text-xs rounded-full px-3 py-1 ${map[status]}`}>{labels[status]}</span>;
}
