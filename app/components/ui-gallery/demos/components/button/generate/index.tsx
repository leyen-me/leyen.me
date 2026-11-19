"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FlowerArt, FlowerDefs } from "./flower";
import { playGenerateSound } from "./sound";

/**
 * A 1:1 port of Bencho's "Generate" press block (Press, `generate`).
 *
 * A five-second clock drives three windows of the same easing: the distorted
 * print fades in, its displacement and blur let go while contrast falls back to
 * neutral, and the sharp print is washed in last. The progress readout samples
 * a randomised monotone path so it advances in uneven steps, exactly like the
 * source. After the final frame the block holds at 100 % for 650 ms, then the
 * Generate pill can be used again by hovering the card (Bencho has no separate
 * reset affordance).
 *
 * Differences from the original, both forced by the gallery rules: the
 * `/lab/flower.jpg` photograph is replaced by an inline vector print, and the
 * Web Audio cues are rebuilt from the source's voice tables.
 */
const PACE = 5;
const RIPPLE = 50;
const HOLD_MS = 650;
const REDUCED_MS = 400;
/** `u` in the source: the paper white the contrast transfer converges on. */
const PAPER = 0.9;

type Point = readonly [number, number];

/** Deterministic fallback; real points are rolled inside the click handler. */
const FALLBACK_SHAPES: readonly Point[] = [
  [0, 0],
  [0.13, 0.13],
  [0.35, 0.26],
  [0.47, 0.55],
  [0.59, 0.65],
  [0.7, 0.86],
  [1, 1],
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;
const smooth = (from: number, to: number, value: number) => {
  const x = clamp((value - from) / (to - from), 0, 1);
  return x * x * (3 - 2 * x);
};

/** Bencho's lerp between linear and smoothstep, then between the two y values. */
function shapeAt(points: readonly Point[], t: number) {
  for (let index = 1; index < points.length; index += 1) {
    const [x0, y0] = points[index - 1];
    const [x1, y1] = points[index];
    if (t > x1) continue;

    const span = x1 - x0 || 1;
    const u = clamp((t - x0) / span, 0, 1);
    return mix(y0, y1, mix(u, u * u * (3 - 2 * u), 0.5));
  }
  return 1;
}

function createShapes(): Point[] {
  const jitter = (from: number, to: number) =>
    from + Math.random() * (to - from);

  return [
    [0, 0],
    [jitter(0.1, 0.16), jitter(0.1, 0.16)],
    [jitter(0.32, 0.38), jitter(0.22, 0.3)],
    [jitter(0.44, 0.49), jitter(0.5, 0.6)],
    [jitter(0.56, 0.61), jitter(0.62, 0.68)],
    [jitter(0.68, 0.72), jitter(0.84, 0.88)],
    [1, 1],
  ];
}

export default function Demo() {
  const rawId = useId();
  const idPrefix = `gen-${rawId.replace(/:/g, "")}`;
  const filterId = `${idPrefix}-filter`;

  /** Progress of the run, 0 → 1. Idle is 1 so no print is shown. */
  const [progress, setProgress] = useState(1);
  /** The 650 ms hold at 100 % after the clock lands. */
  const [holding, setHolding] = useState(false);
  /** True once a print has been produced; Bencho never clears it. */
  const [made, setMade] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const frame = useRef(0);
  const holdTimer = useRef<number | undefined>(undefined);
  const shapes = useRef<Point[] | null>(null);

  const busy = progress < 1;
  const loading = busy || holding;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      window.clearTimeout(holdTimer.current);
    },
    [],
  );

  function start() {
    if (loading) return;

    playGenerateSound("expand");
    shapes.current = createShapes();
    setProgress(0);
    setHolding(false);
    setAnnouncement("Generating image");

    window.clearTimeout(holdTimer.current);
    cancelAnimationFrame(frame.current);

    const duration = reduced ? REDUCED_MS : PACE * 1000;
    let startedAt: number | null = null;

    const tick = (now: number) => {
      if (startedAt === null) startedAt = now;

      const next = Math.min(1, (now - startedAt) / duration);
      setProgress(next);

      if (next < 1) {
        frame.current = requestAnimationFrame(tick);
        return;
      }

      frame.current = 0;
      playGenerateSound("lift");
      setMade(true);
      setHolding(true);
      setAnnouncement("Image generated");
      holdTimer.current = window.setTimeout(() => setHolding(false), HOLD_MS);
    };

    frame.current = requestAnimationFrame(tick);
  }

  // The three clocks, straight from the source.
  const plate = smooth(0, 0.3, progress); // print opacity
  const shapesClock = smooth(0.1, 0.82, progress); // blur + contrast
  const wash = smooth(0.7, 1, progress); // sharp print

  const blur = mix(20, 1.6, 1 - (1 - shapesClock) ** 2.2);
  const contrast = mix(2.4, 1, shapesClock);
  const displacement =
    (RIPPLE / 100) * 32 * (1 - smooth(0.05, 0.9, progress)) ** 1.5;
  const frequency = 0.006 + 0.0018 * Math.sin(progress * 4.4);
  const intercept = PAPER - PAPER * contrast;

  const points = shapes.current ?? FALLBACK_SHAPES;
  const percent = holding
    ? 100
    : Math.min(99, Math.floor(shapeAt(points, progress) * 100));

  return (
    <div className="w-[270px] max-w-full">
      <div
        role="group"
        aria-label="AI image generator"
        className="group relative h-[330px] w-full overflow-hidden rounded-panel bg-surface-0"
      >
        <FlowerDefs
          filterId={filterId}
          baseFrequency={`${frequency.toFixed(4)} ${(frequency * 1.3).toFixed(4)}`}
          displacement={displacement.toFixed(2)}
          blur={blur.toFixed(2)}
          slope={contrast.toFixed(3)}
          intercept={intercept.toFixed(3)}
        />

        {/* The filtered print exists only while the clock runs. */}
        {busy && !reduced ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: plate * mix(0.7, 1, shapesClock),
              scale: mix(1.04, 1, smooth(0, 0.9, progress)).toFixed(3),
              filter: `url(#${filterId})`,
            }}
          >
            <FlowerArt idPrefix={`${idPrefix}-soft`} />
          </div>
        ) : null}

        {made || busy ? (
          <div
            aria-hidden={busy ? "true" : undefined}
            role={!busy ? "img" : undefined}
            aria-label={!busy ? "A flower, printed in halftone" : undefined}
            className="pointer-events-none absolute inset-0"
            style={
              busy
                ? {
                    opacity: reduced ? progress : wash,
                    filter:
                      !reduced && wash < 0.999
                        ? `blur(${mix(1.6, 0, wash).toFixed(2)}px)`
                        : undefined,
                  }
                : undefined
            }
          >
            <FlowerArt idPrefix={`${idPrefix}-sharp`} />
          </div>
        ) : null}

        <button
          type="button"
          onClick={start}
          disabled={loading}
          tabIndex={loading ? -1 : 0}
          aria-label={made ? "Generate again" : "Generate"}
          style={{ scale: loading ? 0.9 : undefined }}
          className={`absolute left-1/2 top-1/2 z-[2] flex h-[42px] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center gap-2 rounded-panel px-5 text-sm font-medium tracking-[-0.01em] transition-[opacity,scale] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:[scale:0.97] active:[scale:0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 motion-reduce:transition-none dark:focus-visible:ring-white/45 ${
            made
              ? "bg-surface-0 text-[#17181a] dark:text-[#f4f3f1]"
              : "bg-surface-1 text-[#17181a] dark:text-[#f4f3f1]"
          } ${
            loading
              ? "pointer-events-none opacity-0"
              : made
                ? "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                : "opacity-100"
          }`}
        >
          <span>Generate</span>
        </button>

        <span
          role="status"
          aria-live="off"
          className="absolute bottom-[10px] left-[10px] z-[2] grid h-[22px] place-items-center rounded-full bg-white/80 px-2 text-[11px] font-medium leading-none tracking-normal text-[#17181a] tabular-nums backdrop-blur-[8px] transition-[opacity,translate] duration-[160ms] motion-reduce:transition-none dark:bg-[#18181b]/80 dark:text-[#f4f3f1]"
          style={{
            opacity: loading ? 1 : 0,
            translate: loading ? "0 0" : "0 4px",
          }}
        >
          {percent}%
        </span>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  );
}
