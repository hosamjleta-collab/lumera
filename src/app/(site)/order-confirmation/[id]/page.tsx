import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrderWithItems, getSiteSettings } from "@/lib/data";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";
import PaymentProofUploader from "@/components/site/PaymentProofUploader";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const result = await getOrderWithItems(id);
  if (!result || result.order.userId !== user.id) notFound();

  const { order, items } = result;
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl mx-auto mb-4">
          ✔
        </div>
        <h1 className="text-2xl font-bold mb-1">شكرًا لكِ! تم استلام طلبك</h1>
        <p className="text-charcoal/60">
          رقمكِ المرجعي: <span className="font-bold text-gold">{order.referenceNumber}</span>
        </p>
        <p className="text-sm text-charcoal/50 mt-1">
          حالة الطلب: {ORDER_STATUS_LABELS[order.status] || order.status}
        </p>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
        <h3 className="font-semibold mb-4">تفاصيل الطلب</h3>
        <ul className="text-sm space-y-2 mb-4">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between">
              <span className="text-charcoal/70">
                {i.productName} × {i.quantity}
              </span>
              <span>{formatPrice(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between font-bold text-lg border-t border-charcoal/10 pt-3">
          <span>الإجمالي</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="bg-blush/20 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold mb-4">بيانات التحويل البنكي</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <InfoRow label="اسم المصرف" value={settings.bank_name} />
          <InfoRow label="اسم صاحب الحساب" value={settings.account_holder} />
          <InfoRow label="رقم الحساب" value={settings.account_number} />
          <InfoRow label="IBAN" value={settings.iban} />
          <InfoRow label="المبلغ المطلوب" value={formatPrice(order.total)} />
          <InfoRow label="الرقم المرجعي" value={order.referenceNumber} />
        </div>
        <p className="text-xs text-charcoal/60 mt-4">
          يرجى كتابة الرقم المرجعي في خانة ملاحظات التحويل إن أمكن، ثم رفع صورة إثبات التحويل أدناه.
        </p>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-6">
        <h3 className="font-semibold mb-4">رفع إثبات الدفع</h3>
        <PaymentProofUploader orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="text-center mt-8">
        <Link href="/account/orders" className="text-gold hover:underline text-sm">
          عرض جميع طلباتي
        </Link>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-3">
      <div className="text-charcoal/50 text-xs mb-0.5">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
