"use client";

import { useEffect, useRef, useState } from "react";

/** The spring behind the width/height/corner morph: 420 / 30 / 0.5. */
const SPRING = { stiffness: 420, damping: 30, mass: 0.5 };

export type Shape = { width: number; height: number; radius: number };

const KEYS = ["width", "height", "radius"] as const;

/**
 * Width, height and corner share one spring and one frame loop, exactly like
 * the block's `transition: { type: "spring", stiffness: 420, damping: 30,
 * mass: 0.5 }`. Frames are sub-stepped so a dropped frame cannot launch the
 * spring into divergence.
 */
export function useShapeSpring(
  width: number,
  height: number,
  radius: number,
  instant: boolean,
): Shape {
  const [shape, setShape] = useState<Shape>({ width, height, radius });
  const current = useRef<Shape>({ width, height, radius });
  const velocity = useRef<Shape>({ width: 0, height: 0, radius: 0 });
  const frame = useRef(0);

  useEffect(() => {
    window.cancelAnimationFrame(frame.current);

    if (instant) {
      current.current = { width, height, radius };
      velocity.current = { width: 0, height: 0, radius: 0 };
      setShape({ width, height, radius });
      return;
    }

    const target = { width, height, radius };
    let previous = 0;

    const tick = (time: number) => {
      const dt = previous ? Math.min((time - previous) / 1000, 0.05) : 1 / 60;
      previous = time;
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
      const h = dt / steps;

      for (let step = 0; step < steps; step += 1) {
        for (const key of KEYS) {
          const acceleration =
            (-SPRING.stiffness * (current.current[key] - target[key]) -
              SPRING.damping * velocity.current[key]) /
            SPRING.mass;
          velocity.current[key] += acceleration * h;
          current.current[key] += velocity.current[key] * h;
        }
      }

      const settled = KEYS.every(
        (key) =>
          Math.abs(target[key] - current.current[key]) < 0.05 &&
          Math.abs(velocity.current[key]) < 0.05,
      );

      if (settled) {
        current.current = target;
        velocity.current = { width: 0, height: 0, radius: 0 };
        setShape(target);
        frame.current = 0;
        return;
      }

      setShape({ ...current.current });
      frame.current = window.requestAnimationFrame(tick);
    };

    frame.current = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [width, height, radius, instant]);

  return shape;
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
