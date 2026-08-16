import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream/90 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-extrabold text-white mb-3">
            Lumera<span className="text-gold">.</span>
          </h3>
          <p className="text-sm text-cream/60 leading-relaxed">
            وجهتك الفاخرة لمستحضرات التجميل والعناية بالبشرة والعطور، بجودة عالية وثقة تامة.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-white">روابط سريعة</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/products" className="hover:text-gold">كل المنتجات</Link></li>
            <li><Link href="/about" className="hover:text-gold">من نحن</Link></li>
            <li><Link href="/contact" className="hover:text-gold">اتصل بنا</Link></li>
            <li><Link href="/terms" className="hover:text-gold">الشروط والخصوصية</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-white">التصنيفات</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/categories/makeup" className="hover:text-gold">المكياج</Link></li>
            <li><Link href="/categories/skincare" className="hover:text-gold">العناية بالبشرة</Link></li>
            <li><Link href="/categories/perfumes" className="hover:text-gold">العطور</Link></li>
            <li><Link href="/categories/haircare" className="hover:text-gold">العناية بالشعر</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-white">للموردين</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/register?role=supplier" className="hover:text-gold">انضم كمورد</Link></li>
            <li><Link href="/login" className="hover:text-gold">تسجيل الدخول</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 py-4 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} Lumera. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
