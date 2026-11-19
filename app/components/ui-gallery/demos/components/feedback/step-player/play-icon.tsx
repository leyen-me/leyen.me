"use client";

import { useEffect, useRef, useState } from "react";
import { clamp, easeInOut, mix } from "./engine";

/** The block's play/pause mark: two rounded quadrilaterals that morph. */
const PLAY_LEFT = [6.5, 4, 13.25, 8, 13.25, 16, 6.5, 20];
const PAUSE_LEFT = [6, 4, 10, 4, 10, 20, 6, 20];
const PLAY_RIGHT = [13.25, 8, 20, 12, 20, 12, 13.25, 16];
const PAUSE_RIGHT = [14, 4, 18, 4, 18, 20, 14, 20];

function path(from: number[], to: number[], t: number) {
  let d = "";
  for (let i = 0; i < 8; i += 2) {
    d += `${i ? "L" : "M"}${mix(from[i], to[i], t).toFixed(2)} ${mix(
      from[i + 1],
      to[i + 1],
      t
    ).toFixed(2)}`;
  }
  return `${d}Z`;
}

/**
 * 300 ms tween from play (1) to pause (0), matching the Sound block's Mark.
 * Reduced motion snaps instead of animating.
 */
function useMorph(target: number, still: boolean) {
  const [value, setValue] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    if (still) {
      current.current = target;
      setValue(target);
      return;
    }

    const from = current.current;
    if (from === target) return;

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 300);
      current.current = from + (target - from) * easeInOut(t);
      setValue(current.current);
      frame = t < 1 ? requestAnimationFrame(tick) : 0;
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, still]);

  return value;
}

export default function PlayIcon({
  playing,
  size = 14,
  still = false,
}: {
  playing: boolean;
  size?: number;
  still?: boolean;
}) {
  const t = useMorph(playing ? 0 : 1, still);
  const wave = Math.sin(clamp(t, 0, 1) * Math.PI);
  const shift = 1.6 * wave;
  const rotate = (playing ? -9 : 9) * wave;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinejoin="round"
      strokeLinecap="round"
      style={{
        transformOrigin: "50% 50%",
        transform: `rotate(${rotate}deg) scale(${1 - 0.13 * wave}, ${
          1 + 0.11 * wave
        })`,
      }}
    >
      <path d={path(PAUSE_LEFT, PLAY_LEFT, t)} transform={`translate(${shift} 0)`} />
      <path d={path(PAUSE_RIGHT, PLAY_RIGHT, t)} transform={`translate(${-shift} 0)`} />
    </svg>
  );
}
