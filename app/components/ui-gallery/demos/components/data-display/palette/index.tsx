"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  BAR_HEIGHT,
  BAR_WIDTH,
  DEFAULT_CORNER,
  DEFAULT_COUNT,
  DEFAULT_MORPH,
  INITIAL_PALETTE,
  PALETTE_WIDTH,
  SEGMENT_GAP,
  SLAB_GAP,
  SLAB_PADDING,
  cornerRadius,
  generatePalette,
  lerp,
  morphDuration,
  segmentWidth,
  swellOf,
  type PaletteState,
} from "./palette";

/**
 * A 1:1 port of Bencho's "Palette" block.
 *
 * The cited asset is a colour-palette generator (not the command palette the
 * brief described): four OKLCH swatches share one bar, and pressing the arrow
 * picks a new mood and hue. During the 760 ms swap every swatch draws into a
 * circle, the colours change at the widest point (40%), then the circles spread
 * back into slots. A goo filter, driven by `sin(πt) · 5`, is zero at rest so it
 * can only bridge the gaps between colours, never smear a single one.
 *
 * The block's Web Audio cue and framer-motion timing are not ported; the same
 * ease is integrated locally. The initial palette is seeded so SSR and the
 * client agree, and reduced motion swaps instantly.
 */
export default function Palette() {
  const reduced = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const filterId = `pal-goo-${uid}`;

  const [colors, setColors] = useState<string[]>(INITIAL_PALETTE.colors);
  const [incoming, setIncoming] = useState<string[] | null>(null);
  const [progress, setProgress] = useState(0);
  const [turns, setTurns] = useState(0);
  const [announcement, setAnnouncement] = useState("");

  const state = useRef<PaletteState>(INITIAL_PALETTE.state);
  const frame = useRef(0);

  useEffect(
    () => () => {
      if (frame.current) window.cancelAnimationFrame(frame.current);
      frame.current = 0;
    },
    [],
  );

  const regenerate = useCallback(() => {
    if (frame.current) return;

    setTurns((value) => value + 1);

    const next = generatePalette(DEFAULT_COUNT, Math.random, state.current);
    state.current = next.state;

    const announce = () => {
      setAnnouncement(`New palette: ${next.colors.join(", ")}.`);
    };

    if (reduced) {
      setColors(next.colors);
      setIncoming(null);
      setProgress(0);
      announce();
      return;
    }

    setIncoming(next.colors);
    setProgress(0);

    const duration = morphDuration(DEFAULT_MORPH);
    const start = performance.now();

    const tick = (time: number) => {
      const value = Math.min(1, (time - start) / duration);
      setProgress(value);

      if (value < 1) {
        frame.current = window.requestAnimationFrame(tick);
        return;
      }

      frame.current = 0;
      setColors(next.colors);
      setIncoming(null);
      setProgress(0);
      announce();
    };

    frame.current = window.requestAnimationFrame(tick);
  }, [reduced]);

  const corner = cornerRadius(DEFAULT_CORNER);
  const slot = segmentWidth(colors.length);
  const pitch = slot + SEGMENT_GAP;

  const swell = swellOf(progress);
  // Segments stop at their resting size if the tail dips below zero; the slab
  // keeps the raw value, so it overshoots by the source's 3.5% fraction.
  const draw = Math.max(0, swell);
  const heat = Math.sin(Math.PI * progress) * 5;

  const shown = incoming && progress >= 0.4 ? incoming : colors;

  return (
    <div className="flex w-full justify-center py-2">
      <svg
        aria-hidden="true"
        focusable="false"
        width="0"
        height="0"
        className="absolute h-0 w-0 overflow-hidden"
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
              stdDeviation={heat}
              result="smear"
            />
            <feColorMatrix
              in="smear"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -13"
            />
          </filter>
        </defs>
      </svg>

      <div
        className="flex items-stretch"
        style={{ width: PALETTE_WIDTH, gap: SLAB_GAP }}
      >
        <div
          className="flex flex-1 items-center justify-center bg-surface-0"
          style={{
            padding: SLAB_PADDING,
            borderRadius: corner.slab,
            scale: 1 - 0.035 * swell,
          }}
        >
          <div
            role="img"
            aria-label={`Palette: ${shown.join(", ")}`}
            className="relative shrink-0"
            style={{ width: BAR_WIDTH, height: BAR_HEIGHT }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ filter: `url(#${filterId})` }}
            >
              {shown.map((color, index) => {
                const width = lerp(slot, BAR_HEIGHT * 0.66, draw);
                const height = lerp(BAR_HEIGHT, BAR_HEIGHT * 0.66, draw);
                const radius = lerp(corner.segment, height / 2, draw);

                return (
                  <span
                    key={`${index}-${color}`}
                    className="absolute left-0"
                    style={{
                      top: (BAR_HEIGHT - height) / 2,
                      width,
                      height,
                      borderRadius: radius,
                      background: color,
                      transform: `translateX(${(
                        index * pitch +
                        (slot - width) / 2
                      ).toFixed(2)}px)`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="group flex-none">
          <div
            className="h-full bg-surface-0 transition-transform duration-[160ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-active:scale-[0.96] motion-reduce:transition-none"
            style={{
              padding: SLAB_PADDING,
              borderRadius: corner.slab,
            }}
          >
            <button
              type="button"
              onClick={regenerate}
              aria-label="Generate a new palette"
              className="relative grid h-[58px] w-[30px] flex-none cursor-pointer place-items-center rounded-item bg-transparent text-[#3c3b37] transition-colors duration-[160ms] after:absolute after:inset-y-0 after:-left-px after:-right-px after:content-[''] hover:text-[#7f8081] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 motion-reduce:transition-none dark:text-white dark:hover:text-[#9d9d9d] dark:focus-visible:ring-white/45"
            >
              <RefreshIcon
                style={{
                  rotate: `${turns * 180}deg`,
                  transitionProperty: "rotate",
                  transitionDuration: reduced ? "0ms" : "600ms",
                  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
            </button>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  );
}

function RefreshIcon({ style }: { style?: CSSProperties }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

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
