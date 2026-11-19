import { useEffect, useState } from "react";

/**
 * Bencho's spring maths, kept as physical parameters instead of an easing
 * guess. The source builds the stiffness from its `speed` default (50):
 * `260 + (50 / 100) * 640 = 580`, then damps it to critical for the travel and
 * to 62% of critical for the release, which is what gives the handle its
 * small overshoot when a drag falls short of the threshold.
 */
export type SpringConfig = {
  stiffness: number;
  damping: number;
  mass: number;
};

const STIFFNESS = 260 + (50 / 100) * 640;

export const TRAVEL_SPRING: SpringConfig = {
  stiffness: STIFFNESS,
  damping: 2 * Math.sqrt(STIFFNESS * 0.9),
  mass: 0.9,
};

export const RELEASE_SPRING: SpringConfig = {
  ...TRAVEL_SPRING,
  damping: TRAVEL_SPRING.damping * 0.62,
};

/** The reset spring: stiffness 380, damping 34, mass 0.9. */
export const RESET_SPRING: SpringConfig = {
  stiffness: 380,
  damping: 34,
  mass: 0.9,
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function closeTo(value: number, target: number, distance = 0.05) {
  return Math.abs(value - target) < distance;
}

export function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/** One semi-implicit Euler step; callers subdivide to keep stiff springs stable. */
export function stepSpring(
  value: number,
  velocity: number,
  target: number,
  spring: SpringConfig,
  dt: number,
) {
  const force =
    -spring.stiffness * (value - target) - spring.damping * velocity;
  const nextVelocity = velocity + (force / spring.mass) * dt;
  return { value: value + nextVelocity * dt, velocity: nextVelocity };
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}
