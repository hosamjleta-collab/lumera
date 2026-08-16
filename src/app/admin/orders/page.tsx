"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";

type Order = {
  id: string;
  referenceNumber: string;
  status: string;
  total: number;
  createdAt: string;
};

const filterTabs = [
  { key: "", label: "الكل" },
  { key: "proof_uploaded", label: "بحاجة لمراجعة الدفع" },
  { key: "payment_confirmed", label: "مؤكدة الدفع" },
  { key: "processing", label: "قيد التجهيز" },
  { key: "shipped", label: "تم الشحن" },
  { key: "completed", label: "مكتملة" },
  { key: "cancelled", label: "ملغاة" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));
  }, []);

  const filtered = orders?.filter((o) => (filter ? o.status === filter : true)) ?? [];

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6">إدارة الطلبات</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filterTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === t.key ? "btn-gold" : "bg-white text-charcoal/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl card-shadow overflow-x-auto">
        {orders === null ? (
          <div className="p-10 text-center text-charcoal/50">جارٍ التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-charcoal/60">لا توجد طلبات في هذا القسم.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-charcoal/60 text-right">
                <th className="p-4 font-medium">رقم الطلب</th>
                <th className="p-4 font-medium">المبلغ</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">التاريخ</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-charcoal/5">
                  <td className="p-4 font-medium">{o.referenceNumber}</td>
                  <td className="p-4">{formatPrice(o.total)}</td>
                  <td className="p-4">
                    <span className="text-xs bg-blush/30 rounded-full px-3 py-1">
                      {ORDER_STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td className="p-4 text-charcoal/50 text-xs">
                    {new Date(o.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/orders/${o.id}`} className="text-gold hover:underline text-xs">
                      عرض التفاصيل
                    </Link>
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
