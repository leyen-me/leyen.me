/**
 * Geometry and motion shared by the OTP port, lifted from Bencho's
 * `Otp-BDyim0GA.js`:
 *
 *   p = 46   cell width     m = 56   row height
 *   ee = 9   gap            h = 164  capsule width
 *   l = 260  digit entrance  _ = 620  rejection shake
 *
 * The source ships 36 / 44 / 7 / 128; every value is scaled ~1.28x so the
 * four cells read at gallery size. Everything is expressed in plain numbers so
 * the render pass stays deterministic and SSR-safe.
 */

export const CELL = 46;
export const ROW_HEIGHT = 56;
export const GAP = 9;
export const PITCH = CELL + GAP;
export const CAPSULE = 164;
export const ENTER_MS = 260;
export const DENY_MS = 620;
export const DENY_SETTLE_MS = 820;

/** The success blob is a soft spring: k .075, d = 1 - .84 * sqrt(k). */
export const SUCCESS_SPRING = {
  k: 0.075,
  d: 1 - 0.84 * Math.sqrt(0.075),
};

/** The caret is a stiffer spring; the original inlines 0.2 / 0.62. */
export const CARET_SPRING = { k: 0.2, d: 0.62 };

export type Spring = { x: number; v: number };

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function mix(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

/** Hermite ease, `smoothstep(edge0, edge1, x)`. */
export function smooth(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function rowWidth(length: number) {
  return length * CELL + (length - 1) * GAP;
}

/** Where a cell rests when the row is complete, before fusing to the centre. */
export function cellX(index: number) {
  return index * PITCH;
}

export function fusedCellX(length: number) {
  return (rowWidth(length) - CELL) / 2;
}

/** The caret parks in the centre of the next empty cell, clamped to the last. */
export function caretX(codeLength: number, length: number) {
  return Math.min(codeLength, length - 1) * PITCH + CELL / 2;
}

/**
 * Advance a spring one animation frame and report whether it is still moving.
 * `epsilon` is the original's settle threshold (0.05 px for the caret,
 * 0.0008 for the success blob).
 */
export function stepSpring(
  spring: Spring,
  target: number,
  config: { k: number; d: number },
  rate: number,
  epsilon = 0.05,
) {
  spring.v += (target - spring.x) * config.k * rate;
  spring.v *= config.d ** rate;
  spring.x += spring.v * rate;

  if (Math.abs(target - spring.x) < epsilon && Math.abs(spring.v) < epsilon) {
    spring.x = target;
    spring.v = 0;
    return false;
  }

  return true;
}

/** Decaying sideways wave; the phase offset runs down the row. */
export function denyOffset(index: number, elapsed: number) {
  return (
    5 *
    Math.exp(-elapsed / 190) *
    Math.sin((elapsed / 1000) * Math.PI * 2 * 10 + index * 0.55)
  );
}

/** Digits drop out right to left, eight pixels each. */
export function denyFall(index: number, length: number, elapsed: number) {
  const t = smooth(0, 1, (elapsed - 300 - (length - 1 - index) * 45) / 220);
  return { shift: t * 8, opacity: 1 - t };
}

/** A freshly typed digit overshoots by 4% over 260 ms. */
export function arrivalScale(startedAt: number | undefined, now: number) {
  if (startedAt === undefined) return 1;
  const t = (now - startedAt) / ENTER_MS;
  return t > 0 && t < 1 ? 1 + 0.04 * Math.sin(Math.PI * t) : 1;
}

/** While checking, a 900 ms pulse travels across every box. */
export function checkScale(index: number, length: number, now: number) {
  const t = ((now % 900) / 900) * (length + 2) - index;
  return 1 - 0.07 * (t > 0 && t < 2 ? Math.sin((t / 2) * Math.PI) : 0);
}
