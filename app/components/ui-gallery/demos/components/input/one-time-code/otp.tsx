"use client";

import {
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  CAPSULE,
  CARET_SPRING,
  CELL,
  DENY_MS,
  DENY_SETTLE_MS,
  ENTER_MS,
  ROW_HEIGHT,
  SUCCESS_SPRING,
  arrivalScale,
  caretX,
  cellX,
  checkScale,
  clamp,
  denyFall,
  denyOffset,
  fusedCellX,
  mix,
  rowWidth,
  smooth,
  stepSpring,
  type Spring,
} from "./engine";
import { OTP_CSS } from "./otp-css";
import { playOtpCue, unlockOtpAudio } from "./sound";

type Phase = "type" | "check" | "no" | "ok";
type Answer = "Accept" | "Reject";

type OtpProps = {
  /** The block only lays out 4 or 6 boxes; 4 stays 4, anything else widens to 6. */
  length?: 4 | 6;
  answer?: Answer;
  /** Clamped to the row height, exactly like `corner` on Bencho. */
  corner?: number;
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

function clearTimers(timers: number[]) {
  for (const timer of timers) window.clearTimeout(timer);
  timers.length = 0;
}

/**
 * Port of Bencho's "One-time code" (Type, one-time-code).
 *
 * Six — or four — boxes are drawn underneath a single invisible input, so
 * paste, browser autofill and backspace remain the browser's own behaviour.
 * A spring slides the caret from box to box. Filling the row checks the
 * answer: `Accept` fuses the cells into a "Verified" capsule, `Reject` shivers
 * the row, drains the digits right to left and starts over.
 *
 * Focus transfer is the block's own gesture: the transparent field covers the
 * whole row, so a click anywhere on the boxes focuses it; after a verified
 * capsule is pressed the field is focused again. Bencho never focuses on mount,
 * and these demos are also rendered as grid previews, so neither do we —
 * mounting focus would steal the page's focus and open mobile keyboards.
 */
export default function Otp({
  length = 4,
  answer = "Accept",
  corner = 12,
}: OtpProps) {
  const n = length === 4 ? 4 : 6;
  const radius = clamp(corner, 0, ROW_HEIGHT / 2);
  const width = rowWidth(n);
  const reduced = useReducedMotion();
  const fieldId = useId();
  const hintId = useId();
  const uid = useId();
  const filterId = `otp-goo-${uid.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("type");
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState(false);
  const [, force] = useReducer((tick: number) => tick + 1, 0);

  const inputRef = useRef<HTMLInputElement>(null);
  const caret = useRef<Spring>({ x: CELL / 2, v: 0 });
  const success = useRef({ x: 0, v: 0, to: 0 });
  const arrivals = useRef<number[]>([]);
  const denyAt = useRef(0);
  const frame = useRef(0);
  const timers = useRef<number[]>([]);
  const nowRef = useRef(0);

  // The animation frame reads one snapshot; state writes stay in React.
  const live = useRef({ code, n });
  live.current = { code, n };
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  function later(run: () => void, ms: number) {
    timers.current.push(window.setTimeout(run, ms));
  }

  function start() {
    if (frame.current) return;

    let previous = 0;

    const tick = (now: number) => {
      const rate = previous ? clamp((now - previous) / 16.67, 0, 2.5) : 1;
      previous = now;

      const state = live.current;
      let moving = false;

      const target = caretX(state.code.length, state.n);
      if (reducedRef.current) {
        caret.current.x = target;
        caret.current.v = 0;
      } else if (stepSpring(caret.current, target, CARET_SPRING, rate)) {
        moving = true;
      }

      const spring = success.current;
      if (spring.x !== spring.to || spring.v !== 0) {
        if (reducedRef.current) {
          spring.x = spring.to;
          spring.v = 0;
        } else if (
          stepSpring(spring, spring.to, SUCCESS_SPRING, rate, 0.0008)
        ) {
          moving = true;
        }
      }

      // Bencho keeps the loop alive for a moment after a rejection so the
      // shake can finish even when nothing else is in flight.
      if (now - denyAt.current < DENY_SETTLE_MS) moving = true;
      if (arrivals.current.some((at) => now - at < ENTER_MS)) moving = true;

      nowRef.current = now;
      force();
      frame.current = moving ? requestAnimationFrame(tick) : 0;
    };

    frame.current = requestAnimationFrame(tick);
  }

  // Same entry point as Bencho's `startRef`: a stable handle the effects call.
  const startRef = useRef(start);
  startRef.current = start;

  useEffect(() => {
    startRef.current();
  }, [code, n, phase, reduced]);

  useEffect(() => {
    clearTimers(timers.current);
    setCode("");
    setPhase("type");
    setError(false);
    success.current = { x: 0, v: 0, to: 0 };
    arrivals.current = [];
    caret.current = { x: CELL / 2, v: 0 };
  }, [n, answer]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      clearTimers(timers.current);
    },
    [],
  );

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (phase !== "type") return;

    unlockOtpAudio();

    const next = event.target.value.replace(/\D/g, "").slice(0, n);
    setError(false);

    if (!reduced && next.length > code.length) {
      const at = performance.now();
      for (let i = code.length; i < next.length; i += 1) {
        arrivals.current[i] = at + (i - code.length) * 45;
      }
      startRef.current();
    }

    setCode(next);
    if (next.length < n) return;

    setPhase("check");
    later(
      () => {
        if (answer === "Reject") {
          setPhase("no");
          setError(true);
          playOtpCue("deny");
          denyAt.current = performance.now();
          startRef.current();
          later(
            () => {
              setCode("");
              setPhase("type");
            },
            DENY_MS + n * 45 + 160,
          );
          return;
        }

        setPhase("ok");
        playOtpCue("perk");
        success.current.to = 1;
        inputRef.current?.blur();
      },
      reduced ? 0 : 420,
    );
  }

  function reset() {
    playOtpCue("expand");
    setCode("");
    setPhase("type");
    setError(false);
    arrivals.current = [];
    success.current.to = 0;
    inputRef.current?.focus();
  }

  const now = nowRef.current;
  const elapsed = phase === "no" ? now - denyAt.current : 0;
  const denied = phase === "no" && elapsed < DENY_MS && !reduced;

  const lift = success.current.x;
  const fused = clamp(lift, 0, 1);
  const overshoot = lift - 1;
  const bulge = Math.max(-0.12, overshoot);
  const capsuleWidth = CAPSULE * smooth(0.3, 1, fused) * (1 + bulge * 0.9);
  const capsuleScaleY = 1 - bulge * 0.55;
  const slotOpacity = 1 - smooth(0, 0.45, fused);
  const done = smooth(0.72, 1, fused);
  const caretOn =
    phase === "type" && focused && code.length < n && fused < 0.08;

  return (
    <div className="otp-demo w-full max-w-[320px]">
      <style>{OTP_CSS}</style>

      <div className="grid h-[132px] w-full place-items-center">
        <div className="otp" data-phase={phase}>
          <label htmlFor={fieldId} className="sr-only">
            {n}-digit verification code
          </label>

          <div className="otp-row" style={{ width, height: ROW_HEIGHT }}>
            <svg
              className="absolute h-0 w-0 overflow-hidden"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <filter
                  id={filterId}
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur
                    in="SourceGraphic"
                    stdDeviation="3"
                    result="smear"
                  />
                  <feColorMatrix
                    in="smear"
                    type="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -12"
                  />
                </filter>
              </defs>
            </svg>

            <div
              className="otp-goo"
              aria-hidden="true"
              style={{ filter: reduced ? undefined : `url(#${filterId})` }}
            >
              {Array.from({ length: n }, (_, index) => {
                const x = mix(cellX(index), fusedCellX(n), fused);
                const shake = denied ? denyOffset(index, elapsed) : 0;
                const scale = reduced
                  ? 1
                  : phase === "check"
                    ? checkScale(index, n, now)
                    : arrivalScale(arrivals.current[index], now);

                return (
                  <span
                    key={index}
                    className="otp-cell"
                    style={{
                      width: CELL,
                      borderRadius: mix(
                        radius,
                        ROW_HEIGHT / 2,
                        smooth(0.15, 0.7, fused),
                      ),
                      transform: `translateX(${(x + shake).toFixed(2)}px) scale(${scale.toFixed(3)})`,
                    }}
                  />
                );
              })}

              {capsuleWidth > 0.5 ? (
                <span
                  className="otp-cell"
                  style={{
                    width: capsuleWidth,
                    borderRadius: ROW_HEIGHT / 2,
                    transform: `translateX(${((width - capsuleWidth) / 2).toFixed(2)}px) scaleY(${capsuleScaleY.toFixed(3)})`,
                  }}
                />
              ) : null}
            </div>

            {Array.from({ length: n }, (_, index) => {
              const digit = code[index];
              const shake = denied ? denyOffset(index, elapsed) : 0;
              const x = mix(cellX(index), fusedCellX(n), fused) + shake;
              const fall = denied
                ? denyFall(index, n, elapsed)
                : { shift: 0, opacity: 1 };

              return (
                <span
                  key={index}
                  className="otp-slot"
                  style={{
                    width: CELL,
                    transform: `translateX(${x.toFixed(2)}px)`,
                    opacity: slotOpacity,
                  }}
                >
                  {digit ? (
                    <span
                      key={`${index}-${digit}`}
                      className="otp-digit"
                      style={{
                        translate: `0 ${fall.shift.toFixed(2)}px`,
                        opacity: fall.opacity,
                      }}
                    >
                      {digit}
                    </span>
                  ) : null}
                </span>
              );
            })}

            <i
              className="otp-caret"
              data-on={caretOn}
              aria-hidden="true"
              style={{
                transform: `translateX(${(caret.current.x - 1).toFixed(2)}px) scaleX(${(1 + Math.min(5, Math.abs(caret.current.v) * 0.9)).toFixed(3)})`,
              }}
            />

            <span
              className="otp-ok"
              aria-hidden="true"
              style={{ opacity: done, scale: mix(0.92, 1, done) }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8.5 6.5 12 13 4.5" />
              </svg>
              Verified
            </span>

            <input
              ref={inputRef}
              id={fieldId}
              className="otp-field"
              value={code}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onPointerDown={(event) => {
                if (phase === "ok") {
                  event.preventDefault();
                  reset();
                }
              }}
              onKeyDown={(event) => {
                if (
                  phase === "ok" &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  event.preventDefault();
                  reset();
                }
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              data-1p-ignore="true"
              data-lpignore="true"
              data-bwignore="true"
              data-form-type="other"
              maxLength={n}
              spellCheck={false}
              aria-label={
                phase === "ok"
                  ? "Verified. Press to enter a new code"
                  : `${n}-digit code`
              }
              aria-describedby={hintId}
              aria-invalid={error ? true : undefined}
            />
          </div>
        </div>
      </div>

      <p
        id={hintId}
        aria-live="polite"
        aria-atomic="true"
        className={`mt-3 min-h-[1.25rem] text-center text-xs ${
          error ? "text-[#e5484d]" : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        {phase === "ok"
          ? "Verified. Click the capsule to start over."
          : error
            ? "That code did not match. Try again."
            : phase === "check"
              ? "Checking…"
              : ""}
      </p>
    </div>
  );
}
