"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Minimal numeric spring, tuned to the original block's
 * `{ type: "spring", stiffness: 380, damping: 34 }`.
 *
 * Only used for the hover ring and tooltip. Bar heights rely on the original
 * CSS transition, so the two motions stay independent exactly as shipped.
 */

const STIFFNESS = 380;
const DAMPING = 34;
const MASS = 1;
const SUBSTEP = 1 / 120;
const REST_DISTANCE = 0.05;
const REST_VELOCITY = 0.05;

type Values = Record<string, number>;

export default function useSprings(target: Values, reduced: boolean): Values {
  const [values, setValues] = useState<Values>(target);
  const targetRef = useRef<Values>(target);
  targetRef.current = target;

  const state = useRef({
    current: { ...target },
    velocity: Object.fromEntries(
      Object.keys(target).map((key) => [key, 0])
    ) as Values,
    primed: false,
    frame: 0,
  });

  const signature = Object.keys(target)
    .sort()
    .map((key) => `${key}:${target[key].toFixed(3)}`)
    .join("|");

  useEffect(() => {
    const spring = state.current;
    const next = targetRef.current;

    const settle = () => {
      spring.current = { ...next };
      for (const key of Object.keys(next)) spring.velocity[key] = 0;
      spring.primed = true;
      setValues({ ...next });
    };

    if (!spring.primed || reduced) {
      settle();
      return;
    }

    if (spring.frame) cancelAnimationFrame(spring.frame);

    let last = performance.now();

    const tick = (now: number) => {
      const elapsed = Math.min(0.064, (now - last) / 1000);
      last = now;
      const steps = Math.max(1, Math.ceil(elapsed / SUBSTEP));
      const dt = elapsed / steps;

      for (let step = 0; step < steps; step++) {
        for (const key of Object.keys(next)) {
          const displacement = spring.current[key] - next[key];
          const force =
            -STIFFNESS * displacement - DAMPING * spring.velocity[key];
          spring.velocity[key] += (force / MASS) * dt;
          spring.current[key] += spring.velocity[key] * dt;
        }
      }

      setValues({ ...spring.current });

      const moving = Object.keys(next).some(
        (key) =>
          Math.abs(spring.current[key] - next[key]) > REST_DISTANCE ||
          Math.abs(spring.velocity[key]) > REST_VELOCITY
      );

      spring.frame = moving ? requestAnimationFrame(tick) : 0;
    };

    spring.frame = requestAnimationFrame(tick);

    return () => {
      if (spring.frame) cancelAnimationFrame(spring.frame);
      spring.frame = 0;
    };
  }, [signature, reduced]);

  return values;
}
