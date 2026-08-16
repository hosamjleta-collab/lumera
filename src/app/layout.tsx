import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const cairo = localFont({
  src: "../fonts/Cairo-Variable.ttf",
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumera | لوميرا - متجر مستحضرات التجميل",
  description: "لوميرا - وجهتك الفاخرة لمستحضرات التجميل، العناية بالبشرة، العطور والمزيد.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-charcoal">{children}</body>
    </html>
  );
}
