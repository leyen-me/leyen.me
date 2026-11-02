"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, RotateCcw } from "lucide-react";
import BottomSheet, { SheetCancel, SheetItem } from "@/app/admin/components/BottomSheet";
import ImageCropDialog from "@/app/admin/components/ImageCropDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ImageInput } from "@/lib/admin/sanity-helpers";
import { cn } from "@/lib/utils";

const MAX_INPUT_BYTES = 25 * 1024 * 1024;

type UploadResponse = {
  assetId?: string;
  url?: string;
  error?: string;
};

type ImageUploadFieldProps = {
  label: string;
  value?: ImageInput | null;
  onChange: (value: ImageInput | null) => void;
  previewUrl?: string;
  /** Locked crop ratio (width / height), enforced by field context. */
  aspect?: number;
};

type SheetMode = "menu" | "url" | "description" | null;

const KNOWN_ASPECTS: Array<{ label: string; value: number }> = [
  { label: "1:1", value: 1 },
  { label: "16:9", value: 16 / 9 },
  { label: "16:10", value: 16 / 10 },
  { label: "3:2", value: 3 / 2 },
  { label: "4:3", value: 4 / 3 },
  { label: "2:3", value: 2 / 3 },
  { label: "3:4", value: 3 / 4 },
];

function aspectLabel(aspect: number): string {
  const known = KNOWN_ASPECTS.find((item) => Math.abs(item.value - aspect) < 0.01);
  return known ? known.label : aspect.toFixed(2);
}

type Toast = { text: string; tone: "info" | "error"; undo?: () => void };

/**
 * WeChat-style image field: one tappable row, actions in a bottom sheet.
 * Upload, paste and URL import all end in the same crop + upload pipeline.
 */
export default function ImageUploadField({
  label,
  value,
  onChange,
  previewUrl,
  aspect = 16 / 9,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [sheet, setSheet] = useState<SheetMode>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | undefined>(previewUrl);
  const [urlDraft, setUrlDraft] = useState("");
  const [description, setDescription] = useState(value?.alt ?? "");
  const [toast, setToast] = useState<Toast | null>(null);

  const assetId = value?.assetId;

  useEffect(() => setLocalPreview(previewUrl), [previewUrl]);
  useEffect(() => setDescription(value?.alt ?? ""), [value?.alt]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), toast.undo ? 6000 : 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => releaseObjectUrl, [releaseObjectUrl]);

  const upload = useCallback(
    async (request: () => Promise<Response>) => {
      setUploading(true);
      try {
        const res = await request();
        const data = (await res.json()) as UploadResponse;
        if (!res.ok || !data.assetId) throw new Error(data.error || "上传失败");

        onChange({ assetId: data.assetId, alt: description || "" });
        setLocalPreview(data.url);
        return true;
      } catch (err) {
        setToast({
          text: err instanceof Error ? err.message : "上传失败",
          tone: "error",
        });
        return false;
      } finally {
        setUploading(false);
      }
    },
    [description, onChange]
  );

  const openCropForFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setToast({ text: "请选择图片文件", tone: "error" });
        return;
      }
      if (file.size > MAX_INPUT_BYTES) {
        setToast({
          text: `图片不能超过 ${MAX_INPUT_BYTES / 1024 / 1024}MB`,
          tone: "error",
        });
        return;
      }

      releaseObjectUrl();
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setSheet(null);
      setCropSrc(url);
    },
    [releaseObjectUrl]
  );

  const closeCrop = useCallback(() => {
    setCropSrc(null);
    releaseObjectUrl();
  }, [releaseObjectUrl]);

  const handleCropConfirm = useCallback(
    ({ blob }: { blob: Blob }) => {
      const file = new File([blob], `cover-${Date.now()}.webp`, {
        type: blob.type || "image/webp",
      });

      void upload(() => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("kind", "image");
        return fetch("/api/admin/upload", { method: "POST", body: formData });
      }).then((ok) => {
        if (ok) {
          closeCrop();
          setToast({ text: "图片已更新", tone: "info" });
        }
      });
    },
    [closeCrop, upload]
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
      if (!ok) return;
      setUrlDraft("");
      setSheet(null);
      setToast({ text: "图片已导入", tone: "info" });
    });
  }, [upload, urlDraft]);

  const handleRemove = useCallback(() => {
    const previous = { value: value ?? null, preview: localPreview };
    onChange(null);
    setLocalPreview(undefined);
    setSheet(null);
    setToast({
      text: `已移除${label}`,
      tone: "info",
      undo: () => {
        onChange(previous.value);
        setLocalPreview(previous.preview);
      },
    });
  }, [label, localPreview, onChange, value]);

  // Cmd/Ctrl+V anywhere, unless the user is typing in a field.
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
        setSheet(null);
        openCropForFile(file);
        return;
      }
    }

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [openCropForFile]);

  const openSheet = () => setSheet("menu");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-zinc-400">{aspectLabel(aspect)}</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={openSheet}
          aria-label={assetId ? `更换${label}` : `添加${label}`}
          className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
        >
          <span
            className="relative block shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800"
            style={{ width: 104, aspectRatio: aspect }}
          >
            {localPreview ? (
              <Image
                src={localPreview}
                alt={description || label}
                fill
                sizes="104px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-zinc-400">
                <ImagePlus className="h-5 w-5" aria-hidden />
              </span>
            )}

            {uploading && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="h-4 w-4 animate-spin text-white" aria-hidden />
              </span>
            )}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-zinc-900 dark:text-zinc-100">
              {uploading ? "上传中…" : assetId ? "已设置" : "未设置"}
            </span>
            <span className="mt-0.5 block truncate text-xs text-zinc-500">
              {assetId ? "点击更换或编辑" : "点击添加图片"}
            </span>
          </span>

          <span className="shrink-0 text-sm text-zinc-500">
            {assetId ? "更换" : "添加"}
          </span>
        </button>
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

      <BottomSheet
        open={sheet === "menu"}
        title={`${label} · ${aspectLabel(aspect)}`}
        onClose={() => setSheet(null)}
      >
        <SheetItem
          onClick={() => {
            setSheet(null);
            inputRef.current?.click();
          }}
        >
          从本机选择
        </SheetItem>
        <SheetItem onClick={() => setSheet("url")}>从链接导入</SheetItem>
        {assetId && (
          <>
            <SheetItem
              onClick={() => {
                setSheet(null);
                if (localPreview) setCropSrc(localPreview);
              }}
            >
              编辑裁剪
            </SheetItem>
            <SheetItem onClick={() => setSheet("description")}>图片描述</SheetItem>
            <SheetItem tone="danger" onClick={handleRemove}>
              移除{label}
            </SheetItem>
          </>
        )}
        <SheetCancel onClick={() => setSheet(null)} />
      </BottomSheet>

      <BottomSheet
        open={sheet === "url"}
        title="从链接导入"
        description="支持图片直链，例如 Unsplash"
        onClose={() => setSheet(null)}
      >
        <div className="space-y-3 p-2">
          <Input
            autoFocus
            placeholder="https://images.unsplash.com/…"
            value={urlDraft}
            onChange={(event) => setUrlDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                importUrl();
              }
            }}
            disabled={uploading}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setSheet("menu")}
              disabled={uploading}
            >
              返回
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={importUrl}
              disabled={uploading || !urlDraft.trim()}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "导入"}
            </Button>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet
        open={sheet === "description"}
        title="图片描述"
        description="供读屏软件朗读，留空则使用页面标题"
        onClose={() => setSheet(null)}
      >
        <div className="space-y-3 p-2">
          <Input
            autoFocus
            placeholder="例如：夕阳下的城市天际线"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={120}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setDescription(value?.alt ?? "");
                setSheet(null);
              }}
            >
              取消
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => {
                if (assetId) onChange({ assetId, alt: description });
                setSheet(null);
                setToast({ text: "描述已保存", tone: "info" });
              }}
            >
              保存
            </Button>
          </div>
        </div>
      </BottomSheet>

      <ImageCropDialog
        open={!!cropSrc}
        src={cropSrc}
        aspect={aspect}
        busy={uploading}
        onCancel={closeCrop}
        onConfirm={handleCropConfirm}
      />

      {toast && (
        <div
          role="status"
          className={cn(
            "fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-3 rounded-full px-4 py-2 text-sm text-white shadow-lg",
            toast.tone === "error" ? "bg-red-600" : "bg-zinc-900/95"
          )}
        >
          <span>{toast.text}</span>
          {toast.undo && (
            <button
              type="button"
              onClick={() => {
                toast.undo?.();
                setToast(null);
              }}
              className="flex items-center gap-0.5 font-medium text-emerald-300"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              撤销
            </button>
          )}
        </div>
      )}
    </div>
  );
}
