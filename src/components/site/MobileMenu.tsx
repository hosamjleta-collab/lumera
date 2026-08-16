"use client";

import Link from "next/link";
import { useState } from "react";
import type { SessionUser } from "@/lib/auth";

type Category = { id: string; name: string; slug: string };

export default function MobileMenu({
  categories,
  user,
}: {
  categories: Category[];
  user: SessionUser | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="القائمة"
        className="p-1.5 text-charcoal"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-charcoal/40" onClick={() => setOpen(false)} />
          <div className="relative w-72 bg-cream h-full p-5 shadow-xl mr-auto overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xl font-extrabold">
                Lumera<span className="text-gold">.</span>
              </span>
              <button onClick={() => setOpen(false)} className="text-charcoal/60 text-2xl leading-none">
                ×
              </button>
            </div>

            {user ? (
              <div className="mb-4 p-3 bg-white rounded-xl text-sm">
                مرحبًا، <span className="font-semibold">{user.name}</span>
              </div>
            ) : (
              <div className="flex gap-2 mb-4">
                <Link href="/login" onClick={() => setOpen(false)} className="flex-1 text-center py-2 rounded-full btn-gold text-sm">
                  دخول
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="flex-1 text-center py-2 rounded-full border border-gold text-gold text-sm">
                  حساب جديد
                </Link>
              </div>
            )}

            <nav className="flex flex-col gap-1 text-sm">
              <Link href="/products" onClick={() => setOpen(false)} className="py-2 border-b border-charcoal/10">
                كل المنتجات
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="py-2 border-b border-charcoal/10"
                >
                  {c.name}
                </Link>
              ))}
              <Link href="/about" onClick={() => setOpen(false)} className="py-2 border-b border-charcoal/10">
                من نحن
              </Link>
              <Link href="/contact" onClick={() => setOpen(false)} className="py-2 border-b border-charcoal/10">
                اتصل بنا
              </Link>
              {user && (
                <Link
                  href={user.role === "admin" ? "/admin" : user.role === "supplier" ? "/supplier" : "/account"}
                  onClick={() => setOpen(false)}
                  className="py-2 border-b border-charcoal/10"
                >
                  حسابي
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
