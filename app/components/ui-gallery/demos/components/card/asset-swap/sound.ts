/**
 * Bencho's three cues, re-voiced with Web Audio.
 *
 * `expand` opens the picker (two low sines), `pop` confirms a pick (a short
 * upward blip) and `swoop` turns the pair (a falling sine). Gains, durations,
 * filter cutoffs and attack times are the source values; the AudioContext is
 * only created from a real gesture, so nothing runs during render.
 */

type CueName = "expand" | "pop" | "swoop";

type Part = {
  hz: number;
  to?: number;
  ms: number;
  gain: number;
  wave?: OscillatorType;
  cut?: number;
  atk: number;
  /** Offset from the start of the cue, in ms. */
  at?: number;
};

const CUES: Record<CueName, Part[]> = {
  expand: [
    { hz: 196, to: 174, ms: 360, gain: 0.042, wave: "sine", cut: 880, atk: 36 },
    {
      hz: 294,
      to: 262,
      ms: 300,
      gain: 0.014,
      wave: "sine",
      cut: 1100,
      atk: 48,
      at: 24,
    },
  ],
  pop: [{ hz: 680, to: 930, ms: 34, gain: 0.05, wave: "sine", atk: 3 }],
  swoop: [
    { hz: 214, to: 124, ms: 241, gain: 0.065, wave: "sine", cut: 560, atk: 90 },
  ],
};

let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (context) return context;

  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;

  try {
    context = new Ctor();
  } catch {
    return null;
  }
  return context;
}

function emit(ctx: AudioContext, part: Part) {
  const start = ctx.currentTime + (part.at ?? 0) / 1000;
  const end = start + part.ms / 1000;
  const attack = Math.min(part.atk / 1000, (part.ms / 1000) * 0.6);

  const oscillator = ctx.createOscillator();
  oscillator.type = part.wave ?? "sine";
  oscillator.frequency.setValueAtTime(part.hz, start);
  if (part.to) oscillator.frequency.exponentialRampToValueAtTime(part.to, end);

  let tail: AudioNode = oscillator;
  if (part.cut) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = part.cut;
    tail.connect(filter);
    tail = filter;
  }

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(1e-4, start);
  gain.gain.exponentialRampToValueAtTime(part.gain, start + attack);
  gain.gain.exponentialRampToValueAtTime(1e-4, end);

  tail.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(start);
  oscillator.stop(end + 0.02);
}

export function playCue(name: CueName) {
  const ctx = getContext();
  if (!ctx) return;

  // Safari can hand back a suspended context inside a gesture; scheduling at
  // the frozen clock starts the cue as soon as it resumes.
  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  for (const part of CUES[name]) emit(ctx, part);
}
