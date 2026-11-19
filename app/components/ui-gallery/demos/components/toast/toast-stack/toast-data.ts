/**
 * Static data and geometry transcribed from Bencho's "Toast stack" block.
 *
 * Bencho lays the widget out at a fixed 300 px width with 64 px rows. The
 * source's own defaults are peek 14, gap 10 and corner 20; the catalog preview
 * may pass other values, but the block ships with these.
 */

export type ToastKind = "success" | "info" | "error" | "warning";

export type Toast = {
  id: number;
  kind: ToastKind;
  title: string;
  body: string;
  action?: string;
};

export const TOAST_WIDTH = 300;
export const TOAST_HEIGHT = 64;

/** Toasts kept in the stack; the third one's contents are never painted. */
export const SHOWN = 3;

/** How much of each tucked toast shows below the front one. */
export const PEEK = 14;

/** Space between rows once the stack fans out. */
export const GAP = 10;

/** Corner radius, exposed to the block as `--tst-r`. */
export const CORNER = 20;

/**
 * Bencho's single shared spring: stiffness 380, damping 34, mass 1. The catalog
 * copy shows 320 / 30, but the shipped component is the source of truth.
 */
export const SPRING = {
  type: "spring",
  stiffness: 380,
  damping: 34,
  mass: 1,
} as const;

/** Exit tween, 220 ms with an ease-in curve. */
export const EXIT_MS = 220;

/** Closed-stack container height: 3 × 64 + 2 × 10. */
export const STACK_HEIGHT = SHOWN * TOAST_HEIGHT + 2 * GAP;

/** Front toast plus the peeks behind it. */
const CLOSED_HEIGHT = TOAST_HEIGHT + 2 * PEEK;

export const PRESETS: readonly Omit<Toast, "id">[] = [
  {
    kind: "error",
    title: "Payment declined",
    body: "Try another card.",
    action: "Retry",
  },
  {
    kind: "info",
    title: "Kai joined your bench",
    body: "They can comment and copy.",
  },
  {
    kind: "success",
    title: "brand-kit.zip uploaded",
    body: "Saved to Launch week.",
  },
  {
    kind: "warning",
    title: "Storage is 92% full",
    body: "Exports pause at the limit.",
  },
  {
    kind: "success",
    title: "Block saved",
    body: "Swipe deck is in Favourites.",
  },
];

export type Pose = { y: number; scale: number };

/** Tucked: depth 0 is front, capped at 2 so extra rows share the back slot. */
export function closedPose(depth: number): Pose {
  const capped = Math.min(depth, SHOWN - 1);
  return {
    y: (STACK_HEIGHT - CLOSED_HEIGHT) / 2 + (SHOWN - 1 - capped) * PEEK,
    scale: 1 - capped * 0.05,
  };
}

/** Fanned out: every row sits at full size, the front one lowest. */
export function openPose(depth: number): Pose {
  return {
    y: (SHOWN - 1 - depth) * (TOAST_HEIGHT + GAP),
    scale: 1,
  };
}
