"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  quantity: number;
  product: { id: string; name: string; sellingPrice: number; images: string };
};

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          throw new Error("redirect");
        }
        return r.json();
      })
      .then((data) => setItems(data.items || []))
      .catch(() => {});
  }, []);

  const total = (items || []).reduce((s, i) => s + i.product.sellingPrice * i.quantity, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, city, area, addressLine, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setLoading(false);
        return;
      }
      router.push(`/order-confirmation/${data.orderId}`);
    } catch {
      setError("تعذر الاتصال بالخادم");
      setLoading(false);
    }
  }

  if (items === null) {
    return <div className="max-w-4xl mx-auto px-6 py-16 text-center text-charcoal/50">جارٍ التحميل...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-charcoal/60 mb-4">سلتك فارغة، لا يمكن إتمام الطلب.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">إتمام الطلب</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="md:col-span-2 bg-white rounded-2xl card-shadow p-6 flex flex-col gap-4">
          <h3 className="font-semibold mb-1">بيانات الشحن</h3>
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المدينة</label>
              <input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المنطقة (اختياري)</label>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">العنوان التفصيلي</label>
            <textarea
              required
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              rows={2}
              className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ملاحظات (اختياري)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5"
            />
          </div>

          <div className="bg-blush/20 rounded-xl p-4 text-sm text-charcoal/70 mt-2">
            سيتم الدفع عن طريق التحويل البنكي. بعد تأكيد الطلب، ستظهر لكِ بيانات الحساب البنكي
            ورقم مرجعي، ويمكنكِ رفع صورة إثبات التحويل مباشرة.
          </div>

          <button type="submit" disabled={loading} className="btn-gold rounded-full py-3 font-semibold mt-2 disabled:opacity-60">
            {loading ? "جارٍ إنشاء الطلب..." : "تأكيد الطلب"}
          </button>
        </form>

        <div className="bg-white rounded-2xl card-shadow p-6 h-fit">
          <h3 className="font-semibold mb-4">ملخص الطلب</h3>
          <ul className="text-sm space-y-2 mb-4">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span className="text-charcoal/70 line-clamp-1">
                  {i.product.name} × {i.quantity}
                </span>
                <span>{(i.product.sellingPrice * i.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-bold text-lg border-t border-charcoal/10 pt-3">
            <span>الإجمالي</span>
            <span>{total.toFixed(2)} د.ل</span>
          </div>
        </div>
      </div>
    </div>
  );
}
