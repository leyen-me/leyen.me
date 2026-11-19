/**
 * Two cues from Bencho's shared sound kit, synthesised locally so the demo
 * stays offline and dependency-free. The original recipes are:
 *
 *   click: 196 → 130 Hz, 150 ms, sine, gain .07, low-pass 900 Hz
 *   lift:  660 → 720 Hz,  38 ms, sine, gain .028
 */
type Cue = "click" | "lift";

type Part = {
  hz: number;
  to?: number;
  ms: number;
  gain: number;
  cut?: number;
  atk?: number;
};

const RECIPES: Record<Cue, Part[]> = {
  click: [{ hz: 196, to: 130, ms: 150, gain: 0.07, cut: 900 }],
  lift: [{ hz: 660, to: 720, ms: 38, gain: 0.028 }],
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

  const start = ctx.currentTime + 0.001;
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

export function cue(kind: Cue) {
  for (const part of RECIPES[kind]) play(part);
}
