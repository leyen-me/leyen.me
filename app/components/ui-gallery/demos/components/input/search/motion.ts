"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Bencho's width spring, copied from `spring-hea5zr6m.js`: a per-frame Euler
 * step whose stiffness and damping are read off the `spring` parameter.
 * Frame deltas are clamped to 2.5 frames exactly like the source, so a stalled
 * tab cannot launch the spring into divergence.
 */
export function useWidthSpring(
  target: number,
  spring: number,
  instant: boolean,
) {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  const velocity = useRef(0);
  const frame = useRef(0);

  useEffect(() => {
    window.cancelAnimationFrame(frame.current);

    if (instant) {
      current.current = target;
      velocity.current = 0;
      setValue(target);
      return;
    }

    const k = 0.08 + (spring / 100) * 0.16;
    const d = 0.62 + (spring / 100) * 0.2;
    let previous = 0;

    const tick = (time: number) => {
      const step = previous ? Math.min((time - previous) / 16.67, 2.5) : 1;
      previous = time;

      velocity.current += (target - current.current) * k * step;
      velocity.current *= d ** step;
      current.current += velocity.current * step;

      if (
        Math.abs(target - current.current) < 0.02 &&
        Math.abs(velocity.current) < 0.02
      ) {
        current.current = target;
        velocity.current = 0;
        setValue(target);
        frame.current = 0;
        return;
      }

      setValue(current.current);
      frame.current = window.requestAnimationFrame(tick);
    };

    frame.current = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [target, spring, instant]);

  return value;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);

    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
