import extraHighImage from "./assets/extra-high.webp";
import highImage from "./assets/high.webp";
import lowImage from "./assets/low.webp";
import mediumImage from "./assets/medium.webp";

export const LEVELS = [
  { label: "Low", image: lowImage },
  { label: "Medium", image: mediumImage },
  { label: "High", image: highImage },
  { label: "Extra high", image: extraHighImage },
] as const;

export const LEVEL_COUNT = LEVELS.length;
export const DEFAULT_LEVEL = 1;

/* Source geometry: h-8 track, a 48 px preview bubble, 9 ticks, a 28 px
   overshoot ceiling, a 55 px tilt ceiling, and the last level's fill
   threshold. */
export const TICKS = 9;
export const TRACK_HEIGHT = 32;
export const BUBBLE_WIDTH = 48;
export const PREVIEW_HEIGHT = 84;
export const MAX_OVERSCROLL = 28;
export const MAX_TILT = 55;
export const LAST_LEVEL = 0.985;
export const KEY_HINT_MS = 900;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const levelAt = (position: number) =>
  Math.min(LEVEL_COUNT - 1, Math.max(0, Math.floor(position * LEVEL_COUNT)));

export const centerOf = (index: number) => (index + 0.5) / LEVEL_COUNT;

/** Overshoot decays toward its 28 px ceiling, so the track never drifts away. */
export const overshootFor = (distance: number) =>
  MAX_OVERSCROLL * (1 - 1 / ((distance * 0.55) / MAX_OVERSCROLL + 1));
