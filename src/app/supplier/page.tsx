import { getCurrentUser } from "@/lib/auth";
import { getSupplierStats, getSupplierOrderItems, getSupplierProfile } from "@/lib/data";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SupplierDashboardPage() {
  const user = await getCurrentUser();
  const stats = await getSupplierStats(user!.id);
  const profile = await getSupplierProfile(user!.id);
  const recentItems = (await getSupplierOrderItems(user!.id)).slice(0, 6);

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-1">مرحبًا، {profile?.storeName || user?.name}</h1>
      <p className="text-charcoal/60 text-sm mb-8">نظرة عامة على أداء متجرك</p>

      {!profile?.approved && (
        <div className="bg-amber-50 text-amber-700 rounded-xl p-4 mb-6 text-sm">
          حسابك بانتظار موافقة الإدارة النهائية. يمكنك إضافة المنتجات، لكنها لن تظهر للعملاء حتى تتم الموافقة.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="عدد المنتجات" value={String(stats.productCount)} />
        <StatCard label="الطلبات" value={String(stats.orderCount)} />
        <StatCard label="إجمالي المبيعات" value={formatPrice(stats.totalSales)} />
        <StatCard label="أرباحك المستحقة" value={formatPrice(stats.supplierEarnings)} highlight />
      </div>

      <div className="bg-white rounded-2xl card-shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">آخر الطلبات على منتجاتك</h3>
          <Link href="/supplier/orders" className="text-sm text-gold hover:underline">
            عرض الكل
          </Link>
        </div>
        {recentItems.length === 0 ? (
          <p className="text-charcoal/60 text-sm text-center py-8">لا توجد طلبات بعد.</p>
        ) : (
          <ul className="divide-y divide-charcoal/10 text-sm">
            {recentItems.map(({ item, order }) => (
              <li key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{item.productName}</div>
                  <div className="text-xs text-charcoal/50">
                    {order.referenceNumber} × {item.quantity}
                  </div>
                </div>
                <span className="text-xs bg-blush/30 rounded-full px-3 py-1">
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
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
