"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ImageInput } from "@/lib/admin/sanity-helpers";

type ImageUploadFieldProps = {
  label: string;
  value?: ImageInput | null;
  onChange: (value: ImageInput | null) => void;
  previewUrl?: string;
};

export default function ImageUploadField({
  label,
  value,
  onChange,
  previewUrl,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "image");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange({ assetId: data.assetId, alt: value?.alt ?? "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {(previewUrl || value?.assetId) && (
        <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700 sm:max-w-sm md:w-64">
          {previewUrl ? (
            <Image src={previewUrl} alt={value?.alt || label} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              已上传图片
            </div>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "上传中..." : "上传图片"}
        </Button>
        {value?.assetId && (
          <Button type="button" variant="ghost" onClick={() => onChange(null)}>
            移除
          </Button>
        )}
      </div>
      <Input
        placeholder="Alt text"
        value={value?.alt ?? ""}
        onChange={(e) =>
          onChange(
            value?.assetId
              ? { assetId: value.assetId, alt: e.target.value }
              : null
          )
        }
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
