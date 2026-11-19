"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  BLINK_FIRST,
  BOUNCE,
  CUBE_PATH,
  INITIAL_EYES,
  PHRASES,
  SPEECH_HOLD,
  TINTS,
  TYPE_DELAY,
  TYPE_JITTER,
  blinkFactor,
  eyeGeometry,
  nextBlinkAt,
  pointerTarget,
} from "./eyes";

/**
 * A 1:1 port of Bencho's "Eye tracker" hover block.
 *
 * Two eye rectangles are clipped to a soft cube and projected from a unit
 * sphere: the pointer turns the sphere, blinks squash the eyes, and pressing
 * the ball types a short line into a tinted speech bubble. Bencho's `pop`
 * sound is omitted, matching the rest of this gallery.
 *
 * Pointer tracking, spring smoothing and blinking all run in one rAF loop and
 * write SVG attributes directly, so React never re-renders on pointer moves.
 */

/** Bencho's `useReducedMotion`: skip the spring, but keep the blink. */
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

export default function EyeTracker() {
  const reduced = useReducedMotion();
  const clipId = `eyet-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const cardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const eyeRefs = useRef<Array<SVGGElement | null>>([]);

  const [line, setLine] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [tint, setTint] = useState<string>(TINTS[0]);
  const speech = useRef({ token: 0, timer: 0, last: -1 });

  useEffect(() => {
    const state = speech.current;
    return () => {
      state.token += 1;
      window.clearTimeout(state.timer);
    };
  }, []);

  const speak = useCallback(() => {
    const state = speech.current;
    state.token += 1;
    const token = state.token;
    window.clearTimeout(state.timer);

    const candidates = PHRASES.map((_, index) => index).filter(
      (index) => index !== state.last
    );
    const index =
      candidates[Math.floor(Math.random() * candidates.length)] ?? 0;
    state.last = index;
    const phrase = PHRASES[index];

    setTint(TINTS[Math.floor(Math.random() * TINTS.length)]);
    setLine("");
    setSpeaking(true);

    const step = (typed: number) => {
      if (token !== state.token) return;
      setLine(phrase.slice(0, typed));
      if (typed < phrase.length) {
        state.timer = window.setTimeout(
          () => step(typed + 1),
          TYPE_DELAY + Math.random() * TYPE_JITTER
        );
      } else {
        state.timer = window.setTimeout(() => {
          if (token === state.token) setSpeaking(false);
        }, SPEECH_HOLD);
      }
    };

    state.timer = window.setTimeout(
      () => step(1),
      TYPE_DELAY + Math.random() * TYPE_JITTER
    );
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    const stage = stageRef.current;
    if (!card || !stage) return;

    const target = { x: 0, y: 0 };
    const pose = { x: 0, y: 0, vx: 0, vy: 0 };
    let blinkStart = Number.NEGATIVE_INFINITY;
    let nextBlink = performance.now() + BLINK_FIRST;
    let frame = 0;
    let last = 0;
    let onScreen = true;

    const draw = (now: number) => {
      const [left, right] = eyeGeometry(
        pose.x,
        pose.y,
        blinkFactor(blinkStart, now)
      );
      const geometries = [left, right];

      geometries.forEach((geometry, index) => {
        const group = eyeRefs.current[index];
        if (!group) return;
        const rect = group.firstElementChild as SVGRectElement | null;
        if (rect) {
          rect.setAttribute("x", geometry.x.toFixed(2));
          rect.setAttribute("y", geometry.y.toFixed(2));
          rect.setAttribute("width", geometry.width.toFixed(2));
          rect.setAttribute("height", geometry.height.toFixed(2));
          rect.setAttribute("rx", geometry.radius.toFixed(2));
        }
        group.setAttribute("transform", geometry.transform);
        group.style.opacity = String(geometry.opacity);
      });
    };

    const tick = (now: number) => {
      if (now > nextBlink) {
        blinkStart = now;
        nextBlink = nextBlinkAt(now);
      }

      const delta = last ? Math.min(2.5, (now - last) / 16.67) : 1;
      last = now;

      if (reduced) {
        pose.x = target.x;
        pose.y = target.y;
      } else {
        // Bencho's spring: soft pull toward the target, more damping the
        // lower the `bounce` setting.
        const pull = 0.06;
        const damping =
          0.34 - (Math.min(100, Math.max(0, BOUNCE)) / 100) * 0.22;
        pose.vx += ((target.x - pose.x) * pull - pose.vx * damping) * delta;
        pose.vy += ((target.y - pose.y) * pull - pose.vy * damping) * delta;
        pose.x += pose.vx * delta;
        pose.y += pose.vy * delta;
      }

      draw(now);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame || document.hidden || !onScreen) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const direction = pointerTarget(
        event.clientX,
        event.clientY,
        stage.getBoundingClientRect(),
        card.getBoundingClientRect()
      );
      target.x = direction.x;
      target.y = direction.y;
    };

    const lookForward = () => {
      target.x = 0;
      target.y = 0;
    };

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", lookForward);
    document.addEventListener("visibilitychange", handleVisibility);

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) start();
        else stop();
      });
      observer.observe(stage);
    }

    start();

    return () => {
      stop();
      observer?.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", lookForward);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reduced]);

  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-[380px] p-8"
    >
      <style>{`
@keyframes eyet-caret { 50% { opacity: 0; } }
.eyet-caret { animation: eyet-caret 1s step-end infinite; }
@media (prefers-reduced-motion: reduce) {
  .eyet-caret { animation: none; }
}
      `}</style>

      <div
        ref={stageRef}
        className="relative mx-auto grid h-[200px] w-[200px] place-items-center"
      >
        <button
          type="button"
          onClick={speak}
          aria-label="A cube with two eyes that follows the cursor. Press to make it speak."
          className="group h-[100px] w-[100px] cursor-pointer rounded-full border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1f1f0] dark:focus-visible:ring-offset-[#171717] [-webkit-tap-highlight-color:transparent]"
        >
          <svg
            viewBox="0 0 100 100"
            aria-hidden="true"
            className="block h-full w-full origin-center overflow-visible transition-transform duration-[420ms] ease-[cubic-bezier(.24,1.34,.38,1)] group-active:scale-[.96] group-active:duration-[160ms] group-active:ease-linear motion-reduce:transition-none"
          >
            <defs>
              <clipPath id={clipId}>
                <path d={CUBE_PATH} />
              </clipPath>
            </defs>
            <path d={CUBE_PATH} className="fill-white dark:fill-[#262626]" />
            <g clipPath={`url(#${clipId})`}>
              {[0, 1].map((index) => {
                const eye = INITIAL_EYES[index];
                return (
                  <g
                    key={index}
                    ref={(node) => {
                      eyeRefs.current[index] = node;
                    }}
                    transform={eye.transform}
                    style={{ opacity: eye.opacity }}
                  >
                    <rect
                      className="fill-[#17181a] dark:fill-white"
                      x={eye.x}
                      y={eye.y}
                      width={eye.width}
                      height={eye.height}
                      rx={eye.radius}
                    />
                  </g>
                );
              })}
            </g>
          </svg>
        </button>

        <span
          aria-live="polite"
          className="pointer-events-none absolute left-[136px] top-[130px] inline-flex min-h-[34px] items-center gap-[2px] whitespace-nowrap rounded-[6px_14px_14px] px-4 text-[13px] font-normal leading-tight tracking-normal text-white"
          style={{
            backgroundColor: tint,
            boxShadow: "inset 0 -1.5px rgba(0, 0, 0, 0.1)",
            opacity: speaking ? 1 : 0,
            scale: speaking ? "1" : "0.85",
            transformOrigin: "0 0",
            transition: reduced
              ? "none"
              : "opacity 160ms, scale 220ms cubic-bezier(.24,1.34,.38,1), background-color 220ms",
          }}
        >
          <span>{line}</span>
          <span
            aria-hidden="true"
            className="eyet-caret h-[13px] w-[1.5px] rounded-[1px] bg-white dark:bg-[#262626]"
          />
        </span>
      </div>
    </div>
  );
}
