"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  BAR_COUNT,
  GAP_MAX,
  formatNumber,
  generateSeries,
  layoutSeries,
  type Mode,
} from "./data";
import StackedPlot from "./plot";
import useReducedMotion from "./use-reduced-motion";

const cardWidth: CSSProperties = { width: 300 };

const MODES: Mode[] = ["Day", "Week"];

/**
 * Faithful port of Bencho's "Stacked bars" (Hover, Colour + 20 bars + 6px gap).
 *
 * Geometry, seeded data, palette, the 600 ms staggered bar transitions and the
 * 380/34 spring on the hover ring + tooltip follow the original. The plot is
 * scrubbed with the pointer; columns are also buttons, so keyboard focus
 * summons the same ring and tooltip. The tooltip doubles as the channel
 * legend — the block ships no separate legend.
 */
export default function Demo() {
  const [mode, setMode] = useState<Mode>("Day");
  const [active, setActive] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const reduced = useReducedMotion();

  const cardRef = useRef<HTMLDivElement>(null);
  const plotId = useId();

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const series = useMemo(() => generateSeries(mode, BAR_COUNT), [mode]);
  const layout = useMemo(
    () => layoutSeries(series, BAR_COUNT, GAP_MAX),
    [series]
  );

  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next: Mode = mode === "Day" ? "Week" : "Day";
    setMode(next);
    const tabs =
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs[next === "Week" ? 1 : 0]?.focus();
  }

  return (
    <div className="flex w-full justify-center py-6">
      <div
        ref={cardRef}
        className="relative flex select-none flex-col gap-4 rounded-panel bg-surface-0 p-4 text-[13px] text-[#17181a] [--stb-slab:var(--surface-0)] [--stb-mute:#8b8b8c] dark:text-white dark:[--stb-mute:#979797]"
        style={cardWidth}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-medium leading-[18px] tracking-[-0.01em]">
              Traffic
            </div>
            <div className="text-[12px] leading-4 tabular-nums text-[#8b8b8c] dark:text-[#979797]">
              Last {BAR_COUNT} {mode === "Day" ? "days" : "weeks"}
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Traffic range"
            onKeyDown={onTabKeyDown}
            className="relative grid grid-cols-2 rounded-control bg-black/[0.06] p-0.5 dark:bg-white/[0.06]"
          >
            <span
              aria-hidden="true"
              className={`absolute bottom-0.5 left-0.5 top-0.5 w-[calc(50%-2px)] rounded-lg bg-[var(--stb-slab)] transition-transform duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                mode === "Week" ? "translate-x-full" : ""
              }`}
            />
            {MODES.map((value) => {
              const selected = value === mode;
              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={plotId}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => {
                    if (value !== mode) setMode(value);
                  }}
                  className={`relative z-10 h-7 rounded-lg px-2.5 text-[12px] font-medium transition-[color,transform] duration-[160ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 active:scale-[0.96] motion-reduce:transition-none ${
                    selected
                      ? "text-[#17181a] dark:text-white"
                      : "text-[#8b8b8c] hover:text-[#4b4c4d] dark:text-[#979797] dark:hover:text-[#c2c2c2]"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>

        <div className="-mb-1 flex items-baseline gap-2" aria-live="polite">
          <span className="text-[30px] font-medium leading-8 tracking-[-0.03em] tabular-nums">
            {formatNumber(layout.total)}
          </span>
          <span className="text-[13px] text-[#8b8b8c] dark:text-[#979797]">
            visits
          </span>
        </div>

        <StackedPlot
          id={plotId}
          mode={mode}
          series={series}
          layout={layout}
          active={active}
          revealed={revealed}
          reduced={reduced}
          onActive={setActive}
        />

        <div className="-mt-2 flex justify-between text-[11px] leading-[14px] tabular-nums text-[#b3b3b4] dark:text-[#6b6b6b]">
          <span>{series[0].short}</span>
          <span>{series[BAR_COUNT - 1].short}</span>
        </div>
      </div>
    </div>
  );
}
