import { getCurrentUser } from "@/lib/auth";
import { getSupplierOrderItems } from "@/lib/data";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SupplierOrdersPage() {
  const user = await getCurrentUser();
  const items = await getSupplierOrderItems(user!.id);

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6">الطلبات على منتجاتي</h1>

      <div className="bg-white rounded-2xl card-shadow overflow-x-auto">
        {items.length === 0 ? (
          <div className="p-10 text-center text-charcoal/60">لا توجد طلبات بعد.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-charcoal/60 text-right">
                <th className="p-4 font-medium">رقم الطلب</th>
                <th className="p-4 font-medium">المنتج</th>
                <th className="p-4 font-medium">الكمية</th>
                <th className="p-4 font-medium">المبلغ</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {items.map(({ item, order }) => (
                <tr key={item.id} className="border-b border-charcoal/5">
                  <td className="p-4 font-medium">{order.referenceNumber}</td>
                  <td className="p-4">{item.productName}</td>
                  <td className="p-4">{item.quantity}</td>
                  <td className="p-4">{formatPrice(item.supplierPrice * item.quantity)}</td>
                  <td className="p-4">
                    <span className="text-xs bg-blush/30 rounded-full px-3 py-1">
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="p-4 text-charcoal/50 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
