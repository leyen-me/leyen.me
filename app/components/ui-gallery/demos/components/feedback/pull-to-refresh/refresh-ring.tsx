import type { CSSProperties } from "react";
import { DOTS } from "./engine";

type Props = {
  phase: "idle" | "hold" | "work";
  progress: number;
  reduced: boolean;
};

const SIZE = 60;
const TOP = 30;

/**
 * Six droplets scattered at rest are drawn into one ring as the pull nears
 * the threshold. While the refresh works the whole box rotates, so the DOM
 * never re-measures a moving rect.
 */
export function RefreshRing({ phase, progress, reduced }: Props) {
  const radius = phase === "work" ? 12 : 12 + 3 - progress * 3;
  const turn = phase === "work" ? 0 : progress * 220;

  const style = {
    width: SIZE,
    height: SIZE,
    marginLeft: -SIZE / 2,
    marginTop: -TOP,
    opacity: phase === "work" ? 1 : progress,
    transform: `scale(${(phase === "work" ? 1 : 0.82 + progress * 0.18).toFixed(
      4
    )})`,
    animation:
      phase === "work" && !reduced
        ? "ptr-spin 3s linear infinite"
        : undefined,
  } as CSSProperties;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-[30px] z-[1] grid place-items-center"
      style={style}
    >
      {Array.from({ length: DOTS }, (_, index) => {
        const angle = (((index / DOTS) * 360 + turn) * Math.PI) / 180;
        return (
          <span
            key={index}
            className="col-start-1 row-start-1 h-1 w-1 rounded-full bg-[#17181a]/[0.32] dark:bg-white/[0.32]"
            style={{
              transform: `translate(${(Math.sin(angle) * radius).toFixed(
                2
              )}px, ${(-Math.cos(angle) * radius).toFixed(2)}px)`,
            }}
          />
        );
      })}
    </div>
  );
}
