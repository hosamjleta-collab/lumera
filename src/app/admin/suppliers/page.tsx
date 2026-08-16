"use client";

import { useEffect, useState } from "react";

type SupplierRow = {
  supplier: { id: string; storeName: string; approved: boolean; createdAt: string };
  user: { id: string; name: string; email: string; status: string; createdAt: string };
};

export default function AdminSuppliersPage() {
  const [rows, setRows] = useState<SupplierRow[] | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/suppliers");
    const data = await res.json();
    setRows(data.suppliers || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAction(userId: string, action: "approve" | "suspend" | "activate") {
    setError("");
    const res = await fetch(`/api/admin/suppliers/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "حدث خطأ");
      return;
    }
    load();
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6">إدارة الموردين</h1>
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="bg-white rounded-2xl card-shadow overflow-x-auto">
        {rows === null ? (
          <div className="p-10 text-center text-charcoal/50">جارٍ التحميل...</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-charcoal/60">لا يوجد موردون بعد.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-charcoal/60 text-right">
                <th className="p-4 font-medium">المتجر</th>
                <th className="p-4 font-medium">المسؤول</th>
                <th className="p-4 font-medium">البريد الإلكتروني</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ supplier, user }) => (
                <tr key={supplier.id} className="border-b border-charcoal/5">
                  <td className="p-4 font-medium">{supplier.storeName}</td>
                  <td className="p-4">{user.name}</td>
                  <td className="p-4 text-charcoal/60">{user.email}</td>
                  <td className="p-4">
                    <StatusBadge status={user.status} approved={supplier.approved} />
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {!supplier.approved && (
                      <button
                        onClick={() => handleAction(user.id, "approve")}
                        className="text-green-600 hover:underline text-xs ml-3"
                      >
                        موافقة
                      </button>
                    )}
                    {user.status === "active" ? (
                      <button
                        onClick={() => handleAction(user.id, "suspend")}
                        className="text-red-500 hover:underline text-xs"
                      >
                        إيقاف
                      </button>
                    ) : user.status === "suspended" ? (
                      <button
                        onClick={() => handleAction(user.id, "activate")}
                        className="text-green-600 hover:underline text-xs"
                      >
                        تفعيل
                      </button>
                    ) : null}
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

function StatusBadge({ status, approved }: { status: string; approved: boolean }) {
  if (!approved) {
    return <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-3 py-1">بانتظار الموافقة</span>;
  }
  if (status === "suspended") {
    return <span className="text-xs bg-red-100 text-red-700 rounded-full px-3 py-1">موقوف</span>;
  }
  return <span className="text-xs bg-green-100 text-green-700 rounded-full px-3 py-1">نشط</span>;
}
