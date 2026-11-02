"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Crop, Loader2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Normalised crop rect: 0..1 relative to the natural image size. */
type CropRect = { x: number; y: number; w: number; h: number };

type DragMode = "move" | "nw" | "ne" | "sw" | "se";

type ImageCropDialogProps = {
  open: boolean;
  src: string | null;
  /** Locked pixel aspect ratio (width / height); each field enforces its own. */
  aspect: number;
  /** True while the caller uploads the cropped result. */
  busy?: boolean;
  onCancel: () => void;
  onConfirm: (result: { blob: Blob; width: number; height: number }) => void;
};

const MIN_BOX = 0.02;
const MAX_CANVAS_EDGE = 4096;

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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Largest rect with the given normalised w/h ratio, centred in the image. */
function centredRect(normRatio: number): CropRect {
  let w = 1;
  let h = w / normRatio;

  if (h > 1) {
    h = 1;
    w = h * normRatio;
  }

  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
}

export default function ImageCropDialog({
  open,
  src,
  aspect,
  busy = false,
  onCancel,
  onConfirm,
}: ImageCropDialogProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [rect, setRect] = useState<CropRect>({ x: 0, y: 0, w: 1, h: 1 });
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dragRef = useRef<{
    mode: DragMode;
    bounds: DOMRect;
    origin: CropRect;
    grab: { dx: number; dy: number };
  } | null>(null);

  /** w/h ratio expressed in normalised units. */
  const normRatio = useMemo(() => {
    if (!natural) return null;
    return aspect * (natural.height / natural.width);
  }, [aspect, natural]);

  useEffect(() => {
    if (open) return;
    setNatural(null);
    setRect({ x: 0, y: 0, w: 1, h: 1 });
    setError("");
    setRendering(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  const resetRect = useCallback(() => {
    if (!normRatio) return;
    setRect(centredRect(normRatio));
  }, [normRatio]);

  function beginDrag(mode: DragMode, event: React.PointerEvent) {
    const image = imageRef.current;
    if (!image) return;

    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);

    const bounds = image.getBoundingClientRect();
    const px = (event.clientX - bounds.left) / bounds.width;
    const py = (event.clientY - bounds.top) / bounds.height;

    dragRef.current = {
      mode,
      bounds,
      origin: rect,
      grab: { dx: px - rect.x, dy: py - rect.y },
    };
  }

  function onPointerMove(event: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag || !normRatio) return;

    const { bounds, origin, mode, grab } = drag;
    const px = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
    const py = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);

    if (mode === "move") {
      setRect({
        ...origin,
        x: clamp(px - grab.dx, 0, 1 - origin.w),
        y: clamp(py - grab.dy, 0, 1 - origin.h),
      });
      return;
    }

    // The corner opposite the dragged handle stays anchored.
    const anchorX = mode === "nw" || mode === "sw" ? origin.x + origin.w : origin.x;
    const anchorY = mode === "nw" || mode === "ne" ? origin.y + origin.h : origin.y;

    let w = clamp(Math.abs(px - anchorX), MIN_BOX, 1);
    let h = clamp(Math.abs(py - anchorY), MIN_BOX, 1);

    if (w / normRatio > h) h = w / normRatio;
    else w = h * normRatio;

    const maxW = px < anchorX ? anchorX : 1 - anchorX;
    const maxH = py < anchorY ? anchorY : 1 - anchorY;
    w = Math.max(MIN_BOX, Math.min(w, maxW, maxH * normRatio));
    h = w / normRatio;

    setRect({
      x: px < anchorX ? anchorX - w : anchorX,
      y: py < anchorY ? anchorY - h : anchorY,
      w,
      h,
    });
  }

  function endDrag() {
    dragRef.current = null;
  }

  async function handleConfirm() {
    const image = imageRef.current;
    if (!image || !natural) return;

    setRendering(true);
    setError("");

    try {
      const sourceWidth = rect.w * natural.width;
      const sourceHeight = rect.h * natural.height;
      const scale = Math.min(1, MAX_CANVAS_EDGE / Math.max(sourceWidth, sourceHeight));

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(sourceWidth * scale));
      canvas.height = Math.max(1, Math.round(sourceHeight * scale));

      const context = canvas.getContext("2d");
      if (!context) throw new Error("浏览器不支持画布裁剪");

      context.drawImage(
        image,
        rect.x * natural.width,
        rect.y * natural.height,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.95)
      );
      if (!blob) throw new Error("裁剪失败，请重试");

      onConfirm({ blob, width: canvas.width, height: canvas.height });
    } catch (err) {
      setError(err instanceof Error ? err.message : "裁剪失败");
    } finally {
      setRendering(false);
    }
  }

  if (!open || !src || !mounted) return null;

  const outputWidth = natural ? Math.round(rect.w * natural.width) : 0;
  const outputHeight = natural ? Math.round(rect.h * natural.height) : 0;
  const disabled = busy || rendering;

  const maskTop = rect.y;
  const maskBottom = 1 - rect.y - rect.h;
  const maskLeft = rect.x;
  const maskRight = 1 - rect.x - rect.w;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="裁剪图片"
        className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Crop className="h-4 w-4" aria-hidden />
            <h2 className="text-sm font-semibold">裁剪图片</h2>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              固定 {aspectLabel(aspect)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetRect}
              disabled={!natural}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              重置
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={onCancel} aria-label="关闭裁剪">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
          <div className="flex justify-center rounded-md bg-zinc-100 p-3 dark:bg-zinc-900">
            {/* overflow-hidden keeps the mask inside the image, never over the dialog chrome */}
            <div className="relative inline-block select-none overflow-hidden rounded-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={src}
                alt="待裁剪图片"
                crossOrigin="anonymous"
                draggable={false}
                onLoad={(event) => {
                  const element = event.currentTarget;
                  const size = {
                    width: element.naturalWidth,
                    height: element.naturalHeight,
                  };
                  setNatural(size);
                  setRect(centredRect(aspect * (size.height / size.width)));
                }}
                onError={() => setError("图片加载失败，可能是跨域限制，请重新上传后再裁剪")}
                className="block max-h-[52vh] max-w-full"
              />

              {natural && (
                <div
                  className="absolute inset-0 touch-none"
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                >
                  <div
                    className="absolute inset-x-0 top-0 bg-black/50"
                    style={{ height: `${maskTop * 100}%` }}
                    aria-hidden
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 bg-black/50"
                    style={{ height: `${maskBottom * 100}%` }}
                    aria-hidden
                  />
                  <div
                    className="absolute left-0 bg-black/50"
                    style={{
                      top: `${rect.y * 100}%`,
                      height: `${rect.h * 100}%`,
                      width: `${maskLeft * 100}%`,
                    }}
                    aria-hidden
                  />
                  <div
                    className="absolute right-0 bg-black/50"
                    style={{
                      top: `${rect.y * 100}%`,
                      height: `${rect.h * 100}%`,
                      width: `${maskRight * 100}%`,
                    }}
                    aria-hidden
                  />

                  <div
                    role="presentation"
                    className="absolute cursor-move border border-white"
                    style={{
                      left: `${rect.x * 100}%`,
                      top: `${rect.y * 100}%`,
                      width: `${rect.w * 100}%`,
                      height: `${rect.h * 100}%`,
                    }}
                    onPointerDown={(event) => beginDrag("move", event)}
                  >
                    {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                      <span
                        key={corner}
                        role="presentation"
                        onPointerDown={(event) => beginDrag(corner, event)}
                        className={cn(
                          "absolute h-3 w-3 rounded-sm border border-zinc-500 bg-white",
                          corner === "nw" && "left-0 top-0 cursor-nwse-resize",
                          corner === "ne" && "right-0 top-0 cursor-nesw-resize",
                          corner === "sw" && "bottom-0 left-0 cursor-nesw-resize",
                          corner === "se" && "bottom-0 right-0 cursor-nwse-resize"
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-zinc-500">
            拖动方框移动，拖动四角缩放，比例固定为 {aspectLabel(aspect)}
            {outputWidth > 0 && ` · 输出约 ${outputWidth}×${outputHeight}px`}
          </p>
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onCancel} disabled={disabled}>
            取消
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={disabled || !natural}>
            {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crop className="h-4 w-4" />}
            {busy ? "上传中..." : "裁剪并上传"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
