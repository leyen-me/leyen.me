"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import {
  DEFAULT_PACE,
  DEFAULT_STEPS,
  DEFAULT_WAKE,
  DELAY,
  DOT,
  EASE,
  SPRING,
  WAVE,
  clamp,
  createDots,
  easeOut,
  edgeTransform,
  mix,
  slotRects,
  wakeConfig,
  type Dot,
  type Edge,
  type Wave,
} from "./engine";
import PlayIcon from "./play-icon";
import { cue } from "./sound";

const STEPS = DEFAULT_STEPS;
const PACE = DEFAULT_PACE;
const WAKE = wakeConfig(DEFAULT_WAKE / 100);
const TRACK_WIDTH = slotRects(STEPS, 0)[STEPS - 1][1];

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
 * Faithful port of Bencho's "Step player" (Press, step-player).
 *
 * Each dot owns a left and a right edge. The current step is expressed purely
 * by which slot is 36px instead of 8px; moving the step tweens every edge with
 * an ease-out, while play advances the fill at `pace` and fires a travelling
 * scaleY wake across the dots that were crossed.
 */
export default function Demo() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [, force] = useReducer((n: number) => n + 1, 0);
  const reduced = useReducedMotion();

  const dots = useRef<Dot[]>([]);
  if (dots.current.length === 0) dots.current = createDots(STEPS, 0);
  const progress = useRef(0);
  const wave = useRef<Wave | null>(null);
  const frame = useRef(0);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  // The loop reads this snapshot, so it always sees the latest state without
  // being restarted on every render.
  const live = useRef({ step, playing, steps: STEPS, pace: PACE, wake: WAKE });
  live.current = { step, playing, steps: STEPS, pace: PACE, wake: WAKE };

  function start() {
    if (frame.current) return;

    let previous = 0;

    const tick = (now: number) => {
      const rate = previous ? clamp((now - previous) / 16.67, 0, 2.5) : 1;
      previous = now;

      const state = live.current;
      let moving = false;

      if (state.playing) {
        progress.current += (rate * 16.67) / (Math.max(0.5, state.pace) * 1000);
        moving = true;

        if (progress.current >= 1) {
          if (state.step < state.steps - 1) {
            progress.current = 0;
            go(state.step + 1, false);
          } else {
            progress.current = 1;
            state.playing = false;
            setPlaying(false);
          }
        }
      }

      const rects = slotRects(state.steps, state.step);

      for (let i = 0; i < dots.current.length; i += 1) {
        const dot = dots.current[i];
        const targets: Array<[Edge, number]> = [
          [dot.l, rects[i][0]],
          [dot.r, rects[i][1]],
        ];

        for (const [edge, target] of targets) {
          if (reducedRef.current) {
            edge.x = target;
            edge.v = 0;
            edge.tw = undefined;
            continue;
          }

          if (edge.tw) {
            const u = clamp((now - edge.tw.t0) / EASE, 0, 1);
            edge.x = mix(edge.tw.from, edge.tw.to, easeOut(u));
            if (u >= 1) edge.tw = undefined;
            moving = true;
            continue;
          }

          edge.v += (target - edge.x) * SPRING.k * rate;
          edge.v *= SPRING.d ** rate;
          edge.x += edge.v * rate;

          if (Math.abs(target - edge.x) < 0.02 && Math.abs(edge.v) < 0.02) {
            edge.x = target;
            edge.v = 0;
          } else {
            moving = true;
          }
        }

        const targetInk =
          i < state.step ? 1 : i === state.step ? progress.current : 0;
        const nextInk = reducedRef.current
          ? targetInk
          : dot.ink + (targetInk - dot.ink) * Math.min(1, 0.22 * rate);

        dot.ink = Math.abs(targetInk - nextInk) < 0.002 ? targetInk : nextInk;
        if (dot.ink !== targetInk) moving = true;
      }

      if (
        wave.current &&
        now - wave.current.t0 <
          EASE + (state.wake.reach + 1) * state.wake.stagger + WAVE
      ) {
        moving = true;
      } else {
        wave.current = null;
      }

      force();
      frame.current = moving ? requestAnimationFrame(tick) : 0;
    };

    frame.current = requestAnimationFrame(tick);
  }

  function go(target: number, resetProgress: boolean) {
    const state = live.current;
    if (target === state.step) return;

    const rects = slotRects(state.steps, target);
    const now = performance.now();

    if (!reducedRef.current) {
      dots.current.forEach((dot, i) => {
        dot.l.tw = { from: dot.l.x, to: rects[i][0], t0: now };
        dot.r.tw = { from: dot.r.x, to: rects[i][1], t0: now };
      });
      wave.current = { t0: now, origin: target, from: state.step };
    }

    state.step = target;
    setStep(target);
    if (resetProgress) progress.current = 0;
    start();
  }

  function toggle() {
    cue("click");
    const state = live.current;

    if (state.playing) {
      state.playing = false;
      setPlaying(false);
      return;
    }

    if (state.step === state.steps - 1 && progress.current >= 1) {
      progress.current = 0;
      go(0, true);
    }

    state.playing = true;
    setPlaying(true);
    start();
  }

  function select(index: number) {
    if (index === live.current.step) return;
    cue("lift");
    go(index, true);
  }

  // Keep the loop entry point stable; `start` itself is redefined each render.
  const startRef = useRef(start);
  startRef.current = start;

  useEffect(() => {
    startRef.current();
  }, [step, playing, reduced]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    },
    []
  );

  const now = wave.current ? performance.now() : 0;
  const waveValue = reduced ? null : wave.current;

  return (
    <div className="flex w-full items-center justify-center py-6">
      <div
        className="inline-flex flex-col items-center gap-4"
        role="group"
        aria-label={`Step ${step + 1} of ${STEPS}`}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-panel bg-surface-0 p-[16px]">
            <div
              className="relative shrink-0"
              style={{ width: TRACK_WIDTH, height: DOT }}
            >
              {dots.current.map((dot, i) => {
                const width = Math.max(0, dot.r.x - dot.l.x);
                const inkWidth =
                  dot.ink > 0.001
                    ? Math.max(Math.min(DOT, width), width * dot.ink)
                    : 0;

                return (
                  <button
                    key={i}
                    type="button"
                    className="absolute left-0 top-0 h-full cursor-pointer touch-manipulation rounded-full border-0 bg-[#dadada] p-0 after:absolute after:-inset-x-1 after:-inset-y-3 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/[0.45] focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 dark:bg-[#27272a] dark:focus-visible:ring-white/[0.45]"
                    aria-label={`Step ${i + 1}`}
                    aria-current={i === step ? "step" : undefined}
                    onClick={() => select(i)}
                    style={{
                      width,
                      transform: edgeTransform(dot, i, waveValue, WAKE, now),
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 h-full rounded-full bg-[#17181a] dark:bg-white"
                      style={{
                        width: inkWidth,
                        opacity:
                          i === step ? Math.min(1, dot.ink * 14) : 1,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-0 transition-transform duration-[160ms] ease-[cubic-bezier(.22,1,.36,1)] [&:has(button:active)]:scale-[.96] motion-reduce:transition-none">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
              className="grid h-full w-full cursor-pointer place-items-center rounded-full text-[#17181a] transition-colors duration-[160ms] hover:text-[#7f8081] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/[0.45] focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 motion-reduce:transition-none dark:text-white dark:hover:text-[#939394] dark:focus-visible:ring-white/[0.45]"
            >
              <PlayIcon playing={playing} size={16} still={reduced} />
            </button>
          </div>
        </div>

        <span className="sr-only" aria-live="polite">
          Step {step + 1} of {STEPS}
        </span>
      </div>
    </div>
  );
}
