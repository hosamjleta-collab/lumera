"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW, formatPrice } from "@/lib/utils";

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  supplierPrice: number;
  sellingPrice: number;
  lineTotal: number;
  supplierId: string;
};
type Order = {
  id: string;
  referenceNumber: string;
  status: string;
  total: number;
  subtotal: number;
  createdAt: string;
  customerNote: string | null;
  adminNote: string | null;
};
type Proof = { id: string; imagePath: string; createdAt: string };
type Address = {
  fullName: string;
  phone: string;
  city: string;
  area: string | null;
  addressLine: string;
};

const allStatuses = [
  "new",
  "awaiting_payment",
  "proof_uploaded",
  "payment_review",
  "payment_confirmed",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch(`/api/orders/${orderId}`);
    const data = await res.json();
    if (res.ok) {
      setOrder(data.order);
      setItems(data.items);
      setProofs(data.proofs);
      setAddress(data.address);
    }
  }

  useEffect(() => {
    load();
  }, [orderId]);

  async function handlePayment(action: "approve" | "reject") {
    setError("");
    setMessage("");
    const res = await fetch(`/api/admin/payments/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason: rejectReason || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "حدث خطأ");
      return;
    }
    setMessage(action === "approve" ? "تم تأكيد الدفع بنجاح" : "تم رفض إثبات الدفع");
    load();
  }

  async function handleStatusChange(status: string) {
    setError("");
    setMessage("");
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "حدث خطأ");
      return;
    }
    setMessage("تم تحديث حالة الطلب");
    load();
  }

  if (!order) {
    return <div className="p-8 text-center text-charcoal/50">جارٍ التحميل...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">طلب {order.referenceNumber}</h1>
        <span className="text-sm bg-blush/30 rounded-full px-4 py-1.5 font-medium">
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {message && <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3 mb-4">{message}</div>}
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
        <h3 className="font-semibold mb-4">المنتجات</h3>
        <ul className="text-sm space-y-2">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between">
              <span className="text-charcoal/70">
                {i.productName} × {i.quantity}
              </span>
              <span>{formatPrice(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between font-bold text-lg border-t border-charcoal/10 pt-3 mt-3">
          <span>الإجمالي</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {address && (
        <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
          <h3 className="font-semibold mb-3">عنوان الشحن</h3>
          <p className="text-sm text-charcoal/70">
            {address.fullName} — {address.phone}
            <br />
            {address.city} {address.area ? `، ${address.area}` : ""}
            <br />
            {address.addressLine}
          </p>
        </div>
      )}

      {order.customerNote && (
        <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
          <h3 className="font-semibold mb-2">ملاحظات العميل</h3>
          <p className="text-sm text-charcoal/70">{order.customerNote}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
        <h3 className="font-semibold mb-4">إثباتات الدفع</h3>
        {proofs.length === 0 ? (
          <p className="text-sm text-charcoal/50">لم يتم رفع أي إثبات دفع بعد.</p>
        ) : (
          <>
            <div className="flex gap-3 flex-wrap mb-4">
              {proofs.map((p) => (
                <a
                  key={p.id}
                  href={p.imagePath}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-28 h-28 rounded-xl overflow-hidden border border-charcoal/10"
                >
                  <img src={p.imagePath} alt="إثبات الدفع" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
            {["proof_uploaded", "payment_review"].includes(order.status) && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handlePayment("approve")}
                  className="bg-green-600 text-white rounded-full px-5 py-2 text-sm font-medium"
                >
                  قبول الدفع
                </button>
                <input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="سبب الرفض (اختياري)"
                  className="flex-1 border border-charcoal/15 rounded-full px-4 py-2 text-sm"
                />
                <button
                  onClick={() => handlePayment("reject")}
                  className="bg-red-500 text-white rounded-full px-5 py-2 text-sm font-medium"
                >
                  رفض الدفع
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl card-shadow p-6">
        <h3 className="font-semibold mb-4">تغيير حالة الطلب</h3>
        <div className="flex flex-wrap gap-2">
          {allStatuses.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={order.status === s}
              className={`px-4 py-2 rounded-full text-xs font-medium ${
                order.status === s ? "btn-gold" : "bg-blush/20 text-charcoal/70 hover:bg-blush/40"
              }`}
            >
              {ORDER_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
