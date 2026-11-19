/**
 * Math and data for the Pull to refresh card.
 *
 * Ported 1:1 from Bencho's Elastic chunk: three fixed balance series, the
 * monotone-cubic chart used to draw them, the rubber-band pull curve and the
 * time-window metadata. Kept out of the component so the interaction file
 * stays readable.
 */

/** Pull resistance default, 0–100. Converts to a 510px asymptote at 50. */
export const RESISTANCE = 50;
/** Distance the gesture must travel before release arms the refresh. */
export const THRESHOLD = 58;
/** How far the bottom of the card can stretch, in px. */
export const STRETCH = 110;
/** Base bottom padding, in px, also used as the resting stretch. */
export const BASE_GROW = 8;
/** How long the fake refresh works before the data changes. */
export const REFRESH_MS = 1150;
/** Cross-fade duration when the chart swaps series. */
export const BLEND_MS = 420;
/** Number of droplets in the refresh ring. */
export const DOTS = 6;

export type WindowId = "1h" | "4h" | "1d";

export type TimeWindow = {
  id: WindowId;
  label: string;
  /** How many points from the end of the series this window shows. */
  take: number;
  span: string;
};

export const WINDOWS: readonly TimeWindow[] = [
  { id: "1h", label: "1H", take: 5, span: "past hour" },
  { id: "4h", label: "4H", take: 17, span: "past 4 hours" },
  { id: "1d", label: "1D", take: 34, span: "today" },
];

/** Balances in GBP, oldest first. */
export const SERIES: readonly (readonly number[])[] = [
  [
    57630.15, 57672.02, 57697.31, 57740.67, 57829.15, 57881.9, 57875.25,
    57871.44, 57841.43, 57824.68, 57957.03, 58078.61, 58095.22, 58136.25,
    58156.95, 58113.65, 58180.3, 58394.72, 58518.55, 58536.23, 58450.89,
    58354.12, 58489.6, 58573.06, 58508.69, 58536.64, 58594.77, 58647.64,
    58668.57, 58682.61, 58720.06, 58743.78, 58784.11, 58834.75,
  ],
  [
    58834.75, 58842.84, 58858.72, 58877.48, 58874.75, 58872.61, 58896.56,
    58906.48, 58893.08, 58922.63, 58981.41, 58963.18, 58940.77, 59001.24,
    59035.63, 59026.34, 59052.16, 59073.47, 59033.25, 59010.92, 58996.54,
    58935.27, 58911.5, 58975.07, 59037.9, 59022.02, 59004.8, 59038.44,
    59055.78, 59056.52, 59072.15, 59078.52, 59088.28, 59102.4,
  ],
  [
    59102.4, 59086.9, 59077.06, 59068.52, 59055.95, 59019.04, 58999.47,
    58975.1, 58903.86, 58916.98, 58989.57, 58926.11, 58763.26, 58683.68,
    58727.54, 58778, 58758.83, 58718.66, 58682.76, 58709.66, 58792.35,
    58782.87, 58692.33, 58598.58, 58598.77, 58672.38, 58655.19, 58615.97,
    58621.85, 58624.03, 58595.53, 58549.14, 58523.68, 58516.05,
  ],
];

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Bencho's rubber band: saturating, so late pixels cost more than early ones. */
export function drawPull(raw: number, resistance = RESISTANCE) {
  const asymptote = 700 - (resistance / 100) * 380;
  return (asymptote * raw) / (asymptote + raw);
}

function formatAmount(value: number) {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** `["$58,834", ".75"]`, so the pence can be dimmed. */
export function splitMoney(value: number): [string, string] {
  const text = formatAmount(value);
  const dot = text.lastIndexOf(".");
  return [text.slice(0, dot), text.slice(dot)];
}

export function formatChange(value: number) {
  return (value < 0 ? "\u2212" : "+") + formatAmount(Math.abs(value));
}

/** Clock label for a scrub position, matching the source's 9:00–17:30 range. */
export function scrubTime(index: number, total: number) {
  const seconds = Math.round(540 + (510 * index) / Math.max(1, total - 1));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60
  ).padStart(2, "0")}`;
}

export type Point = { x: number; y: number };

type Segment = { p1: Point; p2: Point; c1: Point; c2: Point };

function segments(points: Point[]): Segment[] {
  return points.slice(0, -1).map((point, index) => {
    const previous = points[index - 1] ?? point;
    const next = points[index + 1];
    const after = points[index + 2] ?? next;
    return {
      p1: point,
      p2: next,
      c1: {
        x: point.x + (next.x - previous.x) / 6,
        y: point.y + (next.y - previous.y) / 6,
      },
      c2: {
        x: next.x - (after.x - point.x) / 6,
        y: next.y - (after.y - point.y) / 6,
      },
    };
  });
}

export function pathFrom(points: Point[]) {
  let d = `M${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (const segment of segments(points)) {
    d += ` C${segment.c1.x.toFixed(2)} ${segment.c1.y.toFixed(2)} ${segment.c2.x.toFixed(
      2
    )} ${segment.c2.y.toFixed(2)} ${segment.p2.x.toFixed(2)} ${segment.p2.y.toFixed(
      2
    )}`;
  }
  return d;
}

export type Plot = {
  d: string;
  points: Point[];
  at: (index: number) => Point;
};

/**
 * Normalises a series into a 100×40 viewBox and builds a smooth path. The
 * curve needs no zoom correction because it is sampled in the plot's own units.
 */
export function plot(values: readonly number[], height = 40, pad = 4): Plot {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values.map((value, index) => ({
    x: (index / (values.length - 1)) * 100,
    y: height - pad - ((value - min) / (max - min || 1)) * (height - pad * 2),
  }));
  const allSegments = segments(points);

  return {
    d: pathFrom(points),
    points,
    at: (index: number) => {
      const i = clamp(Math.floor(index), 0, allSegments.length - 1);
      const segment = allSegments[i];
      const t = clamp(index - i, 0, 1);
      const u = 1 - t;
      return {
        x:
          u ** 3 * segment.p1.x +
          3 * u * u * t * segment.c1.x +
          3 * u * t * t * segment.c2.x +
          t ** 3 * segment.p2.x,
        y:
          u ** 3 * segment.p1.y +
          3 * u * u * t * segment.c1.y +
          3 * u * t * t * segment.c2.y +
          t ** 3 * segment.p2.y,
      };
    },
  };
}

/** 48 samples along the curve, used to interpolate between two windows. */
export const SAMPLE_COUNT = 48;

export function sample(plotValue: Plot, count = SAMPLE_COUNT): Point[] {
  const last = plotValue.points.length - 1;
  return Array.from({ length: count }, (_, index) =>
    plotValue.at((index / (count - 1)) * last)
  );
}

export function sliceSeries(seriesIndex: number, windowIndex: number) {
  const series = SERIES[seriesIndex % SERIES.length];
  return series.slice(Math.max(0, series.length - WINDOWS[windowIndex].take));
}

export function easeOutQuart(t: number) {
  return 1 - (1 - t) ** 4;
}
