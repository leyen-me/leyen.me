"use client";

import { useRef } from "react";
import { useAnimationFrame, type MotionValue } from "framer-motion";
import { LAST_LEVEL } from "./levels";

type ShiverOptions = {
  enabled: boolean;
  reduced: boolean;
  shiverId: string;
  target: MotionValue<number>;
  overshoot: MotionValue<number>;
};

/**
 * Source behaviour: holding the pointer at the last level (or hovering there
 * after a drag) feeds turbulence into a displacement map on the tray, so the
 * track jitters under the finger. The effect eases in over ~120 ms and is
 * removed entirely once it fades out.
 */
export default function useShiver({
  enabled,
  reduced,
  shiverId,
  target,
  overshoot,
}: ShiverOptions) {
  const trayRef = useRef<HTMLDivElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const intensity = useRef(0);

  useAnimationFrame((time, delta) => {
    const tray = trayRef.current;
    if (!tray) return;

    if (reduced) {
      if (tray.style.filter) tray.style.filter = "";
      intensity.current = 0;
      return;
    }

    const active = enabled && target.get() >= LAST_LEVEL;
    const goal = active ? 1 + Math.max(0, overshoot.get()) / 14 : 0;
    intensity.current += (goal - intensity.current) * Math.min(1, delta / 120);

    if (intensity.current < 0.02) {
      if (tray.style.filter) tray.style.filter = "";
      intensity.current = 0;
      return;
    }

    turbulenceRef.current?.setAttribute(
      "seed",
      String(Math.floor(time / 50) % 100),
    );
    turbulenceRef.current?.setAttribute(
      "baseFrequency",
      `0.015 ${(0.28 + Math.sin(time / 90) * 0.06).toFixed(3)}`,
    );
    displacementRef.current?.setAttribute(
      "scale",
      (intensity.current * 1.6).toFixed(2),
    );
    tray.style.filter = `url(#${shiverId})`;
  });

  return { trayRef, turbulenceRef, displacementRef };
}
