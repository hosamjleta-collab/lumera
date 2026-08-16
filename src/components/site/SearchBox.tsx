"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/products?q=${encodeURIComponent(q.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ابحثي عن منتج، ماركة..."
        className="w-full bg-white border border-charcoal/15 rounded-full py-2 pr-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
      />
      <button
        type="submit"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/50 hover:text-gold"
        aria-label="بحث"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </form>
  );
}
