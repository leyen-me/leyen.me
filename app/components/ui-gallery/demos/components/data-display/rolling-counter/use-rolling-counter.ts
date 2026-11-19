"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  CELL,
  DEFAULT_START,
  DEFAULTS,
  DRAG_STEP,
  MAX_VALUE,
  clamp,
  createDigits,
  springFor,
  type Digit,
} from "./engine";
import { playTock } from "./sound";

type Drag = {
  /** Last pointer Y, for the per-move delta. */
  y: number;
  /** Sub-step remainder carried across moves. */
  acc: number;
  /** Smoothed px/ms velocity, used for the fling. */
  v: number;
  /** Timestamp of the last move. */
  t: number;
};

function useReducedMotion() {
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
 * All of the counter's interaction state, lifted out of the view.
 *
 * Five digit springs are updated imperatively inside one rAF loop, so only a
 * count change re-renders React. A column's target is the whole count at its
 * place (1284 ones, 128 tens), which makes 9 -> 10 roll forward; `due` staggers
 * each carry 45 ms behind the one to its right.
 *
 * Fling velocity, the 12 px drag step, 380 ms hold delay, 90/55 ms repeat
 * cadence, 10x acceleration after 1.5 s, spring k/d and blur scaling are all
 * copied from Bencho's source.
 */
export function useRollingCounter() {
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  const [value, setValue] = useState(DEFAULT_START);
  const valueRef = useRef(DEFAULT_START);
  const digitsRef = useRef<Digit[]>(createDigits(DEFAULT_START));
  const stripsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const frameRef = useRef(0);
  const flingRef = useRef(0);
  const holdRef = useRef({ timer: 0, since: 0 });
  const dragRef = useRef<Drag | null>(null);
  const configRef = useRef({
    bounce: DEFAULTS.bounce,
    stagger: DEFAULTS.stagger,
    blur: DEFAULTS.blur,
  });

  /** Repaint every strip from its continuous position. React is not involved. */
  const paint = useCallback(() => {
    const { blur } = configRef.current;
    digitsRef.current.forEach((digit, place) => {
      const strip = stripsRef.current[place];
      if (!strip) return;
      const offset = ((digit.pos % 10) + 10) % 10;
      const amount = Math.min(3, Math.abs(digit.vel) * 2.4) * (blur / 50);
      strip.style.transform = `translateY(${-offset * CELL}px)`;
      strip.style.filter = amount > 0.15 ? `blur(${amount.toFixed(2)}px)` : "";
    });
  }, []);

  /** One spring per column; the loop stops as soon as every column is home. */
  const startSpring = useCallback(() => {
    if (frameRef.current) return;
    let last = 0;

    const frame = (now: number) => {
      const scale = last ? clamp((now - last) / 16.67, 0, 2.5) : 1;
      last = now;
      const { k, d } = springFor(configRef.current.bounce);
      const stamp = performance.now();
      let moving = false;

      for (const digit of digitsRef.current) {
        while (digit.due.length > 0 && digit.due[0] <= stamp) {
          digit.due.shift();
          digit.target = digit.next.shift() ?? digit.target;
        }
        if (digit.due.length > 0) moving = true;

        const gap = digit.target - digit.pos;
        // Long carries jump all but the last two steps so they read as a spin
        // instead of a slow march through every digit.
        if (Math.abs(gap) > 24) {
          digit.pos += Math.round((gap - Math.sign(gap) * 24) / 10) * 10;
        }

        digit.vel += (digit.target - digit.pos) * k * scale;
        digit.vel *= d ** scale;
        digit.pos += digit.vel * scale;

        if (
          Math.abs(digit.target - digit.pos) < 0.004 &&
          Math.abs(digit.vel) < 0.004
        ) {
          digit.pos = digit.target;
          digit.vel = 0;
        } else {
          moving = true;
        }
      }

      paint();
      frameRef.current = moving ? requestAnimationFrame(frame) : 0;
    };

    frameRef.current = requestAnimationFrame(frame);
  }, [paint]);

  /** Move the count by `delta`, queueing one target per place. */
  const change = useCallback(
    (delta: number) => {
      const next = clamp(valueRef.current + delta, 0, MAX_VALUE);
      if (next === valueRef.current) return;

      valueRef.current = next;
      setValue(next);

      const now = performance.now();
      digitsRef.current.forEach((digit, place) => {
        const target = Math.floor(next / 10 ** place);
        if (reducedRef.current) {
          digit.pos = target;
          digit.target = target;
          digit.vel = 0;
          digit.due = [];
          digit.next = [];
          return;
        }
        digit.due.push(now + place * configRef.current.stagger);
        digit.next.push(target);
      });

      playTock();
      if (reducedRef.current) paint();
      else startSpring();
    },
    [paint, startSpring]
  );

  const stopHold = useCallback(() => {
    if (holdRef.current.timer) {
      window.clearTimeout(holdRef.current.timer);
      holdRef.current.timer = 0;
    }
  }, []);

  /** Press-and-hold: first repeat after 380 ms, then 90 / 55 ms, 10x later. */
  const nudge = useCallback(
    (step: number) => {
      stopHold();
      change(step);
      holdRef.current.since = performance.now();

      const tick = () => {
        const elapsed = performance.now() - holdRef.current.since;
        change(step * (elapsed > 1500 ? 10 : 1));
        holdRef.current.timer = window.setTimeout(tick, elapsed > 900 ? 55 : 90);
      };

      holdRef.current.timer = window.setTimeout(tick, 380);
    },
    [change, stopHold]
  );

  /** Convert drag pixels into whole steps, returning the unused remainder. */
  const applyDrag = useCallback(
    (delta: number) => {
      const steps =
        delta > 0 ? Math.floor(delta / DRAG_STEP) : Math.ceil(delta / DRAG_STEP);
      if (steps) change(steps);
      return delta - steps * DRAG_STEP;
    },
    [change]
  );

  useEffect(() => {
    paint();
  }, [paint]);

  useEffect(
    () => () => {
      stopHold();
      cancelAnimationFrame(frameRef.current);
      cancelAnimationFrame(flingRef.current);
      frameRef.current = 0;
      flingRef.current = 0;
    },
    [stopHold]
  );

  const numberHandlers = {
    onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
      cancelAnimationFrame(flingRef.current);
      flingRef.current = 0;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Capture is a nicety; the drag still works when the browser refuses.
      }
      dragRef.current = {
        y: event.clientY,
        acc: 0,
        v: 0,
        t: performance.now(),
      };
    },
    onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
      const drag = dragRef.current;
      if (!drag) return;

      const now = performance.now();
      const dy = drag.y - event.clientY;
      drag.y = event.clientY;

      const dt = Math.max(1, now - drag.t);
      drag.t = now;
      drag.v = drag.v * 0.6 + (dy / dt) * 0.4;
      drag.acc = applyDrag(drag.acc + dy);
    },
    onPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
      const drag = dragRef.current;
      dragRef.current = null;

      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Already released, or never captured.
      }

      if (!drag || reducedRef.current) return;

      // Releasing after a pause should not coast; a recent flick keeps going.
      let velocity = performance.now() - drag.t > 90 ? 0 : drag.v * 16.67;
      if (Math.abs(velocity) < 2) return;

      let remainder = drag.acc;
      const coast = () => {
        remainder = applyDrag(remainder + velocity);
        velocity *= 0.94;
        if (Math.abs(velocity) > 0.4) {
          flingRef.current = requestAnimationFrame(coast);
        }
      };
      flingRef.current = requestAnimationFrame(coast);
    },
    onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        change(1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        change(-1);
      }
    },
  };

  const buttonHandlers = (step: number) => ({
    onPointerDown: () => nudge(step),
    onPointerUp: stopHold,
    onPointerLeave: stopHold,
    onPointerCancel: stopHold,
    onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        change(step);
      }
    },
  });

  return {
    value,
    stripsRef,
    numberHandlers: {
      onPointerDown: numberHandlers.onPointerDown,
      onPointerMove: numberHandlers.onPointerMove,
      onPointerUp: numberHandlers.onPointerEnd,
      onPointerCancel: numberHandlers.onPointerEnd,
      onKeyDown: numberHandlers.onKeyDown,
    },
    buttonHandlers,
  };
}
