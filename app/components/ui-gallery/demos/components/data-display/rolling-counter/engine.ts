/**
 * Constants and the per-place spring model for Bencho's "Rolling counter".
 *
 * Each column owns its own spring plus two queues: `due` holds the moment a
 * new target becomes valid and `next` the target itself. That is what makes a
 * carry ripple up the number instead of moving all five columns at once.
 */

/** Five columns: ones through ten-thousands. */
export const PLACES = 5;
export const MAX_VALUE = 10 ** PLACES - 1;
/** Height of one digit in the odometer strip. */
export const CELL = 46;
/** Pixels of vertical drag per step. */
export const DRAG_STEP = 12;
/** The block's outer padding; the buttons' radius is the corner minus this. */
export const PADDING = 5;
/** Outer height of the slab; a corner can never exceed half of it. */
export const SLAB_HEIGHT = CELL + PADDING * 2;
export const MAX_CORNER = SLAB_HEIGHT / 2;
export const DEFAULT_START = 95;

export const DEFAULTS = {
  bounce: 45,
  stagger: 45,
  blur: 50,
  corner: 16,
  start: DEFAULT_START,
} as const;

export type Digit = {
  /** Continuous position in digit steps; the strip shows `pos % 10`. */
  pos: number;
  vel: number;
  target: number;
  due: number[];
  next: number[];
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Bencho maps the 0–100 bounce slider onto this k/d pair. */
export function springFor(bounce: number) {
  return { k: 0.08 + (bounce / 100) * 0.16, d: 0.62 + (bounce / 100) * 0.2 };
}

export function createDigits(start: number): Digit[] {
  return Array.from({ length: PLACES }, (_, place) => {
    const target = Math.floor(start / 10 ** place);
    return { pos: target, vel: 0, target, due: [], next: [] };
  });
}

/** 0–9 offset for the strip at rest, used for the first server render. */
export function initialOffset(start: number, place: number) {
  return ((Math.floor(start / 10 ** place) % 10) + 10) % 10;
}
