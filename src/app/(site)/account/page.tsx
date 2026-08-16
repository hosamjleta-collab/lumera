import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserOrders } from "@/lib/data";
import { ORDER_STATUS_LABELS, formatPrice } from "@/lib/utils";
import LogoutButton from "@/components/site/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "customer") redirect(user.role === "admin" ? "/admin" : "/supplier");

  const orders = await getUserOrders(user.id);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">مرحبًا، {user.name}</h1>
          <p className="text-charcoal/60 text-sm">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl card-shadow p-5 text-center">
          <div className="text-2xl font-bold text-gold">{orders.length}</div>
          <div className="text-sm text-charcoal/60">إجمالي الطلبات</div>
        </div>
        <div className="bg-white rounded-2xl card-shadow p-5 text-center">
          <div className="text-2xl font-bold text-gold">
            {orders.filter((o) => o.status === "completed").length}
          </div>
          <div className="text-sm text-charcoal/60">طلبات مكتملة</div>
        </div>
        <div className="bg-white rounded-2xl card-shadow p-5 text-center">
          <div className="text-2xl font-bold text-gold">
            {orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length}
          </div>
          <div className="text-sm text-charcoal/60">قيد التنفيذ</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">آخر الطلبات</h3>
          <Link href="/account/orders" className="text-sm text-gold hover:underline">
            عرض الكل
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-charcoal/60 text-sm text-center py-8">لا توجد طلبات بعد.</p>
        ) : (
          <ul className="divide-y divide-charcoal/10">
            {recentOrders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/account/orders/${o.id}`}
                  className="flex items-center justify-between py-3 hover:text-gold"
                >
                  <div>
                    <div className="font-medium text-sm">{o.referenceNumber}</div>
                    <div className="text-xs text-charcoal/50">
                      {new Date(o.createdAt).toLocaleDateString("ar-EG")}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{formatPrice(o.total)}</div>
                    <div className="text-xs text-charcoal/60">{ORDER_STATUS_LABELS[o.status]}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
