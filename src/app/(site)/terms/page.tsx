export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">الشروط والخصوصية</h1>
      <div className="text-charcoal/80 leading-loose space-y-6">
        <section>
          <h2 className="font-semibold text-lg mb-2 text-charcoal">1. الشروط العامة</h2>
          <p>
            باستخدامكِ لمنصة لوميرا، فإنكِ توافقين على شرائنا الخاصة باستخدام المنصة، بما في ذلك
            الأسعار المعروضة، وسياسات الطلب والدفع والشحن الموضحة أدناه.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-lg mb-2 text-charcoal">2. الطلبات والدفع</h2>
          <p>
            يتم الدفع حاليًا عن طريق التحويل البنكي فقط. لا يُعتبر الطلب مؤكدًا ومدفوعًا إلا بعد
            رفع إثبات الدفع وموافقة الإدارة عليه.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-lg mb-2 text-charcoal">3. الموردون</h2>
          <p>
            يخضع كل مورد ومنتج للمراجعة والموافقة من قبل إدارة المنصة قبل النشر، وتحتفظ الإدارة
            بحق رفض أي منتج أو مورد لا يستوفي معايير الجودة.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-lg mb-2 text-charcoal">4. الخصوصية</h2>
          <p>
            نحن نحترم خصوصيتكِ ونلتزم بحماية بياناتكِ الشخصية، ولا نشارك معلوماتكِ مع أي جهة
            خارجية إلا بالقدر اللازم لإتمام عملية الشحن والتوصيل.
          </p>
        </section>
      </div>
    </div>
  );
}
