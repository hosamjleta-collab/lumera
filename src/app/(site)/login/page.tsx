"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setLoading(false);
        return;
      }
      if (data.role === "admin") router.push("/admin");
      else if (data.role === "supplier") router.push("/supplier");
      else router.push("/account");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-center mb-1">تسجيل الدخول</h1>
      <p className="text-center text-charcoal/60 text-sm mb-8">مرحبًا بعودتك إلى لوميرا</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl card-shadow p-6 flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 text-center">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">كلمة المرور</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-gold rounded-full py-3 font-semibold mt-2 disabled:opacity-60"
        >
          {loading ? "جارٍ الدخول..." : "دخول"}
        </button>
      </form>

      <p className="text-center text-sm text-charcoal/60 mt-6">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="text-gold font-medium hover:underline">
          إنشاء حساب جديد
        </Link>
      </p>

  );
}
