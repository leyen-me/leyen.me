"use client";

import { useEffect, useRef, useState } from "react";

/** The microphone built from a capsule and two arcs, as in Bencho's source. */
export function MicIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="8.5"
        y="2"
        width="7"
        height="12.5"
        rx="3.5"
        fill="currentColor"
        stroke="none"
      />
      <path d="M5 11.5a7 7 0 0 0 14 0" />
      <path d="M12 18.5V22" />
    </svg>
  );
}

export function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/*
 * Bencho morphs the play triangle into a pause pair instead of swapping glyphs.
 * The two point sets are copied from the source; each frame interpolates the
 * eight coordinates and writes one path. `on` means the clip is playing.
 */
const PLAY = [
  [7, 4, 13, 7.6, 13, 16.4, 7, 20],
  [13, 7.6, 19, 12, 19, 12, 13, 16.4],
] as const;
const PAUSE = [
  [7, 5, 10.5, 5, 10.5, 19, 7, 19],
  [13.5, 5, 17, 5, 17, 19, 13.5, 19],
] as const;

function morphPath(t: number) {
  return PLAY.map((shape, index) => {
    const points = shape.map((value, point) =>
      (value + (PAUSE[index][point] - value) * t).toFixed(2),
    );
    return `M${points[0]} ${points[1]}L${points[2]} ${points[3]}L${points[4]} ${points[5]}L${points[6]} ${points[7]}Z`;
  }).join("");
}

export function PlayPauseIcon({
  playing,
  reduced,
}: {
  playing: boolean;
  reduced: boolean;
}) {
  const [t, setT] = useState(playing ? 1 : 0);
  const target = useRef(playing ? 1 : 0);
  target.current = playing ? 1 : 0;

  useEffect(() => {
    if (reduced) {
      setT(target.current);
      return;
    }

    const from = t;
    const to = target.current;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 220);
      setT(from + (to - from) * (1 - (1 - progress) ** 4));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // `t` is only the starting point of a new morph; re-running on every frame
    // would restart the ease. The target is read from the ref instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, reduced]);

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={morphPath(t)}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
