import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getCartCount, getCategories } from "@/lib/data";
import SearchBox from "./SearchBox";
import MobileMenu from "./MobileMenu";

export default async function Header() {
  const user = await getCurrentUser();
  const cartCount = user ? await getCartCount(user.id) : 0;
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-charcoal/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            <MobileMenu categories={categories} user={user} />
            <Link href="/" className="text-2xl font-extrabold tracking-wide text-charcoal">
              Lumera<span className="text-gold">.</span>
            </Link>
          </div>

          <div className="hidden md:block flex-1 max-w-md">
            <SearchBox />
          </div>

          <nav className="flex items-center gap-4 sm:gap-5">
            <Link
              href={user ? (user.role === "admin" ? "/admin" : user.role === "supplier" ? "/supplier" : "/account") : "/login"}
              className="flex flex-col items-center text-charcoal hover:text-gold transition-colors"
              title="حسابي"
            >
              <UserIcon />
              <span className="hidden sm:block text-[11px] mt-0.5">
                {user ? "حسابي" : "دخول"}
              </span>
            </Link>
            {(!user || user.role === "customer") && (
              <Link
                href="/cart"
                className="relative flex flex-col items-center text-charcoal hover:text-gold transition-colors"
                title="السلة"
              >
                <CartIcon />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -left-2 bg-gold text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
                <span className="hidden sm:block text-[11px] mt-0.5">السلة</span>
              </Link>
            )}
          </nav>
        </div>
        <div className="md:hidden pb-3">
          <SearchBox />
        </div>
        <div className="hidden md:flex items-center gap-6 pb-3 text-sm">
          {categories.map((c) => (
            <Link key={c.id} href={`/categories/${c.slug}`} className="text-charcoal/80 hover:text-gold transition-colors">
              {c.name}
            </Link>
          ))}
          <Link href="/products" className="text-charcoal/80 hover:text-gold transition-colors">
            كل المنتجات
          </Link>
        </div>
      </div>
    </header>
  );
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" />
    </svg>
  );
}
