/**
 * Geometry and motion primitives for the Step player port.
 *
 * These mirror Bencho's inline `jt` block exactly: every dot is a pill whose
 * two edges live in their own spring/tween, and the slot width alone decides
 * which dot reads as the current step. Values are hard-coded from the catalog
 * chunk (DOT 8, ACTIVE 36, GAP 8, PAD 14, TOOL 36).
 */

export const DOT = 8;
export const ACTIVE = 36;
export const GAP = 8;
export const PAD = 14;
export const TOOL = 36;

/** Edge ease-out duration, in milliseconds. */
export const EASE = 520;
/** Delay before the wake starts, in milliseconds. */
export const DELAY = 60;
/** One ripple pulse, in milliseconds. */
export const WAVE = 300;

/** x'' = -k(x - target) - d x' with the block's own damping. */
export const SPRING = {
  k: 0.16,
  d: 1 - 2 * Math.sqrt(0.16),
};

export const DEFAULT_STEPS = 5;
export const DEFAULT_PACE = 3;
export const DEFAULT_WAKE = 100;

export const MIN_STEPS = 3;
export const MAX_STEPS = 8;

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function mix(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

export function easeOut(t: number) {
  return 1 - (1 - t) ** 3;
}

export function easeInOut(t: number) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

export type Edge = {
  x: number;
  v: number;
  tw?: { from: number; to: number; t0: number };
};

export type Dot = {
  l: Edge;
  r: Edge;
  ink: number;
};

export type Wave = {
  t0: number;
  origin: number;
  from: number;
};

export type WakeConfig = {
  amp: number;
  reach: number;
  self: number;
  stagger: number;
};

/**
 * Slot rectangles for `n` dots with `active` holding the wide slot.
 * The track width is constant because only one slot is ever wide.
 */
export function slotRects(n: number, active: number): Array<[number, number]> {
  const rects: Array<[number, number]> = [];
  let x = 0;
  for (let i = 0; i < n; i += 1) {
    const width = i === active ? ACTIVE : DOT;
    rects.push([x, x + width]);
    x += width + GAP;
  }
  return rects;
}

export function createDots(n: number, active: number): Dot[] {
  return slotRects(n, active).map(([left, right], i) => ({
    l: { x: left, v: 0 },
    r: { x: right, v: 0 },
    ink: i < active ? 1 : 0,
  }));
}

/** Wake knobs for a 0..1 amount: amplitude, reach, landing squash and stagger. */
export function wakeConfig(amount: number): WakeConfig {
  return {
    amp: mix(0.26, 0.34, amount),
    reach: 1 + Math.round(amount * 7),
    self: mix(-0.7, 0.3, amount),
    stagger: mix(70, 55, amount),
  };
}

/**
 * The wave is a travelling sine. Dots between the old and new step stand up in
 * the order they were crossed; the landing dot answers after the last one.
 */
export function edgeTransform(
  dot: Dot,
  index: number,
  wave: Wave | null,
  config: WakeConfig,
  now: number
) {
  let scale = 1;

  if (wave) {
    const span = Math.abs(wave.origin - wave.from);
    const flat = Math.max(0, span - config.reach);
    const lo = Math.min(wave.from, wave.origin);
    const hi = Math.max(wave.from, wave.origin);

    let delay = -1;
    let self = 1;

    if (index === wave.origin) {
      delay = Math.min(span, config.reach) * config.stagger;
      self = config.self;
    } else if (index >= lo && index <= hi) {
      const distance = Math.abs(index - wave.from);
      if (span - distance <= config.reach) {
        delay = (distance - flat) * config.stagger;
      }
    }

    if (delay >= 0) {
      const u = (now - wave.t0 - DELAY - delay) / WAVE;
      if (u > 0 && u < 1) {
        scale = 1 + Math.sin(Math.PI * u) * config.amp * self;
      }
    }
  }

  return `translateX(${dot.l.x.toFixed(2)}px) scaleY(${scale.toFixed(3)})`;
}
