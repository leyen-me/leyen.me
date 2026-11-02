"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ImageCropDialogProps = {
  open: boolean;
  src: string | null;
  /** Locked pixel aspect ratio (width / height). */
  aspect: number;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: (result: { blob: Blob; width: number; height: number }) => void;
};

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const MAX_CANVAS_EDGE = 4096;
/** How much of the viewport the crop frame may occupy. */
const FRAME_FILL = 0.94;

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

/**
 * WeChat-style cropper: the whole photo stays visible, the crop frame floats
 * above it and everything outside the frame is dimmed, so users can see what
 * they are cutting off and which direction still has room to drag.
 */
export default function ImageCropDialog({
  open,
  src,
  aspect,
  busy = false,
  onCancel,
  onConfirm,
}: ImageCropDialogProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [viewportCap, setViewportCap] = useState(0);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState("");

  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);

  useEffect(() => setMounted(true), []);

  /**
   * Crop frame geometry: as large as the target ratio allows inside the
   * viewport. The viewport then shrinks to the frame plus its margin so the
   * dialog keeps a stable size on both phone and desktop.
   */
  const frame = useMemo(() => {
    if (!viewport.width || !viewportCap) return { width: 0, height: 0, left: 0, top: 0 };

    let width = viewport.width * FRAME_FILL;
    let height = width / aspect;
    if (height > viewportCap * FRAME_FILL) {
      height = viewportCap * FRAME_FILL;
      width = height * aspect;
    }

    return {
      width,
      height,
      left: (viewport.width - width) / 2,
      top: 0,
    };
  }, [aspect, viewport.width, viewportCap]);

  const viewportHeight = frame.height > 0
    ? Math.min(viewportCap, frame.height / FRAME_FILL)
    : viewportCap;

  /** Scale needed for the image to exactly cover the frame at zoom 1. */
  const coverScale =
    natural && frame.width
      ? Math.max(frame.width / natural.width, frame.height / natural.height)
      : 1;

  const display = natural
    ? {
        width: natural.width * coverScale * scale,
        height: natural.height * coverScale * scale,
      }
    : { width: 0, height: 0 };

  const maxOffsetX = Math.max(0, (display.width - frame.width) / 2);
  const maxOffsetY = Math.max(0, (display.height - frame.height) / 2);

  useEffect(() => {
    if (open) return;
    setNatural(null);
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setError("");
    setRendering(false);
    pointers.current.clear();
    dragRef.current = null;
    pinchRef.current = null;
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function measure() {
      const element = viewportRef.current;
      if (element) setViewport({ width: element.clientWidth, height: element.clientHeight });
      setViewportCap(Math.round(window.innerHeight * 0.62));
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
        );
        if (focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }

      const step = event.shiftKey ? 40 : 10;
      if (event.key === "ArrowLeft") setOffset((prev) => ({ ...prev, x: prev.x + step }));
      if (event.key === "ArrowRight") setOffset((prev) => ({ ...prev, x: prev.x - step }));
      if (event.key === "ArrowUp") setOffset((prev) => ({ ...prev, y: prev.y + step }));
      if (event.key === "ArrowDown") setOffset((prev) => ({ ...prev, y: prev.y - step }));
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onCancel]);

  useEffect(() => {
    setOffset((prev) => ({
      x: clamp(prev.x, -maxOffsetX, maxOffsetX),
      y: clamp(prev.y, -maxOffsetY, maxOffsetY),
    }));
  }, [maxOffsetX, maxOffsetY]);

  const zoomTo = useCallback((next: number) => {
    setScale(clamp(next, MIN_SCALE, MAX_SCALE));
  }, []);

  function onPointerDown(event: React.PointerEvent) {
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinchRef.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale };
      dragRef.current = null;
      return;
    }

    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size === 2 && pinchRef.current) {
      const [a, b] = Array.from(pointers.current.values());
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchRef.current.distance > 0) {
        zoomTo(pinchRef.current.scale * (distance / pinchRef.current.distance));
      }
      return;
    }

    const drag = dragRef.current;
    if (!drag) return;

    setOffset({
      x: clamp(drag.originX + (event.clientX - drag.startX), -maxOffsetX, maxOffsetX),
      y: clamp(drag.originY + (event.clientY - drag.startY), -maxOffsetY, maxOffsetY),
    });
  }

  function onPointerUp(event: React.PointerEvent) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 0) dragRef.current = null;
  }

  function onWheel(event: React.WheelEvent) {
    event.preventDefault();
    zoomTo(scale * Math.exp(-event.deltaY * 0.0015));
  }

  /** Source pixels currently inside the frame. */
  const visible = natural && frame.width > 0
    ? {
        width: frame.width / (coverScale * scale),
        height: frame.height / (coverScale * scale),
      }
    : null;

  async function handleConfirm() {
    const image = imageRef.current;
    if (!image || !natural || !visible) return;

    setRendering(true);
    setError("");

    try {
      // Image top-left relative to the frame, in display pixels.
      const imageLeft = (frame.width - display.width) / 2 + offset.x;
      const imageTop = (frame.height - display.height) / 2 + offset.y;
      const unit = coverScale * scale;

      const sx = clamp(-imageLeft / unit, 0, Math.max(0, natural.width - visible.width));
      const sy = clamp(-imageTop / unit, 0, Math.max(0, natural.height - visible.height));
      const sw = Math.min(visible.width, natural.width - sx);
      const sh = Math.min(visible.height, natural.height - sy);

      const outputScale = Math.min(1, MAX_CANVAS_EDGE / Math.max(sw, sh));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(sw * outputScale));
      canvas.height = Math.max(1, Math.round(sh * outputScale));

      const context = canvas.getContext("2d");
      if (!context) throw new Error("浏览器不支持画布裁剪");

      context.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

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

  const disabled = busy || rendering;

  const imageStyle = natural
    ? {
        width: `${display.width}px`,
        height: `${display.height}px`,
        left: `${frame.left + (frame.width - display.width) / 2 + offset.x}px`,
        top: `${frame.top + (frame.height - display.height) / 2 + offset.y}px`,
        transform: "none" as const,
      }
    : undefined;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="裁剪图片"
      className="fixed inset-0 z-[80] flex flex-col bg-black"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-11 px-4 text-white hover:bg-white/15 hover:text-white"
        >
          取消
        </Button>
        <div className="text-center">
          <p className="text-sm font-medium text-white">裁剪 · {aspectLabel(aspect)}</p>
          <p className="text-[11px] text-white/50">框内为最终封面</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleConfirm}
          disabled={disabled || !natural}
          className="h-11 min-w-[72px]"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "完成"}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 pb-4">
        <div
          ref={viewportRef}
          className="relative w-full touch-none select-none"
          style={{ maxWidth: 900, height: viewportHeight || "62vh" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          {/* image keeps its position in the whole photo; the frame floats above */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={src}
            alt="待裁剪图片"
            crossOrigin="anonymous"
            draggable={false}
            onLoad={(event) =>
              setNatural({
                width: event.currentTarget.naturalWidth,
                height: event.currentTarget.naturalHeight,
              })
            }
            onError={() => setError("图片加载失败，可能是跨域限制，请重新上传后再裁剪")}
            className="absolute cursor-grab active:cursor-grabbing"
            style={imageStyle}
          />

          {/* everything outside the frame is dimmed, so the photo context stays visible */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute bg-black/60" style={{ left: 0, top: 0, width: "100%", height: `${frame.top}px` }} />
            <div
              className="absolute bg-black/60"
              style={{ left: 0, bottom: 0, width: "100%", height: `${Math.max(0, viewportHeight - frame.top - frame.height)}px` }}
            />
            <div
              className="absolute bg-black/60"
              style={{ left: 0, top: `${frame.top}px`, width: `${frame.left}px`, height: `${frame.height}px` }}
            />
            <div
              className="absolute bg-black/60"
              style={{
                right: 0,
                top: `${frame.top}px`,
                width: `${viewport.width - frame.left - frame.width}px`,
                height: `${frame.height}px`,
              }}
            />

            {/* frame edge: white line + hairline shadow so it reads on any photo */}
            <div
              className="absolute border border-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
              style={{
                left: `${frame.left}px`,
                top: `${frame.top}px`,
                width: `${frame.width}px`,
                height: `${frame.height}px`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => zoomTo(scale - 0.2)}
            disabled={scale <= MIN_SCALE}
            aria-label="缩小"
            className="h-11 w-11 text-white hover:bg-white/15 hover:text-white"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-xs tabular-nums text-white/80">
            {Math.round(scale * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => zoomTo(scale + 0.2)}
            disabled={scale >= MAX_SCALE}
            aria-label="放大"
            className="h-11 w-11 text-white hover:bg-white/15 hover:text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setScale(1);
              setOffset({ x: 0, y: 0 });
            }}
            className="h-11 text-white hover:bg-white/15 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            还原
          </Button>
        </div>

        <p className="text-center text-xs text-white/60">
          拖动图片调整取景，滚轮或双指缩放
          {visible && ` · 输出约 ${Math.round(visible.width)}×${Math.round(visible.height)}px`}
        </p>
        {error && <p className="text-center text-sm text-red-400">{error}</p>}
      </div>
    </div>,
    document.body
  );
}
