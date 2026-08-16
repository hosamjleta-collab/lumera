import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrderWithItems, getSiteSettings } from "@/lib/data";
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW, formatPrice } from "@/lib/utils";
import PaymentProofUploader from "@/components/site/PaymentProofUploader";
import { db } from "@/db";
import { paymentProofs, addresses } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function CustomerOrderDetailPage({
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
  const proofs = await db.select().from(paymentProofs).where(eq(paymentProofs.orderId, id));
  const addressRows = order.addressId
    ? await db.select().from(addresses).where(eq(addresses.id, order.addressId))
    : [];
  const address = addressRows[0];

  const currentStepIndex = ORDER_STATUS_FLOW.indexOf(order.status as (typeof ORDER_STATUS_FLOW)[number]);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">طلب {order.referenceNumber}</h1>
          <p className="text-sm text-charcoal/50">
            {new Date(order.createdAt).toLocaleDateString("ar-EG")}
          </p>
        </div>
        <span className="text-sm bg-blush/30 rounded-full px-4 py-1.5 font-medium">
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {!isCancelled && (
        <div className="bg-white rounded-2xl card-shadow p-6 mb-6 overflow-x-auto">
          <div className="flex items-center min-w-max">
            {ORDER_STATUS_FLOW.map((step, i) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= currentStepIndex ? "bg-gold text-white" : "bg-charcoal/10 text-charcoal/40"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-[10px] text-charcoal/60 w-16 text-center">
                    {ORDER_STATUS_LABELS[step]}
                  </span>
                </div>
                {i < ORDER_STATUS_FLOW.length - 1 && (
                  <div className={`w-8 h-0.5 ${i < currentStepIndex ? "bg-gold" : "bg-charcoal/10"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
        <h3 className="font-semibold mb-4">المنتجات</h3>
        <ul className="text-sm space-y-2">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between">
              <span className="text-charcoal/70">
                {i.productName} × {i.quantity}
              </span>
              <span>{formatPrice(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between font-bold text-lg border-t border-charcoal/10 pt-3 mt-3">
          <span>الإجمالي</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {address && (
        <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
          <h3 className="font-semibold mb-3">عنوان الشحن</h3>
          <p className="text-sm text-charcoal/70">
            {address.fullName} — {address.phone}
            <br />
            {address.city} {address.area ? `، ${address.area}` : ""}
            <br />
            {address.addressLine}
          </p>
        </div>
      )}

      {["awaiting_payment", "new"].includes(order.status) && (
        <div className="bg-blush/20 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-4">بيانات التحويل البنكي</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <InfoRow label="اسم المصرف" value={settings.bank_name} />
            <InfoRow label="اسم صاحب الحساب" value={settings.account_holder} />
            <InfoRow label="رقم الحساب" value={settings.account_number} />
            <InfoRow label="IBAN" value={settings.iban} />
          </div>
        </div>
      )}

      {!["completed", "cancelled", "payment_confirmed", "processing", "shipped"].includes(order.status) && (
        <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
          <h3 className="font-semibold mb-4">إثبات الدفع</h3>
          <PaymentProofUploader orderId={order.id} currentStatus={order.status} />
        </div>
      )}

      {proofs.length > 0 && (
        <div className="bg-white rounded-2xl card-shadow p-6">
          <h3 className="font-semibold mb-4">الإثباتات المرفوعة</h3>
          <div className="flex gap-3 flex-wrap">
            {proofs.map((p) => (
              <a key={p.id} href={p.imagePath} target="_blank" rel="noreferrer" className="block w-24 h-24 rounded-xl overflow-hidden border border-charcoal/10">
                <img src={p.imagePath} alt="إثبات الدفع" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}
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
