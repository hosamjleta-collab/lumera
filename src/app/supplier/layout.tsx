import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/site/LogoutButton";

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "supplier") redirect(user.role === "admin" ? "/admin" : "/account");

  return (
    <div className="min-h-screen flex flex-col md:flex-row" dir="rtl">
      <aside className="md:w-64 bg-charcoal text-cream/90 flex md:flex-col shrink-0">
        <div className="p-5 border-b border-cream/10 hidden md:block">
          <Link href="/" className="text-xl font-extrabold text-white">
            Lumera<span className="text-gold">.</span>
          </Link>
          <p className="text-xs text-cream/50 mt-1">لوحة المورد</p>
        </div>
        <nav className="flex md:flex-col gap-1 p-3 overflow-x-auto md:overflow-visible flex-1 text-sm">
          <NavLink href="/supplier">نظرة عامة</NavLink>
          <NavLink href="/supplier/products">منتجاتي</NavLink>
          <NavLink href="/supplier/products/new">إضافة منتج</NavLink>
          <NavLink href="/supplier/orders">الطلبات</NavLink>
        </nav>
        <div className="p-3 hidden md:block">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 bg-cream min-h-screen">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap"
    >
      {children}
    </Link>
  );
}
