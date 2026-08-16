import Link from "next/link";
import { getAdminStats, getPendingPayments } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const pendingPayments = await getPendingPayments();

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-8">نظرة عامة</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="إجمالي المبيعات" value={formatPrice(stats.totalSales)} />
        <StatCard label="أرباح العمولة" value={formatPrice(stats.totalCommission)} highlight />
        <StatCard label="إجمالي الطلبات" value={String(stats.totalOrders)} />
        <StatCard label="عدد العملاء" value={String(stats.totalCustomers)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/suppliers"
          className="bg-white rounded-2xl card-shadow p-6 flex items-center justify-between hover:bg-blush/10 transition-colors"
        >
          <div>
            <div className="font-semibold">موردون بانتظار الموافقة</div>
            <div className="text-charcoal/60 text-sm mt-1">راجعي طلبات انضمام الموردين الجدد</div>
          </div>
          <span className="text-2xl font-bold text-gold">{stats.pendingSuppliers}</span>
        </Link>

        <Link
          href="/admin/products"
          className="bg-white rounded-2xl card-shadow p-6 flex items-center justify-between hover:bg-blush/10 transition-colors"
        >
          <div>
            <div className="font-semibold">منتجات بانتظار الموافقة</div>
            <div className="text-charcoal/60 text-sm mt-1">راجعي المنتجات الجديدة أو المعدّلة</div>
          </div>
          <span className="text-2xl font-bold text-gold">{stats.pendingProducts}</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">مدفوعات بانتظار المراجعة</h3>
          <Link href="/admin/orders" className="text-sm text-gold hover:underline">
            عرض كل الطلبات
          </Link>
        </div>
        {pendingPayments.length === 0 ? (
          <p className="text-charcoal/60 text-sm text-center py-8">لا توجد مدفوعات بانتظار المراجعة حاليًا.</p>
        ) : (
          <ul className="divide-y divide-charcoal/10 text-sm">
            {pendingPayments.map(({ order }) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between py-3 hover:text-gold"
                >
                  <span className="font-medium">{order.referenceNumber}</span>
                  <span>{formatPrice(order.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-2xl card-shadow p-5">
      <div className={`text-xl font-bold ${highlight ? "text-gold" : "text-charcoal"}`}>{value}</div>
      <div className="text-xs text-charcoal/60 mt-1">{label}</div>
    </div>
  );
}
