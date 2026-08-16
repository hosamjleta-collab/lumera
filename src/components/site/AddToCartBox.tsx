"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddToCartBox({
  productId,
  inStock,
  maxQty,
}: {
  productId: string;
  inStock: boolean;
  maxQty: number;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAdd() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        setMessage(data.error || "حدث خطأ");
        setLoading(false);
        return;
      }
      setMessage("تمت الإضافة إلى السلة ✔");
      router.refresh();
    } catch {
      setMessage("تعذر الاتصال بالخادم");
    }
    setLoading(false);
  }

  if (!inStock) {
    return (
      <button disabled className="w-full sm:w-64 bg-charcoal/20 text-white rounded-full py-3 font-semibold cursor-not-allowed">
        غير متوفر حاليًا
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-charcoal/15 rounded-full">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center text-charcoal/70"
          >
            −
          </button>
          <span className="w-8 text-center">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            className="w-9 h-9 flex items-center justify-center text-charcoal/70"
          >
            +
          </button>
        </div>
        <button
          onClick={handleAdd}
          disabled={loading}
          className="flex-1 sm:w-56 btn-gold rounded-full py-3 font-semibold disabled:opacity-60"
        >
          {loading ? "جارٍ الإضافة..." : "أضيفي إلى السلة"}
        </button>
      </div>
      {message && <p className="text-sm text-charcoal/70">{message}</p>}
    </div>
  );
}
