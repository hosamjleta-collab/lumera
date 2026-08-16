import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserOrders } from "@/lib/data";
import { ORDER_STATUS_LABELS, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await getUserOrders(user.id);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">طلباتي</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl card-shadow p-12 text-center">
          <p className="text-charcoal/60 mb-4">لا توجد طلبات بعد.</p>
          <Link href="/products" className="btn-gold rounded-full px-6 py-2.5 inline-block font-medium">
            ابدئي التسوق
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl card-shadow divide-y divide-charcoal/10">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/account/orders/${o.id}`}
              className="flex items-center justify-between p-5 hover:bg-blush/10 transition-colors"
            >
              <div>
                <div className="font-medium">{o.referenceNumber}</div>
                <div className="text-xs text-charcoal/50 mt-1">
                  {new Date(o.createdAt).toLocaleDateString("ar-EG")}
                </div>
              </div>
              <div className="text-left">
                <div className="font-semibold">{formatPrice(o.total)}</div>
                <span className="inline-block mt-1 text-xs bg-blush/30 text-charcoal/70 rounded-full px-3 py-1">
                  {ORDER_STATUS_LABELS[o.status]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
