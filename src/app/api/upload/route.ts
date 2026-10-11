import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { bucket } from "@/lib/blob";
import { getCurrentUser } from "@/lib/auth";
import { generateId } from "@/lib/utils";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "misc";

  if (!file) return NextResponse.json({ error: "لم يتم إرفاق ملف" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "نوع الملف غير مسموح. يجب أن تكون صورة (jpg, png, webp)" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "حجم الملف كبير جدًا (الحد الأقصى 5 ميجابايت)" }, { status: 400 });
  }

  const safeFolder = ["products", "payment-proofs"].includes(folder) ? folder : "misc";
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${generateId()}.${ext}`;
  const path = `lumera/${safeFolder}/${filename}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = await bucket.put(path, buffer, {
    contentType: file.type,
    maxSize: "5mb",
  });

  return NextResponse.json({ success: true, path: blob.url });
}
