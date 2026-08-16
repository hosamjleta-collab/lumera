import { randomBytes } from "crypto";

export function generateId(prefix: string = ""): string {
  const id = randomBytes(12).toString("hex");
  return prefix ? `${prefix}_${id}` : id;
}

export function generateOrderReference(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LUM-${y}${m}${d}-${rand}`;
}

/** يحسب سعر البيع للعميل بناءً على سعر المورد ونسبة العمولة */
export function calculateSellingPrice(supplierPrice: number, commissionPercentage: number): number {
  const price = supplierPrice * (1 + commissionPercentage / 100);
  return Math.round(price * 100) / 100;
}

export function slugify(text: string): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^\u0621-\u064Aa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString("ar-LY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ل`;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  new: "جديد",
  awaiting_payment: "بانتظار الدفع",
  proof_uploaded: "تم رفع إثبات الدفع",
  payment_review: "الدفع قيد المراجعة",
  payment_confirmed: "تم تأكيد الدفع",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export const ORDER_STATUS_FLOW = [
  "new",
  "awaiting_payment",
  "proof_uploaded",
  "payment_review",
  "payment_confirmed",
  "processing",
  "shipped",
  "completed",
] as const;
