import { useEffect, useRef, useState } from "react";
import { clamp } from "./engine";

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

/**
 * The source's critically-damped spring: stiffness feeds both the spring
 * constant and the damping. `instant` bypasses it while the finger is down,
 * because the card must track the finger rather than lag behind it.
 */
export function useSpring(target: number, stiffness = 58, instant = false) {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  const velocity = useRef(0);
  const frame = useRef(0);

  useEffect(() => {
    if (instant) {
      current.current = target;
      velocity.current = 0;
      setValue(target);
      return;
    }

    const k = 0.08 + (stiffness / 100) * 0.16;
    const damping = 0.62 + (stiffness / 100) * 0.2;
    let previous = 0;

    const tick = (now: number) => {
      const rate = previous ? clamp((now - previous) / 16.67, 0, 2.5) : 1;
      previous = now;

      velocity.current += (target - current.current) * k * rate;
      velocity.current *= damping ** rate;
      current.current += velocity.current * rate;

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
      frame.current = requestAnimationFrame(tick);
    };

    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [instant, stiffness, target]);

  return value;
}
