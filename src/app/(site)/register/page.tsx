"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "supplier" ? "supplier" : "customer";

  const [role, setRole] = useState<"customer" | "supplier">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role, storeName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setLoading(false);
        return;
      }
      if (data.pendingApproval) {
        setSuccess(data.message);
        setLoading(false);
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-center mb-1">إنشاء حساب جديد</h1>
      <p className="text-center text-charcoal/60 text-sm mb-8">انضمي إلى عائلة لوميرا</p>

      <div className="flex bg-white rounded-full p-1 mb-6 card-shadow">
        <button
          type="button"
          onClick={() => setRole("customer")}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
            role === "customer" ? "btn-gold" : "text-charcoal/60"
          }`}
        >
          عميلة
        </button>
        <button
          type="button"
          onClick={() => setRole("supplier")}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
            role === "supplier" ? "btn-gold" : "text-charcoal/60"
          }`}
        >
          مورد
        </button>
      </div>

      {success ? (
        <div className="bg-white rounded-2xl card-shadow p-6 text-center">
          <p className="text-green-600 font-medium mb-4">{success}</p>
          <Link href="/login" className="text-gold hover:underline text-sm">
            الذهاب إلى صفحة تسجيل الدخول
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl card-shadow p-6 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 text-center">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">
              {role === "supplier" ? "اسم المسؤول" : "الاسم الكامل"}
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>
          {role === "supplier" && (
            <div>
              <label className="block text-sm font-medium mb-1">اسم المتجر</label>
              <input
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>
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
            <label className="block text-sm font-medium mb-1">رقم الهاتف (اختياري)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">كلمة المرور</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-charcoal/15 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>
          {role === "supplier" && (
            <p className="text-xs text-charcoal/50">
              ملاحظة: سيتم مراجعة حسابك من قبل الإدارة قبل تفعيله.
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-gold rounded-full py-3 font-semibold mt-2 disabled:opacity-60"
          >
            {loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-charcoal/60 mt-6">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="text-gold font-medium hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
