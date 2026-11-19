"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The two springs Bencho uses inside the island. The shape spring is the one
 * framer-motion is given for width, height, corner radius and the press scale;
 * the content spring only rolls the compact row or card back from 1.08 after
 * the activity changes from outside.
 */
export type SpringConfig = { stiffness: number; damping: number; mass: number };

/** Integration step; one frame is split into steps no longer than this. */
const STEP = 1 / 240;

/**
 * Integrates a set of numeric properties towards `target` with one shared
 * spring, so width, height and radius arrive together instead of one corner
 * trailing the other. `target` is expected to be memoised by the caller.
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

/**
 * `dyn-in` scale: whenever the activity is changed from the control row the
 * content shell is nudged to 1.08 and springs back with 500 / 18. The first
 * render is skipped so the island does not pop on mount.
 */
export function useContentPop(pop: number, reduced: boolean): number {
  const [scale, setScale] = useState(1);
  const position = useRef(1);
  const velocity = useRef(0);
  const lastPop = useRef(pop);

  useEffect(() => {
    if (reduced) {
      setScale(1);
      return;
    }

    if (lastPop.current === pop) return;
    lastPop.current = pop;

    position.current = 1.08;
    velocity.current = 0;
    setScale(1.08);

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
        const offset = position.current - 1;
        velocity.current += (-500 * offset - 18 * velocity.current) * dt;
        position.current += velocity.current * dt;
      }

      const settled =
        Math.abs(position.current - 1) < 0.0005 &&
        Math.abs(velocity.current) < 0.0005;
      if (settled) {
        position.current = 1;
        velocity.current = 0;
      }

      setScale(settled ? 1 : position.current);
      if (!settled) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [pop, reduced]);

  return scale;
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
