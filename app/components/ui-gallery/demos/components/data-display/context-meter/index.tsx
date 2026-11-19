"use client";

import { useEffect, useRef, useState } from "react";
import {
  BAR_ORDER,
  CHIP_ORDER,
  LIMIT,
  formatTokens,
  kindById,
  totalFor,
  valuesFor,
  type KindId,
} from "./engine";
import RollingText from "./rolling-text";
import { cue } from "./sound";
import {
  CONTEXT_METER_CSS,
  GIVE_CHAT,
  GIVE_DEFAULT,
  WAVE_DURATION,
  WAVE_STAGGER,
} from "./styles";
import useReducedMotion from "./use-reduced-motion";

const KIND_COLOUR: Record<KindId, string> = {
  sys: "bg-[#ec4f8c]",
  tools: "bg-[#9a5cf6]",
  files: "bg-[#3d7ef5]",
  chat: "bg-[#1db4cc]",
  mem: "bg-[#2ccb7e]",
};

/**
 * Faithful port of Bencho's "Context meter" (Hover, Bar + Colour defaults).
 *
 * The bar is six flex children: the five kinds ordered by resting size, then
 * the unused room. Hovering a segment or chip lights that kind and shows its
 * own count; compact swaps chat's flex-grow to 30.4 and sends a 760 ms give
 * wave down the bar, staggered 55 ms per segment, over the original sound.
 * The field-of-dots variant is a source prop, not the default here, so it is
 * intentionally not shipped.
 */
export default function Demo() {
  const [compacted, setCompacted] = useState(false);
  const [active, setActive] = useState<KindId | null>(null);
  const [up, setUp] = useState(true);
  const [started, setStarted] = useState(false);
  const reduced = useReducedMotion();

  const barRef = useRef<HTMLDivElement>(null);
  const animations = useRef<Animation[]>([]);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  const values = valuesFor(compacted);
  const total = totalFor(values);
  const display = active ? values[active] : total;
  const label = active ? kindById(active).name : `of ${LIMIT}K`;

  useEffect(
    () => () => {
      animations.current.forEach((animation) => animation.cancel());
      animations.current = [];
    },
    []
  );

  function playGive() {
    if (reducedRef.current) return;

    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];

    const segments = barRef.current?.querySelectorAll<HTMLElement>(
      "[data-ctx-seg]:not([data-room])"
    );
    if (!segments) return;

    segments.forEach((segment, index) => {
      const give = segment.dataset.kind === "chat" ? GIVE_CHAT : GIVE_DEFAULT;
      const animation = segment.animate(
        [
          { transform: "scale(1, 1)" },
          { transform: `scale(1, ${give})`, offset: 0.38 },
          { transform: "scale(1, 1.03)", offset: 0.72 },
          { transform: "scale(1, 1)" },
        ],
        {
          duration: WAVE_DURATION,
          delay: index * WAVE_STAGGER,
          easing: "cubic-bezier(0.33, 0, 0.2, 1)",
          fill: "both",
        }
      );
      animations.current.push(animation);
    });
  }

  function focusKind(id: KindId | null) {
    if (id !== null) setStarted(true);

    const previous = active ? values[active] : total;
    const next = id ? values[id] : total;
    setUp(next > previous);
    setActive(id);
  }

  function toggle() {
    const next = !compacted;
    const nextValues = valuesFor(next);
    const previous = active ? values[active] : total;
    const shown = active ? nextValues[active] : totalFor(nextValues);

    setUp(shown > previous);
    setStarted(true);
    cue(next ? "compact" : "restore");
    setCompacted(next);
    playGive();
  }

  return (
    <div className="flex w-full items-center justify-center py-6">
      <style>{CONTEXT_METER_CSS}</style>

      <div
        className="ctx-meter w-[309px] max-w-full rounded-[20px] bg-white p-4 text-[#17181a] ring-1 ring-black/[0.08] dark:bg-[#0e0f11] dark:text-white dark:ring-white/[0.08]"
        onPointerLeave={() => setActive(null)}
      >
        <div className="flex items-center justify-between">
          <span className="text-base font-medium leading-5 tracking-[-0.01em]">
            Context
          </span>
          <button
            type="button"
            onClick={toggle}
            className={
              compacted
                ? "ctx-act h-7 rounded-full bg-black/[0.05] px-3 text-[13px] font-medium text-zinc-500 hover:[scale:0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:[scale:0.96] dark:bg-white/[0.08] dark:text-white dark:focus-visible:ring-offset-[#0e0f11]"
                : "ctx-act h-7 rounded-full bg-black/[0.10] px-3 text-[13px] font-medium text-[#17181a] hover:[scale:0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:[scale:0.96] dark:bg-white dark:text-[#0e0f11] dark:focus-visible:ring-offset-[#0e0f11]"
            }
          >
            {compacted ? "Undo" : "Compact"}
          </button>
        </div>

        <div className="mt-3 mb-4 flex items-baseline gap-1.5" aria-live="polite">
          <span className="sr-only">{formatTokens(display)}</span>
          <span className="relative inline-flex text-[30px] font-medium leading-8 tracking-[-0.03em] tabular-nums">
            <RollingText text={formatTokens(display)} up={up} animate={started} />
          </span>
          <span className="text-[13px] text-zinc-500 dark:text-zinc-400">
            {label}
          </span>
        </div>

        <div
          ref={barRef}
          aria-hidden="true"
          className="flex h-10 gap-[3px]"
          onPointerLeave={() => setActive(null)}
        >
          {BAR_ORDER.map((kind, index) => {
            const first = index === 0;
            const dim = active !== null && active !== kind.id;

            return (
              <span
                key={kind.id}
                data-ctx-seg=""
                data-kind={kind.id}
                onPointerEnter={() => focusKind(kind.id)}
                className={`ctx-seg block min-w-[3px] basis-0 ${
                  KIND_COLOUR[kind.id]
                } ${
                  dim ? "opacity-[0.22]" : "opacity-100"
                } ${
                  first ? "rounded-l-[6px] rounded-r-[2px]" : "rounded-[6px]"
                }`}
                style={{ flexGrow: values[kind.id] }}
              />
            );
          })}

          <span
            data-ctx-seg=""
            data-room=""
            onPointerEnter={() => focusKind(null)}
            className={`ctx-seg block min-w-[3px] basis-0 rounded-l-[2px] rounded-r-[6px] bg-black/[0.08] dark:bg-white/[0.08] ${
              active !== null ? "opacity-[0.22]" : "opacity-100"
            }`}
            style={{ flexGrow: LIMIT - total }}
          />
        </div>

        <ul className="sr-only">
          {BAR_ORDER.map((kind) => (
            <li key={kind.id}>
              {kind.name}: {formatTokens(values[kind.id])} of {LIMIT}K
            </li>
          ))}
          <li>
            Unused: {formatTokens(LIMIT - total)} of {LIMIT}K
          </li>
        </ul>

        <div
          className="mt-4 flex flex-wrap gap-1.5"
          onPointerLeave={() => setActive(null)}
        >
          {CHIP_ORDER.map((kind) => (
            <button
              key={kind.id}
              type="button"
              className={`ctx-chip inline-flex h-8 cursor-default items-center gap-2 rounded-full px-3 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0e0f11] ${
                active === kind.id
                  ? "[scale:0.975] bg-black/[0.12] dark:bg-white/[0.12]"
                  : "bg-black/[0.06] dark:bg-white/[0.06]"
              }`}
              onPointerEnter={() => focusKind(kind.id)}
              onFocus={() => focusKind(kind.id)}
              onBlur={() => setActive(null)}
            >
              <i
                aria-hidden="true"
                className={`block h-2 w-2 rounded-[2px] ${KIND_COLOUR[kind.id]}`}
              />
              {kind.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
