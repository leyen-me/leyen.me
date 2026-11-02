"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Crop, ImagePlus, Link2, Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ImageInput } from "@/lib/admin/sanity-helpers";
import ImageCropDialog from "@/app/admin/components/ImageCropDialog";
import { cn } from "@/lib/utils";

const MAX_INPUT_BYTES = 25 * 1024 * 1024;

type UploadResponse = {
  assetId?: string;
  url?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  originalBytes?: number;
  optimized?: boolean;
  error?: string;
};

type ImageUploadFieldProps = {
  label: string;
  value?: ImageInput | null;
  onChange: (value: ImageInput | null) => void;
  previewUrl?: string;
  hint?: string;
  /** Locked crop ratio (width / height), enforced by field context. */
  aspect?: number;
};

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function describeResult(data: UploadResponse): string {
  const size = formatBytes(data.bytes);
  const dimensions =
    data.width && data.height ? `${data.width}×${data.height}` : "原始尺寸";
  const format = (data.format ?? "").toUpperCase();

  if (!data.optimized) {
    return `已上传 ${size} · ${dimensions} · ${format}（原图已足够小，未二次压缩）`;
  }

  const saved =
    data.originalBytes && data.bytes
      ? `−${Math.round((1 - data.bytes / data.originalBytes) * 100)}%`
      : "";

  return `已压缩 ${formatBytes(data.originalBytes)} → ${size}${saved ? `（${saved}）` : ""} · ${dimensions} · ${format}`;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  previewUrl,
  hint = "支持本地上传、剪贴板粘贴、图片直链；上传前会裁剪并压缩到长边 2400px 的 WebP",
  aspect = 16 / 9,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [dragging, setDragging] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [localPreview, setLocalPreview] = useState<string | undefined>(previewUrl);
  const [alt, setAlt] = useState(value?.alt ?? "");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => releaseObjectUrl, [releaseObjectUrl]);

  /** Local files are cropped before upload, so only the cropped pixels travel. */
  const openCropForFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("请选择图片文件");
        return;
      }
      if (file.size > MAX_INPUT_BYTES) {
        setError(`图片超过 ${MAX_INPUT_BYTES / 1024 / 1024}MB 上限`);
        return;
      }

      releaseObjectUrl();
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setError("");
      setCropSrc(url);
    },
    [releaseObjectUrl]
  );

  const closeCrop = useCallback(() => {
    setCropSrc(null);
    releaseObjectUrl();
  }, [releaseObjectUrl]);

  const assetId = value?.assetId;

  useEffect(() => {
    setLocalPreview(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    setAlt(value?.alt ?? "");
  }, [value?.alt]);

  const upload = useCallback(
    async (request: () => Promise<Response>): Promise<boolean> => {
      setUploading(true);
      setError("");
      setInfo("");
      try {
        const res = await request();
        const data = (await res.json()) as UploadResponse;
        if (!res.ok || !data.assetId) {
          throw new Error(data.error || "上传失败");
        }

        onChange({ assetId: data.assetId, alt: alt ?? "" });
        setLocalPreview(data.url);
        setInfo(describeResult(data));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "上传失败");
        return false;
      } finally {
        setUploading(false);
      }
    },
    [alt, onChange]
  );

  const uploadBlob = useCallback(
    (blob: Blob) => {
      const file = new File([blob], `cover-${Date.now()}.webp`, {
        type: blob.type || "image/webp",
      });

      return upload(() => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("kind", "image");
        return fetch("/api/admin/upload", { method: "POST", body: formData });
      });
    },
    [upload]
  );

  const handleCropConfirm = useCallback(
    ({ blob }: { blob: Blob }) => {
      void uploadBlob(blob).then((ok) => {
        if (ok) closeCrop();
      });
    },
    [closeCrop, uploadBlob]
  );

  const importUrl = useCallback(() => {
    const url = urlDraft.trim();
    if (!url) return;

    void upload(() =>
      fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
    ).then((ok) => {
      if (ok) setUrlDraft("");
    });
  }, [upload, urlDraft]);

  // Cmd/Ctrl+V anywhere on the page, as long as the user is not typing.
  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;

      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.kind !== "file" || !item.type.startsWith("image/")) continue;
        const file = item.getAsFile();
        if (!file) continue;

        event.preventDefault();
        openCropForFile(file);
        return;
      }
    }

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [openCropForFile]);

  function handleRemove() {
    onChange(null);
    setLocalPreview(undefined);
    setInfo("");
    setError("");
    setAlt("");
  }

  function handleAltChange(next: string) {
    setAlt(next);
    if (assetId) onChange({ assetId, alt: next });
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {localPreview ? (
        <div
          className="relative w-full max-w-xs overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700 sm:max-w-sm md:w-64"
          style={{ aspectRatio: aspect }}
        >
          <Image
            src={localPreview}
            alt={alt || label}
            fill
            sizes="(max-width: 640px) 100vw, 256px"
            className="object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`移除${label}`}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {localPreview && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() => {
              setError("");
              setCropSrc(localPreview);
            }}
          >
            <Crop className="h-4 w-4" />
            裁剪
          </Button>
          <span className="text-xs text-zinc-500">裁剪后可再次裁，会生成新图片</span>
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        aria-label={`${label}：点击选择图片，或拖拽、粘贴图片`}
        aria-disabled={uploading}
        onClick={() => {
          if (!uploading) inputRef.current?.click();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) openCropForFile(file);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed px-4 py-6 text-center transition-colors",
          "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/60",
          dragging && "border-zinc-500 bg-zinc-50 dark:border-zinc-400 dark:bg-zinc-900",
          uploading && "pointer-events-none opacity-70"
        )}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-zinc-500" aria-hidden />
        ) : (
          <UploadCloud className="h-5 w-5 text-zinc-500" aria-hidden />
        )}
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {uploading ? "上传并压缩中..." : "点击选择 / 拖拽图片到这里"}
        </p>
        <p className="text-xs text-zinc-500">或直接按 ⌘V 粘贴剪贴板图片</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) openCropForFile(file);
          event.target.value = "";
        }}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Link2
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <Input
            placeholder="粘贴图片直链（如 Unsplash），回车导入"
            value={urlDraft}
            onChange={(event) => setUrlDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                importUrl();
              }
            }}
            disabled={uploading}
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={importUrl}
          disabled={uploading || !urlDraft.trim()}
          className="shrink-0"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          导入链接
        </Button>
      </div>

      <Input
        placeholder="Alt text（选填，留空则前台用标题）"
        value={alt}
        onChange={(event) => handleAltChange(event.target.value)}
        disabled={!assetId}
      />

      {info && <p className="text-xs text-emerald-600 dark:text-emerald-400">{info}</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {!info && !error && <p className="text-xs text-zinc-500">{hint}</p>}

      <ImageCropDialog
        open={!!cropSrc}
        src={cropSrc}
        aspect={aspect}
        busy={uploading}
        onCancel={closeCrop}
        onConfirm={handleCropConfirm}
      />
    </div>
  );
}
