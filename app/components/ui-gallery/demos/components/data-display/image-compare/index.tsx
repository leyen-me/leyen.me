"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import CompareScene from "./scene";
import useReducedMotion from "./use-reduced-motion";

/* Bencho's stage and motion constants, unchanged. Its theme variables are
   resolved inline: --fill-on / --ink is #17181a (light) and #fff (dark),
   --fill-slab / --card is #f7f7f6 / #0a0a0a, and --signal is #2231dd. */
const WIDTH = 270;
const HEIGHT = 360;
const CORNER = 20;
const KEY_STEP = 0.1;
const BOW_SCALE = WIDTH * 0.5;
const BOW_MAX = 9;
const SMOOTHING_BASE = 4e-4;
const SPRING_STIFFNESS = 620;
const SPRING_DAMPING = 44;
const SETTLE_DISTANCE = 5e-4;
const SNAP_DISTANCE = 6e-4;
const SNAP_VELOCITY = 0.002;
const FLICK_VELOCITY = 0.0025;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

type DragSample = {
  velocity: number;
  at: number;
  last: number;
};

/**
 * A 1:1 port of Bencho's "Image compare" block (Drag).
 *
 * The divider is jelly: the split point is smoothed toward the pointer, while
 * a 620 / 44 spring drives the bend, so the line's ends lag behind the knob by
 * up to 9 px. Releasing with a flick sends the split to the nearest edge.
 * Bencho's x-ray / colour photos are replaced by one original CSS-free SVG
 * scene at noon and at night, rendered with the same geometry.
 *
 * Keyboard: arrows move by 10% like the source; Home / End jump to an edge.
 */
export default function Demo() {
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  const stageRef = useRef<HTMLDivElement>(null);
  const target = useRef(0.5);
  const shown = useRef(0.5);
  const spring = useRef({ x: 0.5, v: 0 });
  const frame = useRef(0);
  const drag = useRef<DragSample | null>(null);
  const hintId = useId();

  const [value, setValue] = useState(0.5);
  const [bow, setBow] = useState(0);
  const [held, setHeld] = useState(false);

  const start = useCallback(() => {
    if (frame.current) return;

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      if (reducedRef.current) {
        shown.current = target.current;
        spring.current.x = target.current;
        spring.current.v = 0;
        setValue(target.current);
        setBow(0);
        frame.current = 0;
        return;
      }

      shown.current +=
        (target.current - shown.current) * (1 - SMOOTHING_BASE ** dt);
      if (Math.abs(target.current - shown.current) < SETTLE_DISTANCE) {
        shown.current = target.current;
      }

      const state = spring.current;
      state.v +=
        ((shown.current - state.x) * SPRING_STIFFNESS -
          state.v * SPRING_DAMPING) *
        dt;
      state.x += state.v * dt;

      setValue(shown.current);
      setBow(clamp((shown.current - state.x) * BOW_SCALE, -BOW_MAX, BOW_MAX));

      if (
        Math.abs(shown.current - state.x) < SNAP_DISTANCE &&
        Math.abs(state.v) < SNAP_VELOCITY
      ) {
        state.x = shown.current;
        state.v = 0;
        setBow(0);
        frame.current = 0;
        return;
      }

      frame.current = window.requestAnimationFrame(tick);
    };

    frame.current = window.requestAnimationFrame(tick);
  }, []);

  const aim = useCallback(
    (next: number) => {
      target.current = clamp(next, 0, 1);
      start();
    },
    [start],
  );

  useEffect(() => {
    reducedRef.current = reduced;
    if (!reduced) return;

    shown.current = target.current;
    spring.current = { x: target.current, v: 0 };
    setValue(target.current);
    setBow(0);
  }, [reduced]);

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current);
  }, []);

  function positionAt(clientX: number) {
    const box = stageRef.current?.getBoundingClientRect();
    if (!box) return target.current;
    return clamp((clientX - box.left) / box.width, 0, 1);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || drag.current) return;

    const position = positionAt(event.clientX);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* Pointer capture is an enhancement; dragging still works without it. */
    }

    drag.current = { velocity: 0, at: performance.now(), last: position };
    setHeld(true);
    aim(position);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const sample = drag.current;
    if (!sample) return;

    const position = positionAt(event.clientX);
    const now = performance.now();
    sample.velocity = (position - sample.last) / Math.max(1, now - sample.at);
    sample.at = now;
    sample.last = position;
    aim(position);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const sample = drag.current;
    drag.current = null;
    setHeld(false);

    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      /* The pointer may already be gone; nothing to release. */
    }

    if (sample && Math.abs(sample.velocity) > FLICK_VELOCITY) {
      aim(sample.velocity > 0 ? 1 : 0);
    }
  }

  function stopDrag() {
    drag.current = null;
    setHeld(false);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    let next: number | null = null;

    if (event.key === "ArrowLeft") next = target.current - KEY_STEP;
    if (event.key === "ArrowRight") next = target.current + KEY_STEP;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = 1;
    if (next === null) return;

    event.preventDefault();
    aim(next);
  }

  const split = value * WIDTH;
  const edge = split - bow;
  const control = split + bow;
  const clipPath = `path("M 0 0 L ${edge.toFixed(2)} 0 Q ${control.toFixed(
    2,
  )} ${HEIGHT / 2} ${edge.toFixed(2)} ${HEIGHT} L 0 ${HEIGHT} Z")`;
  const linePath = `M ${edge.toFixed(2)} 0 Q ${control.toFixed(2)} ${
    HEIGHT / 2
  } ${edge.toFixed(2)} ${HEIGHT}`;
  const percent = Math.round(value * 100);
  const beforeOpacity = clamp((value - 0.14) * 4, 0, 1);
  const afterOpacity = clamp((0.86 - value) * 4, 0, 1);

  return (
    <div className="flex w-full justify-center py-6">
      <div className="w-full max-w-[270px]">
        <div
          ref={stageRef}
          role="slider"
          tabIndex={0}
          aria-label="Before and after image comparison"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={`${percent}% before, ${100 - percent}% after`}
          aria-describedby={hintId}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={stopDrag}
          onLostPointerCapture={stopDrag}
          onKeyDown={handleKeyDown}
          className="group relative select-none touch-none cursor-ew-resize overflow-hidden bg-[#17181a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2231dd] [-webkit-tap-highlight-color:transparent] dark:bg-white"
          style={{ width: WIDTH, height: HEIGHT, borderRadius: CORNER }}
        >
          <div className="pointer-events-none absolute inset-0">
            <CompareScene mode="after" />
          </div>

          <div
            className="pointer-events-none absolute inset-0"
            style={{ clipPath }}
          >
            <CompareScene mode="before" />
          </div>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#17181a]/[0.36] px-3 py-1 text-xs font-medium text-white backdrop-blur-[10px]"
            style={{ opacity: beforeOpacity }}
          >
            Before
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#17181a]/[0.36] px-3 py-1 text-xs font-medium text-white backdrop-blur-[10px]"
            style={{ opacity: afterOpacity }}
          >
            After
          </span>

          <svg
            className="pointer-events-none absolute inset-0 overflow-visible"
            width={WIDTH}
            height={HEIGHT}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            aria-hidden="true"
            focusable="false"
          >
            <path
              d={linePath}
              fill="none"
              stroke="#fff"
              strokeWidth={2}
              style={{
                filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.5))",
              }}
            />
          </svg>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-0"
            style={{ left: split }}
          >
            <span
              className={`absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#f7f7f6] text-[#17181a] shadow-[0_2px_12px_rgba(23,24,26,0.25)] transition-transform duration-[220ms] ease-[cubic-bezier(0.24,1.34,0.38,1)] motion-reduce:transition-none dark:bg-[#0a0a0a] dark:text-white ${
                held ? "scale-90" : "group-hover:scale-[1.08]"
              }`}
            >
              <svg
                width="16"
                height="10"
                viewBox="0 0 16 10"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M5 1 1 5l4 4M11 1l4 4-4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </span>
        </div>

        <p id={hintId} className="sr-only">
          Drag the divider, or press the left and right arrow keys. Home and End
          jump to either edge.
        </p>
      </div>
    </div>
  );
}
