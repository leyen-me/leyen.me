/*
 * Bencho's "Time scrubber" constants, unchanged: 2 px per minute, a 132 px
 * half-window for the dial falloff, ticks every 5 minutes, and a 1440 minute
 * wrap-around day. The block's defaults are step 15, momentum 50, 12h.
 */
export const MINUTES_PER_DAY = 1440;
export const PX_PER_MINUTE = 2;
export const HALF_WINDOW_PX = 132;
export const TICK_MINUTES = 5;
export const VISIBLE_RADIUS_MINUTES = 76;

export const DEFAULT_START_MINUTES = 570; // 9:30 AM
export const STEP_MINUTES = 15;
export const MOMENTUM = 50;

export const SPRING_STIFFNESS = 0.022;
export const SPRING_DAMPING = 0.26;
export const CARRY_BASE = 6;
export const CARRY_RANGE = 30;
export const MAX_FLICK = 14;
export const RELEASE_STALE_MS = 80;
export const WHEEL_SETTLE_MS = 120;

export const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

export type TickKind = "five" | "quarter" | "hour";

export type Tick = {
  minute: number;
  /** Offset from the center marker, in px. */
  x: number;
  /** 1 at the center, 0 at the edge of the dial window. */
  fade: number;
  kind: TickKind;
  hour: number;
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function wrapMinutes(value: number) {
  return ((value % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

export function formatTime(value: number, use24Hour = false) {
  const wrapped = wrapMinutes(Math.round(value));
  const hours = Math.floor(wrapped / 60);
  const minutes = String(wrapped % 60).padStart(2, "0");

  if (use24Hour) {
    return { time: `${String(hours).padStart(2, "0")}:${minutes}`, meridiem: "" };
  }

  return {
    time: `${hours % 12 || 12}:${minutes}`,
    meridiem: hours < 12 ? "AM" : "PM",
  };
}

export function formatHourLabel(hour: number, use24Hour = false) {
  if (use24Hour) return String(hour).padStart(2, "0");
  return `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`;
}

export function buildTicks(position: number): Tick[] {
  const ticks: Tick[] = [];
  const start =
    Math.ceil((position - VISIBLE_RADIUS_MINUTES) / TICK_MINUTES) * TICK_MINUTES;
  const end = position + VISIBLE_RADIUS_MINUTES;

  for (let minute = start; minute <= end; minute += TICK_MINUTES) {
    const x = (minute - position) * PX_PER_MINUTE;
    const fade = clamp(1 - (Math.abs(x) / HALF_WINDOW_PX) ** 2, 0, 1);
    const wrapped = wrapMinutes(minute);
    const kind: TickKind =
      wrapped % 60 === 0 ? "hour" : wrapped % 15 === 0 ? "quarter" : "five";

    ticks.push({ minute, x, fade, kind, hour: Math.floor(wrapped / 60) });
  }

  return ticks;
}
