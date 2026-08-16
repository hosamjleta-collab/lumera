import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">اتصل بنا</h1>
      <p className="text-charcoal/70 mb-8">
        يسعدنا تواصلكِ معنا لأي استفسار أو ملاحظة، فريقنا جاهز لمساعدتك.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl card-shadow p-6">
          <div className="text-gold text-2xl mb-2">📞</div>
          <div className="font-semibold mb-1">الهاتف</div>
          <div className="text-charcoal/70" dir="ltr">{settings.contact_phone}</div>
        </div>
        <div className="bg-white rounded-2xl card-shadow p-6">
          <div className="text-gold text-2xl mb-2">✉️</div>
          <div className="font-semibold mb-1">البريد الإلكتروني</div>
          <div className="text-charcoal/70">{settings.contact_email}</div>
        </div>
      </div>
    </div>
  );
}
