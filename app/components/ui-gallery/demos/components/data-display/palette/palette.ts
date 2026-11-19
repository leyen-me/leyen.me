/**
 * Bencho's colour engine, ported from `Palette-roV_DbXN.js`.
 *
 * Colours are picked in OKLCH, where equal lightness steps look equal across
 * hues, and only converted to hex at the end. Each press chooses one of five
 * moods and moves the base hue at least 60° from the previous set.
 */

export type Mood = "ramp" | "spread" | "pair" | "triad" | "accent";

export type PaletteState = {
  /** Hue the previous palette was built from. */
  hue: number;
  /** Previous mood, so two presses never repeat it. */
  mood: Mood | null;
};

export type PaletteResult = {
  colors: string[];
  state: PaletteState;
};

const MOODS: readonly Mood[] = ["ramp", "spread", "pair", "triad", "accent"];

/** Source defaults: four colours, 14 px corner, morph 50. */
export const DEFAULT_COUNT = 4;
export const DEFAULT_CORNER = 14;
export const DEFAULT_MORPH = 50;

const MIN_CHROMA = 0.01;
const CHROMA_STEP = 0.004;
const GAMUT_EPSILON = 0.0005;

const wrapHue = (hue: number) => ((hue % 360) + 360) % 360;
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const range = (random: () => number, min: number, max: number) =>
  min + random() * (max - min);

/** `d()` in the source: OKLCH → linear sRGB → gamma → hex. */
export function oklchToHex(lightness: number, chroma: number, hue: number) {
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);

  const lRoot = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = lightness - 0.0894841775 * a - 1.291485548 * b;

  const l = lRoot ** 3;
  const m = mRoot ** 3;
  const s = sRoot ** 3;

  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  return `#${linear
    .map((channel) => {
      const encoded =
        channel <= 0.0031308
          ? 12.92 * channel
          : 1.055 * Math.abs(channel) ** (1 / 2.4) - 0.055;
      return Math.round(Math.min(1, Math.max(0, encoded)) * 255)
        .toString(16)
        .padStart(2, "0");
    })
    .join("")}`;
}

/** `f()` in the source: is the linear colour inside sRGB? */
function inGamut(lightness: number, chroma: number, hue: number) {
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);

  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const red = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const green = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const blue = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return [red, green, blue].every(
    (channel) => channel >= -GAMUT_EPSILON && channel <= 1 + GAMUT_EPSILON,
  );
}

/**
 * `p()` in the source: ask for as much chroma as sRGB can show, then pull it
 * back 0.004 at a time. Clipping channels instead would bend the hue.
 */
function hexFromOklch(lightness: number, chroma: number, hue: number) {
  let safeChroma = chroma;
  while (safeChroma > MIN_CHROMA && !inGamut(lightness, safeChroma, hue)) {
    safeChroma -= CHROMA_STEP;
  }
  return oklchToHex(lightness, safeChroma, hue);
}

/**
 * `y()` in the source: build the lightness/chroma/hue triples for one of the
 * five moods, sort them bright to dark, keep yellow out of the olive zone, and
 * convert.
 */
export function generatePalette(
  count: number,
  random: () => number,
  previous: PaletteState,
): PaletteResult {
  const base = wrapHue(previous.hue + range(random, 60, 300));

  const moods = MOODS.filter((mood) => mood !== previous.mood);
  const mood = moods[Math.floor(random() * moods.length)];
  const direction = random() < 0.5 ? -1 : 1;

  const swatches: Array<[number, number, number]> = [];

  for (let index = 0; index < count; index += 1) {
    const position = count === 1 ? 0 : index / (count - 1);

    switch (mood) {
      case "ramp": {
        const step = range(random, 14, 26) * direction;
        swatches.push([
          0.9 - position * 0.48,
          0.12 + Math.sin(position * Math.PI) * 0.12,
          base + index * step,
        ]);
        break;
      }
      case "spread": {
        const step = range(random, 40, 70) * direction;
        swatches.push([range(random, 0.66, 0.8), 0.24, base + index * step]);
        break;
      }
      case "pair": {
        const alternate = index % 2 === 1;
        const second = index >= count / 2;
        swatches.push([
          second ? range(random, 0.46, 0.56) : range(random, 0.8, 0.88),
          0.22,
          base + (alternate ? range(random, 160, 190) : 0),
        ]);
        break;
      }
      case "triad": {
        swatches.push([
          range(random, 0.58, 0.82),
          0.22,
          base + (index % 3) * 120 * direction + range(random, -8, 8),
        ]);
        break;
      }
      default: {
        const accent = index === count - 1;
        swatches.push(
          accent
            ? [0.52, 0.26, base + 180 * direction]
            : [range(random, 0.8, 0.87), 0.18, base + index * 18 * direction],
        );
      }
    }
  }

  swatches.sort((a, b) => b[0] - a[0]);

  for (const swatch of swatches) {
    const hue = wrapHue(swatch[2]);
    // A deep yellow reads olive; the source lifts it back into yellow.
    if (hue > 60 && hue < 120 && swatch[0] < 0.62) {
      swatch[0] = 0.62 + (0.62 - swatch[0]) * 0.2;
    }
  }

  return {
    colors: swatches.map(([lightness, chroma, hue]) =>
      hexFromOklch(lightness, chroma, wrapHue(hue)),
    ),
    state: { hue: base, mood },
  };
}

/** Deterministic PRNG so the first paint is identical on the server and client. */
function mulberry32(seed: number) {
  let value = seed;
  return () => {
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const INITIAL_PALETTE = generatePalette(
  DEFAULT_COUNT,
  mulberry32(0x5eed),
  { hue: 0, mood: null },
);

/** Geometry of the bar and the circular swell. */
export const PALETTE_WIDTH = 300;
export const SLAB_PADDING = 10;
export const SLAB_GAP = 6;
export const BAR_WIDTH = 224;
export const BAR_HEIGHT = 58;
export const SEGMENT_GAP = 4;
export const SWELL_POINT = 0.4;
export const MORPH_MS = 760;

export function cornerRadius(corner: number) {
  const bounded = Math.min(BAR_HEIGHT / 2, Math.max(0, corner));
  return {
    segment: bounded,
    slab: bounded + SLAB_PADDING * Math.min(1, bounded / DEFAULT_CORNER),
  };
}

/** Segment width; four 4 px gaps split the 224 px bar. */
export function segmentWidth(count: number) {
  return (BAR_WIDTH - SEGMENT_GAP * (count - 1)) / count;
}

/**
 * `j()` in the source: rise into a circle by 40% of the timeline, then ease
 * back out. 0 at rest, 1 at the widest point.
 */
export function swellOf(progress: number) {
  const point = SWELL_POINT;
  if (progress <= 0) return 0;
  if (progress < point) return 1 - (1 - progress / point) ** 3;

  const tail = (progress - point) / 0.6 - 1;
  return 1 - (1 + 2.7 * tail ** 3 + 1.7 * tail ** 2);
}

/** Duration follows the block's `Morph` parameter: 760 ms at 50. */
export function morphDuration(morph: number) {
  return MORPH_MS * lerp(1.6, 0.4, Math.min(100, Math.max(0, morph)) / 100);
}

export { lerp };
