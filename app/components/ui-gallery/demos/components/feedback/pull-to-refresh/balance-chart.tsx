import type { PointerEvent as ReactPointerEvent } from "react";
import type { Point } from "./engine";

type Props = {
  path: string;
  shown: Point;
  scrub: number | null;
  up: boolean;
  onScrub: (event: ReactPointerEvent<HTMLSpanElement>) => void;
  onLeave: () => void;
};

/**
 * The plot is a scrub surface, not a chart library: the pointer reads a
 * fraction of the box, which is already in screen pixels, so the ratio holds
 * at any zoom. All motion is transform/opacity on the guide and tip.
 */
export function BalanceChart({ path, shown, scrub, up, onScrub, onLeave }: Props) {
  return (
    <span
      aria-hidden="true"
      data-scrub={scrub !== null || undefined}
      onPointerDown={onScrub}
      onPointerMove={onScrub}
      onPointerLeave={onLeave}
      className={`relative my-[22px] mb-[6px] block cursor-crosshair py-[6px] ${
        up ? "text-[#1f9d55]" : "text-[#e5484d] dark:text-[#ff7a4d]"
      }`}
    >
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="block h-[92px] w-full overflow-visible"
      >
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <i
        className={`pointer-events-none absolute bottom-[6px] top-[6px] -ml-px w-px bg-current transition-opacity duration-[160ms] motion-reduce:transition-none ${
          scrub !== null ? "opacity-[0.28]" : "opacity-0"
        }`}
        style={{ left: `${shown.x}%` }}
      />
      <i
        className={`pointer-events-none absolute -ml-[4.5px] -mt-[4.5px] h-[9px] w-[9px] rounded-full bg-surface-0 shadow-[0_0_0_2px_currentColor] transition-[scale] duration-[160ms] ease-[cubic-bezier(.24,1.34,.38,1)] motion-reduce:transition-none ${
          scrub !== null ? "scale-[1.18]" : "scale-100"
        }`}
        style={{
          left: `${shown.x}%`,
          top: `calc(6px + (100% - 12px) * ${(shown.y / 40).toFixed(4)})`,
        }}
      />
    </span>
  );
}
