/**
 * The three cues Bencho's OTP block borrows from its shared sound kit,
 * synthesised locally so the demo stays offline:
 *
 *   deny:   208 → 165 Hz, 120 ms, sine, gain .030, low-pass 520 Hz
 *   perk:   330 Hz,       360 ms, sine, gain .053, low-pass 560 Hz
 *   expand: 196 → 174 Hz, 360 ms, gain .042 + 294 → 262 Hz, 300 ms, gain .014
 *
 * Nothing runs until a real interaction, so no autoplay policy violation.
 */
type Cue = "deny" | "perk" | "expand";

type Part = {
  hz: number;
  to?: number;
  ms: number;
  gain: number;
  cut?: number;
  atk?: number;
  at?: number;
};

const RECIPES: Record<Cue, Part[]> = {
  deny: [{ hz: 208, to: 165, ms: 120, gain: 0.03, cut: 520, atk: 10 }],
  perk: [{ hz: 330, ms: 360, gain: 0.053, cut: 560, atk: 90 }],
  expand: [
    { hz: 196, to: 174, ms: 360, gain: 0.042, cut: 880, atk: 36 },
    { hz: 294, to: 262, ms: 300, gain: 0.014, cut: 1100, atk: 48, at: 24 },
  ],
};

let context: AudioContext | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  try {
    context ??= new window.AudioContext();
    if (context.state !== "running") void context.resume();
    return context;
  } catch {
    return null;
  }
}

function play(part: Part) {
  const ctx = audio();
  if (!ctx || ctx.state !== "running") return;

  const start = ctx.currentTime + (part.at ?? 0) / 1000;
  const end = start + part.ms / 1000;
  const hold = start + Math.min((part.atk ?? 4) / 1000, (part.ms / 1000) * 0.6);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(part.hz, start);
  if (part.to) {
    osc.frequency.exponentialRampToValueAtTime(part.to, end);
  }

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(part.gain, hold);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  let tail: AudioNode = osc;
  if (part.cut) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = part.cut;
    tail.connect(filter);
    tail = filter;
  }

  tail.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(end + 0.02);
}

export function playOtpCue(kind: Cue) {
  for (const part of RECIPES[kind]) play(part);
}

/**
 * Bencho unlocks its audio context from the first trusted pointerdown /
 * keydown. We do the same on the first keystroke, so the delayed `perk` and
 * `deny` cues are allowed to start by the browser.
 */
export function unlockOtpAudio() {
  audio();
}
