import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getAdminStats } from "@/lib/data";
import LogoutButton from "@/components/site/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect(user.role === "supplier" ? "/supplier" : "/account");

  const stats = await getAdminStats();
  const pendingCount = stats.pendingProducts + stats.pendingSuppliers;

  return (
    <div className="min-h-screen flex flex-col md:flex-row" dir="rtl">
      <aside className="md:w-64 bg-charcoal text-cream/90 flex md:flex-col shrink-0">
        <div className="p-5 border-b border-cream/10 hidden md:block">
          <Link href="/" className="text-xl font-extrabold text-white">
            Lumera<span className="text-gold">.</span>
          </Link>
          <p className="text-xs text-cream/50 mt-1">لوحة الإدارة</p>
        </div>
        <nav className="flex md:flex-col gap-1 p-3 overflow-x-auto md:overflow-visible flex-1 text-sm">
          <NavLink href="/admin">نظرة عامة</NavLink>
          <NavLink href="/admin/suppliers" badge={stats.pendingSuppliers}>
            الموردون
          </NavLink>
          <NavLink href="/admin/products" badge={stats.pendingProducts}>
            المنتجات
          </NavLink>
          <NavLink href="/admin/orders">الطلبات</NavLink>
          <NavLink href="/admin/categories">التصنيفات</NavLink>
          <NavLink href="/admin/commissions">العمولات</NavLink>
        </nav>
        <div className="p-3 hidden md:block">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 bg-cream min-h-screen">
        {pendingCount > 0 && (
          <div className="bg-amber-50 text-amber-700 text-sm px-6 py-2 text-center">
            لديك {pendingCount} عنصر بانتظار المراجعة
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, children, badge }: { href: string; children: React.ReactNode; badge?: number }) {
  return (
    <Link
      href={href}
      className="px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap flex items-center gap-2"
    >
      {children}
      {!!badge && (
        <span className="bg-gold text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  );
}
