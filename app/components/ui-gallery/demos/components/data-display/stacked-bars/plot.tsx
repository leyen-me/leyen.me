"use client";

import { useMemo, useRef, type KeyboardEvent, type PointerEvent } from "react";
import {
  ALERT_COLOUR,
  BAR_COUNT,
  BASE_TOP,
  CATEGORIES,
  ESC_TOP,
  PLOT_H,
  PLOT_W,
  SEG_GAP,
  SERIES_COLOURS,
  TIP_W,
  formatNumber,
  type Bar,
  type Layout,
  type Mode,
} from "./data";
import useSprings from "./spring";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

type PlotProps = {
  id: string;
  mode: Mode;
  series: Bar[];
  layout: Layout;
  active: number | null;
  revealed: boolean;
  reduced: boolean;
  onActive: (index: number | null) => void;
};

/**
 * The scrub area: stacked columns, hover ring and tooltip.
 *
 * Ring and tooltip are moved by a 380/34 spring; bars keep the block's own
 * 600 ms per-column staggered CSS transition. The pointer drives the whole
 * plot, while each column is a real button for keyboard users.
 */
export default function StackedPlot({
  id,
  mode,
  series,
  layout,
  active,
  revealed,
  reduced,
  onActive,
}: PlotProps) {
  const plotRef = useRef<HTMLDivElement>(null);

  const activeBar = active === null ? null : series[active];

  const topSegments = useMemo(() => {
    if (!activeBar) return [];
    return activeBar.vals
      .map((value, segment) => ({ value, segment }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 2);
  }, [activeBar]);

  const geometry = useMemo(() => {
    const laid = active === null ? null : layout.bars[active];
    if (active === null || !laid) return null;
    const left = active * (layout.colW + layout.gap);
    const beside = left + layout.colW + 8;
    const tipX =
      beside + TIP_W <= PLOT_W || left - 8 - TIP_W < 0
        ? Math.min(136, beside)
        : left - 8 - TIP_W;

    return {
      x: left - 3,
      y: BASE_TOP - 2 - laid.top - 3,
      height: laid.top + SEG_GAP + 1 + SEG_GAP + laid.esc + 6,
      tip: tipX,
    };
  }, [active, layout]);

  // The original parks the ring and tooltip on their last position when the
  // pointer leaves; only opacity hides them.
  const parked = useRef({ x: 0, y: 0, height: 0, tip: 0 });
  if (geometry) parked.current = geometry;
  const springs = useSprings(parked.current, reduced);

  function scrub(event: PointerEvent<HTMLDivElement>) {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const index = Math.floor(
      ((event.clientX - rect.left) / rect.width) * BAR_COUNT
    );
    onActive(Math.max(0, Math.min(BAR_COUNT - 1, index)));
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is best-effort (older Safari, synthetic pointers).
    }
    scrub(event);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Already released or never captured.
    }
    if (event.pointerType !== "mouse") onActive(null);
  }

  function onBarKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = Math.max(0, Math.min(BAR_COUNT - 1, (active ?? 0) + step));
    const columns =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        "[data-bar]"
      );
    columns?.[next]?.focus();
  }

  const barTransition = (index: number) =>
    reduced
      ? "none"
      : `height 600ms ${EASE} ${index * 14}ms, bottom 600ms ${EASE} ${
          index * 14
        }ms, background-color 160ms ease`;

  return (
    <div
      ref={plotRef}
      id={id}
      role="tabpanel"
      aria-label={`Traffic by ${mode === "Day" ? "day" : "week"}, stacked by channel`}
      className="relative cursor-crosshair touch-none"
      style={{ height: PLOT_H }}
      onPointerDown={onPointerDown}
      onPointerMove={scrub}
      onPointerUp={onPointerUp}
      onPointerCancel={() => onActive(null)}
      onPointerLeave={() => onActive(null)}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 z-0 h-px bg-black/[0.12] dark:bg-white/[0.12]"
        style={{ top: BASE_TOP }}
      />

      {series.map((bar, index) => {
        const laid = layout.bars[index];
        const dimmed = active !== null && active !== index;
        const summary = CATEGORIES.map(
          (name, segment) => `${name} ${formatNumber(bar.vals[segment])}`
        ).join(", ");

        return (
          <button
            key={index}
            type="button"
            data-bar=""
            aria-label={`${bar.label}: ${formatNumber(
              layout.totals[index]
            )} visits. ${summary}. Bounced ${bar.esc}.`}
            onFocus={() => onActive(index)}
            onBlur={() => onActive(null)}
            onKeyDown={onBarKeyDown}
            className="absolute inset-y-0 z-10 cursor-crosshair bg-transparent p-0 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            style={{
              left: index * (layout.colW + layout.gap),
              width:
                index === BAR_COUNT - 1
                  ? layout.colW
                  : layout.colW + layout.gap,
              borderRadius: layout.radius + 3,
            }}
          >
            {laid.segs.map((segment, segmentIndex) => {
              const colour = SERIES_COLOURS[segmentIndex];
              return (
                <span
                  key={segmentIndex}
                  aria-hidden="true"
                  className="absolute left-0 block"
                  style={{
                    width: layout.colW,
                    bottom: 25 + (revealed ? segment.bottom : 0),
                    height: revealed ? segment.h : 0,
                    borderRadius: layout.radius,
                    backgroundColor: dimmed
                      ? `color-mix(in srgb, ${colour} 38%, var(--stb-slab))`
                      : colour,
                    transition: barTransition(index),
                  }}
                />
              );
            })}

            <span
              aria-hidden="true"
              className="absolute left-0 block"
              style={{
                width: layout.colW,
                top: ESC_TOP,
                height: revealed ? laid.esc : 0,
                borderRadius: layout.radius,
                backgroundColor: dimmed
                  ? `color-mix(in srgb, ${ALERT_COLOUR} 38%, var(--stb-slab))`
                  : ALERT_COLOUR,
                transition: barTransition(index),
              }}
            />
          </button>
        );
      })}

      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-20 box-border border-[1.5px] transition-opacity duration-[160ms]"
        style={{
          width: layout.colW + 6,
          height: springs.height,
          transform: `translate3d(${springs.x}px, ${springs.y}px, 0)`,
          borderRadius: layout.radius + 3,
          borderColor: "var(--stb-mute)",
          opacity: active === null ? 0 : 1,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-30 flex flex-col gap-1 rounded-[10px] border border-black/10 bg-[var(--stb-slab)] px-2.5 py-2 text-[12px] leading-4 transition-opacity duration-[160ms] dark:border-white/10"
        style={{
          width: TIP_W,
          transform: `translate3d(${springs.tip}px, 0, 0)`,
          opacity: activeBar ? 1 : 0,
        }}
      >
        {activeBar && active !== null ? (
          <>
            <div className="mb-0.5 flex items-center justify-between gap-1.5 whitespace-nowrap text-[#8b8b8c] dark:text-[#979797]">
              <span>{activeBar.label}</span>
              <b className="font-medium tabular-nums text-[#17181a] dark:text-white">
                {formatNumber(layout.totals[active])}
              </b>
            </div>

            {topSegments.map(({ value, segment }) => (
              <div
                key={CATEGORIES[segment]}
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <i
                  aria-hidden="true"
                  className="block h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: SERIES_COLOURS[segment] }}
                />
                <span className="flex-1 text-[#4b4c4d] dark:text-[#c2c2c2]">
                  {CATEGORIES[segment]}
                </span>
                <b className="font-normal tabular-nums text-[#17181a] dark:text-white">
                  {formatNumber(value)}
                </b>
              </div>
            ))}

            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <i
                aria-hidden="true"
                className="block h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: ALERT_COLOUR }}
              />
              <span className="flex-1 text-[#4b4c4d] dark:text-[#c2c2c2]">
                Bounced
              </span>
              <b className="font-normal tabular-nums text-[#17181a] dark:text-white">
                {activeBar.esc}
              </b>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
