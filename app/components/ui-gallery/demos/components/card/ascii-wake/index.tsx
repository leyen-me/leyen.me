"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import {
  createWake,
  WAKE_WIDTH,
  type Wake,
  type WakeOptions,
} from "./ascii-engine";
import { whisk } from "./whisk";

/**
 * A faithful port of Bencho's "ASCII wake" hover block.
 *
 * The cube is a fixed 360 × 240 canvas of monospace cells. Pointer input only
 * writes heat into a Float32Array; the animation loop cools it, picks glyphs
 * and paints, so React never re-renders while the pointer moves.
 */
const OPTIONS: WakeOptions = {
  glyphs: "Classic",
  size: 10,
  reach: 60,
  trail: 1.2,
  pull: 40,
};

export default function Demo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const wakeRef = useRef<Wake | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const wake = createWake(canvas);
    wakeRef.current = wake;
    wake.setOptions(OPTIONS);
    wake.resize();

    // Re-read the ink colour when the gallery flips the theme class.
    const observer = new MutationObserver(() => wake.resize());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      wake.stop();
      wakeRef.current = null;
    };
  }, []);

  /** Pointer coordinates are mapped back into the canvas' 360 × 240 space. */
  function position(event: PointerEvent<HTMLDivElement>) {
    const surface = surfaceRef.current;
    if (!surface) return { x: 0, y: 0 };
    const rect = surface.getBoundingClientRect();
    const scale = rect.width / WAKE_WIDTH;
    return {
      x: (event.clientX - rect.left) / scale,
      y: (event.clientY - rect.top) / scale,
    };
  }

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    const { x, y } = position(event);
    wakeRef.current?.enter(x, y);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const { x, y } = position(event);
    wakeRef.current?.move(x, y);
  }

  function handlePointerLeave() {
    wakeRef.current?.leave();
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const { x, y } = position(event);
    wakeRef.current?.ring(x, y);
    whisk();
  }

  return (
    <div className="w-full max-w-[456px] rounded-[28px] bg-[#f1f2f2] p-6 dark:bg-[#171717]">
      <div
        ref={surfaceRef}
        className="asc relative aspect-[3/2] w-[360px] max-w-full cursor-crosshair touch-none select-none [-webkit-tap-highlight-color:transparent]"
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        role="img"
        aria-label="A cube of dots that a pointer drags a wake through"
      >
        <canvas
          ref={canvasRef}
          className="asc-canvas block h-full w-full text-[#17181a] dark:text-white"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
