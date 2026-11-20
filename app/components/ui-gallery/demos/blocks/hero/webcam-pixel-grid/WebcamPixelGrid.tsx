"use client";

/**
 * Webcam Pixel Grid — canvas engine, ported from Aceternity UI.
 * Source: https://ui.aceternity.com/components/webcam-pixel-grid
 * License: https://ui.aceternity.com/licence (author permission granted).
 *
 * Kept from the original: the 60×40 grid downsampled from the webcam, frame
 * difference motion detection, elevation smoothing, the isometric lift with
 * shadow and side faces, mirrored feed, darkened colours and hairline borders.
 * Changed for the gallery: the camera is requested with a real status state
 * (so a blocked camera degrades to copy instead of a floating popup), the loop
 * pauses while hidden or off screen, pointer movement lifts nearby pixels, and
 * `prefers-reduced-motion` keeps the flat camera grid but drops elevation and
 * pointer motion. Video never leaves the page: every frame is read locally by a
 * 60×40 canvas and the stream is stopped on unmount.
 */

import { useCallback, useEffect, useRef } from "react";

export type WebcamStatus = "requesting" | "ready" | "denied" | "unsupported";

type Pixel = {
  r: number;
  g: number;
  b: number;
  motion: number;
  elevation: number;
};

type WebcamPixelGridProps = {
  gridCols?: number;
  gridRows?: number;
  /** Maximum lift in CSS px for a pixel at full motion. */
  maxElevation?: number;
  /** Frame-difference divisor: lower is more sensitive. */
  motionSensitivity?: number;
  /** 0–1 lerp applied to elevation each frame. */
  elevationSmoothing?: number;
  /** Gap between cells as a fraction of the cell size. */
  gapRatio?: number;
  /** 0–1, 0 keeps webcam colours untouched. */
  darken?: number;
  backgroundColor?: string;
  borderOpacity?: number;
  className?: string;
  onStatusChange?: (status: WebcamStatus) => void;
};

/** Tailwind white, used for the cell hairline. */
const BORDER_RGB = "255, 255, 255";
/** Pointer lift radius in CSS px. */
const POINTER_RADIUS = 170;

function createPixels(cols: number, rows: number): Pixel[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      r: 22,
      g: 22,
      b: 22,
      motion: 0,
      elevation: 0,
    })),
  );
}

export function WebcamPixelGrid({
  gridCols = 60,
  gridRows = 40,
  maxElevation = 50,
  motionSensitivity = 0.25,
  elevationSmoothing = 0.2,
  gapRatio = 0.05,
  darken = 0.6,
  backgroundColor = "#030303",
  borderOpacity = 0.06,
  className,
  onStatusChange,
}: WebcamPixelGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processingRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pixelsRef = useRef<Pixel[][]>(createPixels(gridCols, gridRows));
  const previousFrameRef = useRef<Uint8ClampedArray | null>(null);
  const animationRef = useRef(0);
  const sessionRef = useRef(0);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  const requestCamera = useCallback(async () => {
    const session = ++sessionRef.current;
    const report = (next: WebcamStatus) => {
      if (session === sessionRef.current) onStatusChangeRef.current?.(next);
    };

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      report("unsupported");
      return;
    }

    report("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      // A retry or unmount may have happened while the prompt was open.
      if (session !== sessionRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      video.srcObject = stream;
      // Autoplay with a live muted stream can still reject on some browsers;
      // the draw loop waits for readyState instead of treating it as failure.
      void video.play().catch(() => undefined);
      report("ready");
    } catch {
      // Blocked, missing, or busy camera: all resolve to the same clear empty
      // state. The browser’s own permission UI explains the rest.
      if (session !== sessionRef.current) return;
      report("denied");
    }
  }, []);

  // Start the stream once, stop every track when the block unmounts.
  useEffect(() => {
    const video = videoRef.current;
    void requestCamera();

    return () => {
      sessionRef.current += 1;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (video) video.srcObject = null;
    };
  }, [requestCamera]);

  // Draw loop: reads the camera locally and paints the pixel grid.
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!container || !canvas || !video) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    if (!processingRef.current) {
      processingRef.current = document.createElement("canvas");
    }
    const processing = processingRef.current;
    processing.width = gridCols;
    processing.height = gridRows;
    const processingContext = processing.getContext("2d", {
      willReadFrequently: true,
    });
    if (!processingContext) return;

    const pixels = pixelsRef.current;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = motionQuery.matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let visible = true;
    let inView = true;
    const pointer = { x: 0, y: 0, active: false };

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      const nextWidth = Math.round(width * dpr);
      const nextHeight = Math.round(height * dpr);
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
    };

    const draw = () => {
      resize();
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, width, height);
      if (width === 0 || height === 0) return;

      const live = video.readyState >= 2 && video.videoWidth > 0;

      if (live) {
        processingContext.save();
        if (video.videoWidth && video.videoHeight) {
          // Mirror horizontally and crop to the grid's aspect, matching a
          // mirrored `object-fit: cover` feed.
          const scale = Math.max(
            gridCols / video.videoWidth,
            gridRows / video.videoHeight,
          );
          const drawWidth = video.videoWidth * scale;
          const drawHeight = video.videoHeight * scale;
          processingContext.translate(gridCols, 0);
          processingContext.scale(-1, 1);
          processingContext.drawImage(
            video,
            (gridCols - drawWidth) / 2,
            (gridRows - drawHeight) / 2,
            drawWidth,
            drawHeight,
          );
        }
        processingContext.restore();

        const frame = processingContext.getImageData(
          0,
          0,
          gridCols,
          gridRows,
        ).data;
        const previous = previousFrameRef.current;
        const darkenFactor = 1 - Math.min(1, Math.max(0, darken));

        for (let row = 0; row < gridRows; row++) {
          for (let col = 0; col < gridCols; col++) {
            const index = (row * gridCols + col) * 4;
            const r = frame[index];
            const g = frame[index + 1];
            const b = frame[index + 2];
            const pixel = pixels[row]?.[col];
            if (!pixel) continue;

            let motion = 0;
            if (previous) {
              const delta =
                Math.abs(r - previous[index]) +
                Math.abs(g - previous[index + 1]) +
                Math.abs(b - previous[index + 2]);
              motion = Math.min(1, delta / 255 / motionSensitivity);
            }

            pixel.motion = pixel.motion * 0.7 + motion * 0.3;
            pixel.r = r * darkenFactor;
            pixel.g = g * darkenFactor;
            pixel.b = b * darkenFactor;
          }
        }

        previousFrameRef.current = new Uint8ClampedArray(frame);
      }

      const cellSize = Math.max(width / gridCols, height / gridRows);
      const gap = cellSize * gapRatio;
      const offsetX = (width - cellSize * gridCols) / 2;
      const offsetY = (height - cellSize * gridRows) / 2;

      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          const pixel = pixels[row]?.[col];
          if (!pixel) continue;

          const x = offsetX + col * cellSize;
          const y = offsetY + row * cellSize;

          let target = reduceMotion ? 0 : pixel.motion * maxElevation;
          if (!reduceMotion && pointer.active) {
            const distance = Math.hypot(
              pointer.x - (x + cellSize / 2),
              pointer.y - (y + cellSize / 2),
            );
            if (distance < POINTER_RADIUS) {
              const falloff = 1 - distance / POINTER_RADIUS;
              target = Math.max(target, falloff * falloff * maxElevation * 0.9);
            }
          }

          pixel.elevation += (target - pixel.elevation) * elevationSmoothing;
          const elevation = pixel.elevation;

          const liftX = -elevation * 1.2;
          const liftY = -elevation * 1.8;
          const inset = gap / 2;
          const cell = cellSize - gap;
          const topX = x + inset + liftX;
          const topY = y + inset + liftY;

          if (elevation > 0.5) {
            context.fillStyle = `rgba(0, 0, 0, ${Math.min(
              0.6,
              elevation * 0.04,
            )})`;
            context.fillRect(
              x + inset + elevation * 1.5,
              y + inset + elevation * 2,
              cell,
              cell,
            );

            // Right side face.
            context.fillStyle = `rgb(${Math.max(
              0,
              pixel.r - 80,
            )}, ${Math.max(0, pixel.g - 80)}, ${Math.max(
              0,
              pixel.b - 80,
            )})`;
            context.beginPath();
            context.moveTo(x + cellSize - inset + liftX, y + inset + liftY);
            context.lineTo(x + cellSize - inset, y + inset);
            context.lineTo(x + cellSize - inset, y + cellSize - inset);
            context.lineTo(
              x + cellSize - inset + liftX,
              y + cellSize - inset + liftY,
            );
            context.closePath();
            context.fill();

            // Bottom side face.
            context.fillStyle = `rgb(${Math.max(
              0,
              pixel.r - 50,
            )}, ${Math.max(0, pixel.g - 50)}, ${Math.max(
              0,
              pixel.b - 50,
            )})`;
            context.beginPath();
            context.moveTo(x + inset + liftX, y + cellSize - inset + liftY);
            context.lineTo(x + inset, y + cellSize - inset);
            context.lineTo(x + cellSize - inset, y + cellSize - inset);
            context.lineTo(
              x + cellSize - inset + liftX,
              y + cellSize - inset + liftY,
            );
            context.closePath();
            context.fill();
          }

          const brightness = 1 + elevation * 0.05;
          context.fillStyle = `rgb(${Math.min(
            255,
            Math.round(pixel.r * brightness),
          )}, ${Math.min(255, Math.round(pixel.g * brightness))}, ${Math.min(
            255,
            Math.round(pixel.b * brightness),
          )})`;
          context.fillRect(topX, topY, cell, cell);

          context.strokeStyle = `rgba(${BORDER_RGB}, ${
            borderOpacity + elevation * 0.008
          })`;
          context.lineWidth = 0.5;
          context.strokeRect(topX, topY, cell, cell);
        }
      }
    };

    const loop = () => {
      if (!visible || !inView) {
        animationRef.current = 0;
        return;
      }
      draw();
      animationRef.current = window.requestAnimationFrame(loop);
    };

    const start = () => {
      if (animationRef.current || !visible || !inView) return;
      animationRef.current = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
    };

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      if (visible) start();
      else stop();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      pointer.active = inside && !reduceMotion;
      if (inside) {
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
      }
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onMotionChange = (event: MediaQueryListEvent) => {
      reduceMotion = event.matches;
      if (reduceMotion) {
        pointer.active = false;
        for (const row of pixels) {
          for (const pixel of row) pixel.elevation = 0;
        }
      }
    };

    const observer = new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      if (inView) start();
      else stop();
    });
    observer.observe(container);

    resize();
    draw();
    start();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, [
    backgroundColor,
    borderOpacity,
    darken,
    elevationSmoothing,
    gapRatio,
    gridCols,
    gridRows,
    maxElevation,
    motionSensitivity,
  ]);

  return (
    <div className={className} ref={containerRef}>
      <video
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        muted
        playsInline
        ref={videoRef}
      />
      <canvas aria-hidden="true" className="block h-full w-full" ref={canvasRef} />
    </div>
  );
}
