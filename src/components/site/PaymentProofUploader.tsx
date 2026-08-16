"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentProofUploader({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const alreadyUploaded = !["awaiting_payment", "new"].includes(currentStatus);

  async function handleUpload() {
    if (!file) {
      setError("يرجى اختيار صورة إثبات الدفع أولاً");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "payment-proofs");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setError(uploadData.error || "فشل رفع الصورة");
        setLoading(false);
        return;
      }

      const proofRes = await fetch(`/api/orders/${orderId}/payment-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePath: uploadData.path }),
      });
      const proofData = await proofRes.json();
      if (!proofRes.ok) {
        setError(proofData.error || "حدث خطأ");
        setLoading(false);
        return;
      }
      setMessage("تم رفع إثبات الدفع بنجاح، سيتم مراجعته من قبل الإدارة قريبًا.");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    }
    setLoading(false);
  }

  if (message) {
    return <p className="text-green-600 text-sm">{message}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {alreadyUploaded && (
        <p className="text-sm text-charcoal/60 mb-1">
          تم رفع إثبات دفع سابقًا لهذا الطلب. يمكنكِ رفع إثبات جديد إذا لزم الأمر.
        </p>
      )}
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-sm"
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="btn-gold rounded-full py-2.5 font-medium disabled:opacity-60 w-full sm:w-56"
      >
        {loading ? "جارٍ الرفع..." : "رفع إثبات الدفع"}
      </button>
    </div>
  );
}
