"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button
      onClick={handleLogout}
      className="text-sm border border-charcoal/20 rounded-full px-4 py-2 hover:bg-charcoal hover:text-white transition-colors"
    >
      تسجيل الخروج
    </button>
  );
}
