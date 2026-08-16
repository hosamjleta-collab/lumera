"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string | null;
    sellingPrice: number;
    images: string;
    stock: number;
  };
};

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/cart");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const data = await res.json();
    setItems(data.items || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateQty(id: string, quantity: number) {
    if (quantity < 1) return;
    await fetch(`/api/cart/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    load();
    router.refresh();
  }

  async function removeItem(id: string) {
    await fetch(`/api/cart/${id}`, { method: "DELETE" });
    load();
    router.refresh();
  }

  if (items === null) {
    return <div className="max-w-4xl mx-auto px-6 py-16 text-center text-charcoal/50">جارٍ التحميل...</div>;
  }

  const total = items.reduce((sum, i) => sum + i.product.sellingPrice * i.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">سلة المشتريات</h1>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl card-shadow p-12 text-center">
          <p className="text-charcoal/60 mb-4">سلتك فارغة حاليًا</p>
          <Link href="/products" className="btn-gold rounded-full px-6 py-2.5 inline-block font-medium">
            تصفحي المنتجات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 flex flex-col gap-3">
            {items.map((item) => {
              const images: string[] = (() => {
                try {
                  return JSON.parse(item.product.images);
                } catch {
                  return [];
                }
              })();
              return (
                <div key={item.id} className="bg-white rounded-2xl card-shadow p-4 flex gap-4 items-center">
                  <div className="w-20 h-20 bg-blush/20 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                    {images[0] ? (
                      <img src={images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gold text-2xl">✦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.slug}`} className="font-medium text-sm line-clamp-2 hover:text-gold">
                      {item.product.name}
                    </Link>
                    {item.product.brand && (
                      <p className="text-xs text-gold mt-0.5">{item.product.brand}</p>
                    )}
                    <p className="font-bold mt-1">{item.product.sellingPrice.toFixed(2)} د.ل</p>
                  </div>
                  <div className="flex items-center border border-charcoal/15 rounded-full shrink-0">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-charcoal/70"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-8 h-8 flex items-center justify-center text-charcoal/70 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-charcoal/40 hover:text-red-500 shrink-0"
                    aria-label="حذف"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl card-shadow p-6 h-fit">
            <h3 className="font-semibold mb-4">ملخص الطلب</h3>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-charcoal/60">عدد المنتجات</span>
              <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-charcoal/10 pt-3 mt-3">
              <span>الإجمالي</span>
              <span>{total.toFixed(2)} د.ل</span>
            </div>
            <Link
              href="/checkout"
              className="w-full btn-gold rounded-full py-3 font-semibold mt-6 block text-center"
            >
              إتمام الطلب
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
