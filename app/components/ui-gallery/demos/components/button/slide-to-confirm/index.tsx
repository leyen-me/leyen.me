"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ArrowRightIcon, CheckIcon } from "./icons";
import {
  RELEASE_SPRING,
  RESET_SPRING,
  TRAVEL_SPRING,
  clamp,
  closeTo,
  easeOutCubic,
  stepSpring,
  useReducedMotion,
  type SpringConfig,
} from "./motion";
import { SLIDE_CSS } from "./slide-css";

/*
 * Bencho's "Slide to confirm" defaults, unchanged: a 280 x 56 track with a
 * 4 px inset, a 48 px handle, a 28 px corner (24 px inside) and a 224 px
 * travel. Committing requires the handle to reach the end of the track, then
 * the label fades out over 160 ms, the handle morphs open behind itself while
 * its right edge stays put, and the block resets after 1500 ms.
 *
 * Two things are gallery additions rather than ports: the handle is a keyboard
 * slider (arrows/Home/End move it, Enter/Space commits) and status changes are
 * announced through a live region. Bencho's click / expand / off cues are
 * omitted, matching the other silent ports here.
 */
const WIDTH = 280;
const HEIGHT = 56;
const PAD = 4;
const GRIP = 48;
const CORNER = 28;
const INNER = CORNER - PAD;
const TRAVEL = WIDTH - PAD * 2 - GRIP;
const RESET_MS = 1500;
const FADE_OUT_MS = 160;
const FADE_IN_MS = 220;
const FADE_IN_DELAY_MS = 120;
const HOVER_SCALE = 1.03;
const KEY_STEP = TRAVEL / 10;
const MOVE_EPSILON = 0.5;

type View = { x: number; offset: number; fade: number };

type FadeTween = {
  from: number;
  to: number;
  start: number;
  delay: number;
  duration: number;
};

type Drag = { id: number; grab: number | null };

export default function Demo() {
  const reduced = useReducedMotion();

  const [view, setView] = useState<View>({ x: 0, offset: 0, fade: 1 });
  const [animating, setAnimating] = useState(false);
  const [done, setDone] = useState(false);
  const [held, setHeld] = useState(false);
  const [hover, setHover] = useState(false);
  const [live, setLive] = useState("");

  const trackRef = useRef<HTMLDivElement | null>(null);
  const x = useRef(0);
  const vx = useRef(0);
  const offset = useRef(0);
  const voffset = useRef(0);
  const fade = useRef(1);
  const targets = useRef({ x: 0, offset: 0 });
  const springX = useRef<SpringConfig>(TRAVEL_SPRING);
  const springOffset = useRef<SpringConfig>(RESET_SPRING);
  const fadeTween = useRef<FadeTween | null>(null);
  const dragging = useRef<Drag | null>(null);
  const doneRef = useRef(false);
  const resetTimer = useRef(0);

  function paint() {
    setView({ x: x.current, offset: offset.current, fade: fade.current });
  }

  /**
   * Reveal the frame loop. Under reduced motion every value lands on its
   * target at once; the 1500 ms reset still runs because that is timing, not
   * motion.
   */
  function startAnimation() {
    if (reduced) {
      if (!dragging.current) {
        x.current = targets.current.x;
        vx.current = 0;
      }
      offset.current = targets.current.offset;
      voffset.current = 0;
      if (fadeTween.current) {
        fade.current = fadeTween.current.to;
        fadeTween.current = null;
      }
      paint();
      setAnimating(false);
      return;
    }
    setAnimating(true);
  }

  useEffect(() => {
    if (!animating) return;

    let frame = 0;
    let previous = performance.now();

    const tick = (now: number) => {
      const dt = clamp((now - previous) / 1000, 0.001, 0.032);
      previous = now;
      const steps = Math.ceil(dt / 0.008);
      const step = dt / steps;

      if (!dragging.current) {
        for (let i = 0; i < steps; i++) {
          const next = stepSpring(
            x.current,
            vx.current,
            targets.current.x,
            springX.current,
            step,
          );
          x.current = next.value;
          vx.current = next.velocity;
        }
      }

      for (let i = 0; i < steps; i++) {
        const next = stepSpring(
          offset.current,
          voffset.current,
          targets.current.offset,
          springOffset.current,
          step,
        );
        offset.current = next.value;
        voffset.current = next.velocity;
      }

      const tween = fadeTween.current;
      if (tween) {
        const elapsed = now - tween.start - tween.delay;
        if (elapsed >= tween.duration) {
          fade.current = tween.to;
          fadeTween.current = null;
        } else if (elapsed > 0) {
          fade.current =
            tween.from +
            (tween.to - tween.from) * easeOutCubic(elapsed / tween.duration);
        }
      }

      paint();

      const xSettled =
        dragging.current !== null ||
        (closeTo(x.current, targets.current.x) && Math.abs(vx.current) < 0.5);
      const offsetSettled =
        closeTo(offset.current, targets.current.offset) &&
        Math.abs(voffset.current) < 0.5;

      if (!xSettled || !offsetSettled || fadeTween.current) {
        frame = requestAnimationFrame(tick);
        return;
      }

      if (!dragging.current) {
        x.current = targets.current.x;
        vx.current = 0;
      }
      offset.current = targets.current.offset;
      voffset.current = 0;
      paint();
      setAnimating(false);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animating]);

  useEffect(
    () => () => {
      window.clearTimeout(resetTimer.current);
    },
    [],
  );

  function commit() {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    setLive("Confirmed");

    // "N.set(M.get())": the handle keeps the width it ended the drag with and
    // then opens out as it travels home, so the right edge never moves.
    offset.current = x.current;
    voffset.current = 0;
    targets.current.offset = x.current;

    targets.current.x = 0;
    springX.current = TRAVEL_SPRING;
    fadeTween.current = {
      from: fade.current,
      to: 0,
      start: performance.now(),
      delay: 0,
      duration: FADE_OUT_MS,
    };

    paint();
    startAnimation();

    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(reset, RESET_MS);
  }

  function reset() {
    doneRef.current = false;
    setDone(false);
    targets.current.offset = 0;
    springOffset.current = RESET_SPRING;
    fadeTween.current = {
      from: fade.current,
      to: 1,
      start: performance.now(),
      delay: FADE_IN_DELAY_MS,
      duration: FADE_IN_MS,
    };
    setLive("Ready. Slide to confirm.");
    startAnimation();
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (doneRef.current) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragging.current = { id: event.pointerId, grab: null };
    targets.current.x = x.current;
    vx.current = 0;
    setHeld(true);

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Capture is an optimisation; the drag still works without it.
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragging.current;
    const track = trackRef.current;
    if (!drag || drag.id !== event.pointerId || !track) return;

    const box = track.getBoundingClientRect();
    const ratio = box.width / WIDTH;
    const at = (event.clientX - box.left) / (ratio || 1);

    // The offset is taken on the first move, never on the press: pressing far
    // from the handle would otherwise make the first move jump the whole way.
    if (drag.grab === null) {
      drag.grab = at - x.current;
      return;
    }

    const next = clamp(at - drag.grab, 0, TRAVEL);
    if (Math.abs(next - x.current) <= MOVE_EPSILON) return;
    x.current = next;
    paint();
  }

  function finishDrag(event?: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragging.current;
    if (!drag) return;

    dragging.current = null;
    setHeld(false);

    if (event) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // The pointer may already have been released by the browser.
      }
    }

    if (x.current >= TRAVEL) {
      commit();
      return;
    }

    springX.current = RELEASE_SPRING;
    targets.current.x = 0;

    if (Math.abs(x.current) > 0.1) {
      startAnimation();
    } else {
      x.current = 0;
      vx.current = 0;
      paint();
    }
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (doneRef.current) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      // Land on the full track first so the success morph starts from the
      // same state a pointer commit reaches.
      x.current = TRAVEL;
      vx.current = 0;
      targets.current.x = TRAVEL;
      offset.current = TRAVEL;
      voffset.current = 0;
      paint();
      commit();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      targets.current.x = 0;
      springX.current = RELEASE_SPRING;
      if (x.current !== 0) startAnimation();
      return;
    }

    const step = event.shiftKey ? TRAVEL : KEY_STEP;
    let next: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      next = Math.min(TRAVEL, x.current + step);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      next = Math.max(0, x.current - step);
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = TRAVEL;
    }

    if (next === null) return;
    event.preventDefault();
    x.current = next;
    vx.current = 0;
    targets.current.x = next;
    paint();
  }

  const q = clamp(view.x, 0, TRAVEL);
  const knobWidth = GRIP + clamp(view.offset - q, 0, TRAVEL);
  const washWidth = q + GRIP;
  const shrink = 1 - Math.min(0.08, Math.max(0, -view.x) / 110);
  const lifted = hover && !held && !done;
  const scaleX = shrink * (lifted ? HOVER_SCALE : 1);
  const scaleY = (1 / shrink) * (lifted ? HOVER_SCALE : 1);
  const labelOpacity = clamp(1 - q / (TRAVEL * 0.55), 0, 1);
  const arrowOpacity =
    view.fade * clamp(1 - (q - TRAVEL * 0.55) / (TRAVEL * 0.4), 0, 1);
  const progress = done
    ? 100
    : Math.round((clamp(view.x, 0, TRAVEL) / TRAVEL) * 100);

  const gripStyle: CSSProperties = {
    width: knobWidth,
    borderRadius: INNER,
    transform: `translateX(${q.toFixed(2)}px) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`,
  };

  return (
    <div className="slide-demo w-full max-w-[340px]">
      <style>{SLIDE_CSS}</style>

      <div className="grid h-[180px] w-full place-items-center rounded-2xl border border-black/[0.04] bg-[#f7f7f6] dark:border-white/[0.06] dark:bg-[#0a0a0a]">
        <div className="sld" style={{ width: WIDTH, height: HEIGHT }}>
          <div
            ref={trackRef}
            className="sld-track"
            style={{ borderRadius: CORNER }}
            data-held={held || undefined}
            data-done={done || undefined}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
            onLostPointerCapture={() => {
              if (dragging.current) finishDrag();
            }}
          >
            <i
              aria-hidden="true"
              className="sld-wash"
              style={{ width: washWidth, borderRadius: INNER }}
            />

            <span
              aria-hidden="true"
              className="sld-say"
              style={{ opacity: labelOpacity }}
            >
              Slide to confirm
            </span>

            <div
              role="slider"
              tabIndex={0}
              aria-label="Slide to confirm"
              aria-orientation="horizontal"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-valuetext={
                done
                  ? "Confirmed"
                  : `${progress}% — press Enter or Space to confirm`
              }
              className="sld-grip"
              style={gripStyle}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setHover(true);
              }}
              onPointerLeave={() => setHover(false)}
              onKeyDown={handleKeyDown}
            >
              <span
                aria-hidden="true"
                className="sld-arrow"
                style={{ opacity: arrowOpacity }}
              >
                <ArrowRightIcon />
              </span>

              <span aria-hidden="true" className="sld-done">
                <CheckIcon />
                Confirmed
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
        拖动滑块，或聚焦后按 Enter / Space 确认。
      </p>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {live}
      </p>
    </div>
  );
}
