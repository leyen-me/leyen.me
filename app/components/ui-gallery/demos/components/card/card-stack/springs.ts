"use client";

import { useEffect, useRef, useState } from "react";

/** Bencho's frame normaliser: it treats each frame as one 60 Hz step. */
const FRAME_MS = 16.67;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * The exact spring Bencho uses for its card fan: a semi-implicit spring whose
 * stiffness and damping both scale with the `bounce` parameter.
 */
function spring(bounce: number) {
  return {
    stiffness: 0.08 + (bounce / 100) * 0.16,
    damping: 0.62 + (bounce / 100) * 0.2,
  };
}

/**
 * One spring per entry, integrated in a single rAF loop. Bencho runs a
 * separate loop per card; the maths per entry is identical, so the values are
 * the same while the frame cost stays flat.
 */
export function useSprings(targets: readonly number[], bounce: number, reduced: boolean) {
  const key = targets.join("|");
  const goalsRef = useRef(targets);
  goalsRef.current = targets;

  const [values, setValues] = useState<number[]>(() => Array.from(targets));
  const positions = useRef<number[]>(Array.from(targets));
  const velocities = useRef<number[]>(targets.map(() => 0));

  useEffect(() => {
    const goals = goalsRef.current;

    if (reduced) {
      positions.current = Array.from(goals);
      velocities.current = goals.map(() => 0);
      setValues(Array.from(goals));
      return;
    }

    const { stiffness, damping } = spring(bounce);
    let frame = 0;
    let previous = 0;

    const tick = (now: number) => {
      const dt = previous ? clamp((now - previous) / FRAME_MS, 0, 2.5) : 1;
      previous = now;

      let moving = false;
      const next = positions.current.slice();

      for (let index = 0; index < next.length; index += 1) {
        velocities.current[index] += (goals[index] - next[index]) * stiffness * dt;
        velocities.current[index] *= Math.pow(damping, dt);
        next[index] += velocities.current[index] * dt;

        if (
          Math.abs(goals[index] - next[index]) < 0.02 &&
          Math.abs(velocities.current[index]) < 0.02
        ) {
          next[index] = goals[index];
          velocities.current[index] = 0;
        } else {
          moving = true;
        }
      }

      positions.current = next;
      setValues(next);
      if (moving) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [key, bounce, reduced]);

  return values;
}

/** Tracks the reduced-motion preference without touching `window` during render. */
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
