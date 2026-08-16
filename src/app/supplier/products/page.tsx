"use client";

import Link from "next/link";
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

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
};
const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function SupplierProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/supplier/products");
    const data = await res.json();
    setProducts(data.products || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("هل أنتِ متأكدة من حذف هذا المنتج؟")) return;
    const res = await fetch(`/api/supplier/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "تعذر الحذف");
      return;
    }
    load();
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">منتجاتي</h1>
        <Link href="/supplier/products/new" className="btn-gold rounded-full px-5 py-2.5 text-sm font-semibold">
          + إضافة منتج
        </Link>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="bg-white rounded-2xl card-shadow overflow-x-auto">
        {products === null ? (
          <div className="p-10 text-center text-charcoal/50">جارٍ التحميل...</div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-charcoal/60">لا توجد منتجات بعد. ابدئي بإضافة أول منتج.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-charcoal/60 text-right">
                <th className="p-4 font-medium">المنتج</th>
                <th className="p-4 font-medium">سعري</th>
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
                    <span className={`text-xs rounded-full px-3 py-1 ${statusColors[p.status]}`}>
                      {statusLabels[p.status]}
                    </span>
                    {!p.isActive && (
                      <span className="block text-xs text-charcoal/40 mt-1">غير مفعّل</span>
                    )}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <Link href={`/supplier/products/${p.id}/edit`} className="text-gold hover:underline text-xs ml-3">
                      تعديل
                    </Link>
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
