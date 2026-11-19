"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { BalanceChart } from "./balance-chart";
import {
  BASE_GROW,
  BLEND_MS,
  REFRESH_MS,
  RESISTANCE,
  SAMPLE_COUNT,
  SERIES,
  STRETCH,
  THRESHOLD,
  WINDOWS,
  clamp,
  drawPull,
  easeOutQuart,
  formatChange,
  lerp,
  pathFrom,
  plot,
  sample,
  scrubTime,
  sliceSeries,
  splitMoney,
  type Point,
} from "./engine";
import { useReducedMotion, useSpring } from "./motion";
import { RefreshRing } from "./refresh-ring";
import { WindowSwitch } from "./window-switch";

type Phase = "idle" | "hold" | "work";

type Blend = {
  points: Point[];
  value: number;
  change: number;
  pct: number;
  t0: number;
};

/**
 * 1:1 port of Bencho's "Pull to refresh" block.
 *
 * The card is a fixed shell; only the sheet inside moves. Pulling writes a
 * rubber-banded distance (510px asymptote) into the sheet transform and grows
 * the shell's bottom padding by the same saturating amount, so the silhouette
 * stretches instead of sliding. Six droplets fuse into one ring as the pull
 * approaches the 58px threshold and spin while the refresh works.
 *
 * Bencho plays a `drag` cue while scrubbing the chart; the gallery is silent,
 * so that is the only omitted part of the behaviour.
 */
export default function Demo() {
  const reduced = useReducedMotion();
  const [raw, setRaw] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [series, setSeries] = useState(0);
  const [view, setView] = useState(WINDOWS.length - 1);
  const [scrub, setScrub] = useState<number | null>(null);
  const [announce, setAnnounce] = useState("");
  const [clock, setClock] = useState(0);

  const sheet = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{
    x: number;
    y: number;
    from: number;
    on: boolean;
  } | null>(null);
  const timer = useRef(0);
  const previousWindow = useRef(view);
  const blend = useRef<Blend | null>(null);
  const blendFrame = useRef(0);
  const armedRef = useRef(false);

  const drawn = drawPull(raw, RESISTANCE);
  const pull = useSpring(
    phase === "work" ? THRESHOLD : phase === "hold" ? drawn : 0,
    58,
    reduced || phase === "hold"
  );

  const held = Math.max(0, pull);
  const progress = clamp(held / THRESHOLD, 0, 1);
  const armed = progress >= 1;
  armedRef.current = armed;

  const stretch =
    pull >= 0 ? STRETCH * Math.tanh(pull / STRETCH) : Math.max(-8, pull);
  const grow = BASE_GROW + stretch;

  const data = sliceSeries(series, view);
  const targetPlot = plot(data);
  const lastIndex = data.length - 1;
  const targetValue = data[lastIndex];
  const targetChange = targetValue - data[0];
  const targetPct = (targetChange / data[0]) * 100;

  const blending = blend.current !== null && !reduced;
  const eased = blending
    ? easeOutQuart(clamp((clock - (blend.current?.t0 ?? 0)) / BLEND_MS, 0, 1))
    : 1;
  const useBlend = blending && eased < 1 && scrub === null;
  const targetSamples = sample(targetPlot);
  const points = useBlend
    ? blend.current!.points.map((point, index) => ({
        x: lerp(point.x, targetSamples[index].x, eased),
        y: lerp(point.y, targetSamples[index].y, eased),
      }))
    : targetSamples;

  let value = targetValue;
  let change = targetChange;
  let pct = targetPct;

  if (scrub !== null) {
    const low = Math.floor(scrub);
    const high = Math.min(lastIndex, Math.ceil(scrub));
    value = lerp(data[low], data[high], scrub - low);
    change = value - data[0];
    pct = (change / data[0]) * 100;
  } else if (useBlend) {
    value = lerp(blend.current!.value, targetValue, eased);
    change = lerp(blend.current!.change, targetChange, eased);
    pct = lerp(blend.current!.pct, targetPct, eased);
  }

  const [whole, decimal] = splitMoney(value);
  const up = change >= 0;
  const shown = useBlend
    ? points[SAMPLE_COUNT - 1]
    : targetPlot.at(scrub ?? lastIndex);
  const path = useBlend ? pathFrom(points) : targetPlot.d;

  const total = SERIES[series % SERIES.length].length;
  const skipped = total - data.length;
  const windowSpan =
    scrub === null
      ? WINDOWS[view].span
      : scrubTime(skipped + scrub, total);

  // Cross-fade the chart when the time window changes. The source eases the
  // previous curve into the next one over 420ms instead of snapping.
  useEffect(() => {
    const previous = previousWindow.current;
    if (previous === view) {
      if (blend.current) {
        blend.current = null;
        setClock(performance.now());
      }
      return;
    }
    previousWindow.current = view;

    const from = sliceSeries(series, previous);
    const previousPlot = plot(from);
    blend.current = {
      points: sample(previousPlot),
      value: from[from.length - 1],
      change: from[from.length - 1] - from[0],
      pct: ((from[from.length - 1] - from[0]) / from[0]) * 100,
      t0: performance.now(),
    };
    setScrub(null);

    cancelAnimationFrame(blendFrame.current);
    if (reduced) {
      blend.current = null;
      return;
    }

    setClock(performance.now());
    const tick = () => {
      const now = performance.now();
      setClock(now);
      if (now - blend.current!.t0 < BLEND_MS) {
        blendFrame.current = requestAnimationFrame(tick);
      } else {
        blend.current = null;
        blendFrame.current = 0;
      }
    };
    blendFrame.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(blendFrame.current);
      blendFrame.current = 0;
    };
  }, [reduced, series, view]);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      cancelAnimationFrame(blendFrame.current);
    },
    []
  );

  function refresh() {
    if (phase === "work") return;
    setPhase("work");
    setScrub(null);
    setAnnounce("Refreshing balance");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setSeries((current) => current + 1);
      setPhase("idle");
      setAnnounce("Balance updated");
    }, REFRESH_MS);
  }

  function release() {
    const state = drag.current;
    if (!state) return;
    drag.current = null;
    setRaw(0);
    if (!state.on) return;
    if (armedRef.current) refresh();
    else setPhase("idle");
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const element = sheet.current;
    if (!element || phase === "work" || element.scrollTop > 0) return;

    const rect = element.getBoundingClientRect();
    const from = rect.width / (element.offsetWidth || 1) || 1;
    drag.current = { x: event.clientX, y: event.clientY, from, on: false };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state || phase === "work") return;

    const dy = (event.clientY - state.y) / state.from;
    const dx = (event.clientX - state.x) / state.from;

    if (!state.on) {
      if (dy < -4) {
        drag.current = null;
        return;
      }
      if (Math.abs(dx) > 4 && Math.abs(dx) > Math.abs(dy)) {
        drag.current = null;
        return;
      }
      if (dy < 4) return;
      state.on = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      setScrub(null);
    }

    setPhase("hold");
    setRaw(Math.max(0, dy));
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    refresh();
  }

  function handleScrub(event: ReactPointerEvent<HTMLSpanElement>) {
    if (drag.current?.on || phase === "work") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = clamp(
      (event.clientX - rect.left) / (rect.width || 1),
      0,
      1
    );
    setScrub(fraction * lastIndex);
  }

  const shellStyle = {
    paddingBottom: grow,
    marginBottom: -grow,
  } as CSSProperties;

  return (
    <div className="flex w-full flex-col items-center justify-center px-2 py-6">
      <style>{`@keyframes ptr-spin { to { rotate: 360deg } }`}</style>

      <div className="relative w-[300px] max-w-full">
        <div
          data-phase={phase}
          data-armed={armed || undefined}
          style={shellStyle}
          className="relative overflow-hidden rounded-[28px] bg-white ring-1 ring-black/[0.06] dark:bg-[#262626] dark:ring-white/[0.08]"
        >
          <RefreshRing phase={phase} progress={progress} reduced={reduced} />

          <div
            ref={sheet}
            role="group"
            tabIndex={0}
            aria-label="Balance card. Pull down, or press Enter, to refresh."
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={release}
            onPointerCancel={release}
            onLostPointerCapture={release}
            style={{
              transform: `translateY(${held.toFixed(2)}px)`,
              touchAction: "pan-x",
            }}
            className="relative z-[2] select-none bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400/60 dark:bg-[#262626]"
          >
            <div className="px-4 pb-2 pt-4">
              <p className="m-0 text-[30px] font-medium leading-none tracking-[-0.03em] text-[#17181a] [font-variant-numeric:tabular-nums] dark:text-white">
                <span className="mr-[2px]">$</span>
                {whole}
                <span className="text-[20px] font-medium tracking-[-0.02em] opacity-[0.34]">
                  {decimal}
                </span>
              </p>

              <p
                className={`m-0 mt-[9px] flex items-baseline gap-2 text-xs font-normal [font-variant-numeric:tabular-nums] ${
                  up
                    ? "text-[#15803d] dark:text-[#34d17a]"
                    : "text-[#b8431c]"
                }`}
              >
                {formatChange(change)}
                <span aria-hidden="true">·</span>
                {Math.abs(pct).toFixed(1)}%
                <span className="text-[#17181a]/[0.32] dark:text-white/[0.32]">
                  {windowSpan}
                </span>
              </p>

              <BalanceChart
                path={path}
                shown={shown}
                scrub={scrub}
                up={up}
                onScrub={handleScrub}
                onLeave={() => setScrub(null)}
              />

              <WindowSwitch view={view} onChange={setView} />
            </div>
          </div>
        </div>
      </div>

      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announce}
      </span>
    </div>
  );
}
