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
  CARRY_BASE,
  CARRY_RANGE,
  DEFAULT_START_MINUTES,
  MAX_FLICK,
  MINUTES_PER_DAY,
  MOMENTUM,
  PX_PER_MINUTE,
  RELEASE_STALE_MS,
  SPRING_DAMPING,
  SPRING_STIFFNESS,
  STEP_MINUTES,
  WHEEL_SETTLE_MS,
  clamp,
  formatTime,
  wrapMinutes,
} from "./time";

type Drag = {
  id: number;
  x: number;
  t: number;
  /** Minutes per 16.7 ms frame, smoothed while dragging. */
  v: number;
  /** CSS px per Bencho px, so zoomed browsers still map 2 px to a minute. */
  scale: number;
};

function usePrefersReducedMotion() {
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
 * Bencho's throw / snap model: on release the landing minute is predicted
 * from the hand's velocity, rounded to the step, then one spring carries the
 * ruler there starting at 60% of the release speed. A flick coasts; a slow
 * release just settles. Wheel input gets the same snap after 120 ms.
 */
export function useTimeScrubber() {
  const reduced = usePrefersReducedMotion();
  const reducedRef = useRef(reduced);

  const [position, setPosition] = useState(DEFAULT_START_MINUTES);

  const rulerRef = useRef<HTMLDivElement | null>(null);
  const positionRef = useRef(DEFAULT_START_MINUTES);
  const velocityRef = useRef(0);
  const targetRef = useRef(DEFAULT_START_MINUTES);
  const frameRef = useRef(0);
  const dragRef = useRef<Drag | null>(null);

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  const stop = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
  }, []);

  const paint = useCallback(() => {
    setPosition(positionRef.current);
  }, []);

  const run = useCallback(() => {
    if (frameRef.current) return;

    let previous = 0;

    const tick = (now: number) => {
      const scale = previous ? clamp((now - previous) / 16.67, 0, 2.5) : 1;
      previous = now;

      const x = positionRef.current;
      const v = velocityRef.current;
      const to = targetRef.current;

      const nextV = v + ((to - x) * SPRING_STIFFNESS - v * SPRING_DAMPING) * scale;
      const nextX = x + nextV * scale;

      if (Math.abs(to - nextX) < 0.01 && Math.abs(nextV) < 0.01) {
        positionRef.current = to;
        velocityRef.current = 0;
        frameRef.current = 0;
        paint();
        return;
      }

      positionRef.current = nextX;
      velocityRef.current = nextV;
      paint();
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [paint]);

  const settle = useCallback(
    (to: number, initialVelocity: number) => {
      stop();
      targetRef.current = to;

      if (reducedRef.current) {
        positionRef.current = to;
        velocityRef.current = 0;
        paint();
        return;
      }

      velocityRef.current = initialVelocity;
      run();
    },
    [paint, run, stop],
  );

  useEffect(() => stop, [stop]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      stop();
      const ruler = event.currentTarget;
      const box = ruler.getBoundingClientRect();
      const scale = box.width / ruler.offsetWidth || 1;

      dragRef.current = {
        id: event.pointerId,
        x: event.clientX,
        t: performance.now(),
        v: 0,
        scale,
      };
      velocityRef.current = 0;
      targetRef.current = positionRef.current;

      try {
        ruler.setPointerCapture(event.pointerId);
      } catch {
        // Capture is an optimisation; dragging still works without it.
      }

      ruler.focus({ preventScroll: true });
    },
    [stop],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.id !== event.pointerId) return;

      const now = performance.now();
      const delta = -(event.clientX - drag.x) / drag.scale / PX_PER_MINUTE;
      const frames = Math.max(1, (now - drag.t) / 16.67);

      drag.v = drag.v * 0.5 + (delta / frames) * 0.5;
      drag.x = event.clientX;
      drag.t = now;

      positionRef.current += delta;
      paint();
    },
    [paint],
  );

  const finishDrag = useCallback(
    (event?: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      dragRef.current = null;

      if (event) {
        try {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
          // The browser may have released the pointer already.
        }
      }

      const flick =
        performance.now() - drag.t > RELEASE_STALE_MS
          ? 0
          : clamp(drag.v, -MAX_FLICK, MAX_FLICK);
      const carry = CARRY_BASE + (MOMENTUM / 100) * CARRY_RANGE;
      const land =
        Math.round((positionRef.current + flick * carry) / STEP_MINUTES) * STEP_MINUTES;

      settle(land, flick * 0.6);
    },
    [settle],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const base = Math.round(targetRef.current / STEP_MINUTES) * STEP_MINUTES;
      const step = event.shiftKey ? STEP_MINUTES * 4 : STEP_MINUTES;
      let next: number | null = null;

      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        next = base + step;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        next = base - step;
      } else if (event.key === "PageUp") {
        next = base + STEP_MINUTES * 4;
      } else if (event.key === "PageDown") {
        next = base - STEP_MINUTES * 4;
      } else if (event.key === "Home") {
        next = 0;
      } else if (event.key === "End") {
        next = Math.floor((MINUTES_PER_DAY - 1) / STEP_MINUTES) * STEP_MINUTES;
      }

      if (next === null) return;
      event.preventDefault();
      settle(next, 0);
    },
    [settle],
  );

  useEffect(() => {
    const ruler = rulerRef.current;
    if (!ruler) return;

    let timer = 0;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;

      event.preventDefault();
      stop();
      positionRef.current += event.deltaX / PX_PER_MINUTE;
      paint();

      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        settle(Math.round(positionRef.current / STEP_MINUTES) * STEP_MINUTES, 0);
      }, WHEEL_SETTLE_MS);
    };

    ruler.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      ruler.removeEventListener("wheel", onWheel);
      window.clearTimeout(timer);
    };
  }, [paint, settle, stop]);

  const { time, meridiem } = formatTime(position);

  return {
    position,
    time,
    meridiem,
    minuteOfDay: Math.round(wrapMinutes(position)),
    rulerRef,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
      onLostPointerCapture: () => finishDrag(),
      onKeyDown: handleKeyDown,
    },
  };
}
