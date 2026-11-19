/**
 * Bencho's `compact` and `restore` cues, synthesised locally so the demo stays
 * offline and dependency-free. The original recipes, including the noise
 * sweep, are reproduced part for part.
 */
type Cue = "compact" | "restore";

type Part = {
  hz: number;
  to?: number;
  ms: number;
  gain: number;
  wave?: OscillatorType;
  cut?: number;
  atk?: number;
  at?: number;
  glide?: number;
  q?: number;
  noise?: BiquadFilterType;
  lin?: boolean;
};

const RECIPES: Record<Cue, Part[]> = {
  compact: [
    {
      hz: 2200,
      to: 380,
      ms: 280,
      gain: 0.02,
      q: -3,
      noise: "lowpass",
      atk: 30,
      lin: true,
    },
    {
      hz: 440,
      to: 220,
      ms: 270,
      gain: 0.034,
      wave: "sine",
      cut: 1100,
      atk: 24,
    },
    {
      hz: 196,
      to: 150,
      ms: 110,
      gain: 0.06,
      wave: "triangle",
      cut: 900,
      atk: 2,
      glide: 18,
      at: 280,
    },
    {
      hz: 988,
      ms: 380,
      gain: 0.018,
      wave: "sine",
      cut: 2800,
      atk: 5,
      at: 300,
    },
  ],
  restore: [
    {
      hz: 420,
      to: 1800,
      ms: 260,
      gain: 0.016,
      q: -3,
      noise: "lowpass",
      atk: 40,
      lin: true,
    },
    {
      hz: 220,
      to: 392,
      ms: 250,
      gain: 0.03,
      wave: "sine",
      cut: 1100,
      atk: 30,
    },
    {
      hz: 262,
      ms: 90,
      gain: 0.04,
      wave: "triangle",
      cut: 1100,
      atk: 3,
      at: 270,
    },
  ],
};

let context: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
const lastPlayed: Record<Cue, number> = { compact: -Infinity, restore: -Infinity };

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

function noise(ctx: AudioContext) {
  if (noiseBuffer) return noiseBuffer;

  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buffer;
  return buffer;
}

function play(ctx: AudioContext, part: Part) {
  const start = ctx.currentTime + 0.001 + (part.at ?? 0) / 1000;
  const end = start + part.ms / 1000;
  const glideEnd = part.glide ? start + part.glide / 1000 : end;

  let source: AudioBufferSourceNode | OscillatorNode;
  let tail: AudioNode;

  if (part.noise) {
    const sample = ctx.createBufferSource();
    sample.buffer = noise(ctx);
    sample.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = part.noise;
    filter.frequency.setValueAtTime(part.hz, start);
    if (part.to) {
      filter.frequency.exponentialRampToValueAtTime(part.to, glideEnd);
    }
    if (part.q !== undefined) filter.Q.value = part.q;

    sample.connect(filter);
    source = sample;
    tail = filter;
  } else {
    const osc = ctx.createOscillator();
    osc.type = part.wave ?? "sine";
    osc.frequency.setValueAtTime(part.hz, start);
    if (part.to) {
      osc.frequency.exponentialRampToValueAtTime(part.to, glideEnd);
    }
    source = osc;
    tail = osc;
  }

  const gain = ctx.createGain();
  const attack = Math.min((part.atk ?? 4) / 1000, (part.ms / 1000) * 0.6);
  gain.gain.setValueAtTime(0.0001, start);
  if (part.lin) {
    gain.gain.linearRampToValueAtTime(part.gain, start + attack);
  } else {
    gain.gain.exponentialRampToValueAtTime(part.gain, start + attack);
  }
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  if (part.cut) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = part.cut;
    tail.connect(filter);
    tail = filter;
  }

  tail.connect(gain).connect(ctx.destination);
  if (part.noise) {
    (source as AudioBufferSourceNode).start(start, Math.random() * 1.5);
  } else {
    (source as OscillatorNode).start(start);
  }
  source.stop(end + 0.02);
}

export function cue(kind: Cue) {
  const now = typeof performance === "undefined" ? 0 : performance.now();
  if (now - lastPlayed[kind] < 200) return;
  lastPlayed[kind] = now;

  const ctx = audio();
  if (!ctx) return;

  for (const part of RECIPES[kind]) play(ctx, part);
}
