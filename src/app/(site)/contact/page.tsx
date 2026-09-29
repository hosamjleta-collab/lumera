import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSiteSettings();
  
  // تجهيز رقم الهاتف للواتساب (إزالة أي مسافات أو رموز ليصبح جاهزاً للرابط)
  const rawPhone = settings.contact_phone || "+218945367328";
  const whatsappNumber = rawPhone.replace(/[^0-9]/g, "");

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">اتصل بنا</h1>
      <p className="text-charcoal/70 mb-8">
        يسعدنا تواصلكِ معنا لأي استفسار أو ملاحظة، فريقنا جاهز لمساعدتك.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* كارت الواتساب / الهاتف - عند الضغط يتحول للواتساب فوراً */}
        <a 
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-2xl card-shadow p-6 block hover:ring-2 hover:ring-green-500 transition-all cursor-pointer group"
        >
          <div className="text-2xl mb-2 flex items-center justify-between">
            <span>💬</span>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
              فتح الواتساب ↗
            </span>
          </div>
          <div className="font-semibold mb-1 text-gray-900 group-hover:text-green-600 transition-colors">
            واتساب / الهاتف
          </div>
          <div className="text-charcoal/70 font-medium" dir="ltr">
            {settings.contact_phone}
          </div>
        </a>

        {/* كارت البريد الإلكتروني */}
        <div className="bg-white rounded-2xl card-shadow p-6">
          <div className="text-gold text-2xl mb-2">✉️</div>
          <div className="font-semibold mb-1">البريد الإلكتروني</div>
          <div className="text-charcoal/70">{settings.contact_email}</div>
        </div>

      </div>
    </div>
  );
}