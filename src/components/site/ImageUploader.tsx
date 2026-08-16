"use client";

import { useState } from "react";

export default function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    const newPaths: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "products");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل رفع إحدى الصور");
        continue;
      }
      newPaths.push(data.path);
    }
    onChange([...images, ...newPaths]);
    setUploading(false);
  }

  function removeImage(path: string) {
    onChange(images.filter((p) => p !== path));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((img) => (
          <div key={img} className="relative w-20 h-20 rounded-xl overflow-hidden border border-charcoal/10">
            <img src={img} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(img)}
              className="absolute top-0.5 left-0.5 bg-charcoal/70 text-white w-5 h-5 rounded-full text-xs leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="text-sm"
      />
      {uploading && <p className="text-xs text-charcoal/50 mt-1">جارٍ رفع الصور...</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
