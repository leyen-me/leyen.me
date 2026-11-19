"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The single spring Bencho gives every toast: stiffness 380, damping 34,
 * mass 1. Integrated semi-implicitly in seconds, sub-stepped so a dropped
 * frame cannot make the bounce explode; the catalog copy of the block lists
 * 320 / 30, but the shipped component uses these values.
 */
const STIFFNESS = 380;
const DAMPING = 34;
const MASS = 1;

/** Integration step; one frame is split into steps no longer than this. */
const STEP = 1 / 240;

export type Pose = { y: number; scale: number };

/**
 * Moves `y` and `scale` towards their targets with Bencho's spring. Each row
 * owns one loop; rows are keyed by toast id, so reordering rows keeps their
 * in-flight positions and the stack reshuffles smoothly.
 */
export function useSpringPose(
  targetY: number,
  targetScale: number,
  initialY: number,
  reduced: boolean,
): Pose {
  const [pose, setPose] = useState<Pose>({ y: initialY, scale: 1 });
  const position = useRef<Pose>({ y: initialY, scale: 1 });
  const velocity = useRef<Pose>({ y: 0, scale: 0 });

  useEffect(() => {
    if (reduced) {
      position.current = { y: targetY, scale: targetScale };
      velocity.current = { y: 0, scale: 0 };
      setPose({ y: targetY, scale: targetScale });
      return;
    }

    let frame = 0;
    let previous = 0;

    const tick = (now: number) => {
      const elapsed = previous
        ? Math.min((now - previous) / 1000, 1 / 30)
        : STEP;
      previous = now;

      const steps = Math.max(1, Math.ceil(elapsed / STEP));
      const dt = elapsed / steps;

      for (let step = 0; step < steps; step += 1) {
        for (const key of ["y", "scale"] as const) {
          const target = key === "y" ? targetY : targetScale;
          const offset = position.current[key] - target;
          velocity.current[key] +=
            ((-STIFFNESS * offset - DAMPING * velocity.current[key]) / MASS) *
            dt;
          position.current[key] += velocity.current[key] * dt;
        }
      }

      const settled =
        Math.abs(position.current.y - targetY) < 0.05 &&
        Math.abs(position.current.scale - targetScale) < 0.0005 &&
        Math.abs(velocity.current.y) < 0.05 &&
        Math.abs(velocity.current.scale) < 0.0005;

      if (settled) {
        position.current = { y: targetY, scale: targetScale };
        velocity.current = { y: 0, scale: 0 };
      }

      setPose({ ...position.current });
      if (!settled) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [targetY, targetScale, reduced]);

  return pose;
}

/** Tracks `prefers-reduced-motion` without touching `window` during render. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return reduced;
}
