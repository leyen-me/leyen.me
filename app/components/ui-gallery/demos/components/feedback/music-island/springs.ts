"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Bencho hands framer-motion one spring for width, height and corner radius.
 * This integrates the same equation locally so the demo stays dependency-free.
 */
export type SpringConfig = { stiffness: number; damping: number; mass: number };

/** Sub-step cap, so a long frame cannot overshoot the integration. */
const STEP = 1 / 240;

/**
 * Moves a set of numbers towards `target` with one shared spring, keeping the
 * pill's three dimensions in phase instead of letting the corners trail.
 * `target` must be memoised by the caller.
 */
export function useSpringVector<T extends Record<string, number>>(
  target: T,
  config: SpringConfig,
  reduced: boolean,
): T {
  const [values, setValues] = useState<T>(target);
  const position = useRef<Record<string, number>>({ ...target });
  const velocity = useRef<Record<string, number>>(
    Object.fromEntries(Object.keys(target).map((key) => [key, 0])),
  );

  useEffect(() => {
    if (reduced) {
      position.current = { ...target };
      setValues({ ...target });
      return;
    }

    const keys = Object.keys(target);
    const { stiffness, damping, mass } = config;
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
        for (const key of keys) {
          const offset = position.current[key] - target[key];
          velocity.current[key] +=
            ((-stiffness * offset - damping * velocity.current[key]) / mass) *
            dt;
          position.current[key] += velocity.current[key] * dt;
        }
      }

      let settled = true;
      for (const key of keys) {
        if (
          Math.abs(position.current[key] - target[key]) > 0.01 ||
          Math.abs(velocity.current[key]) > 0.01
        ) {
          settled = false;
          break;
        }
      }

      if (settled) {
        position.current = { ...target };
        velocity.current = Object.fromEntries(keys.map((key) => [key, 0]));
      }

      setValues({ ...position.current } as T);
      if (!settled) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, config, reduced]);

  return values;
}

/** Mirrors the media query into React; no browser API runs during render. */
export function useReducedMotion(): boolean {
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
