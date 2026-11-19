/**
 * Bencho's create-menu cues, rebuilt from the `press`, `expand`, `click` and
 * `off` voice tables in its sound engine. The AudioContext is created lazily
 * inside the gesture that needs it, so nothing touches `window` during render
 * or module evaluation.
 */

type Voice = {
  hz: number;
  to?: number;
  ms: number;
  gain: number;
  wave: OscillatorType;
  cut?: number;
  atk: number;
  /** Delay before the voice starts, in milliseconds. */
  at?: number;
};

export type CreateMenuSound = "press" | "expand" | "click" | "off";

const VOICES: Record<CreateMenuSound, readonly Voice[]> = {
  // 168 Hz sine, 95 ms, through a 480 Hz lowpass
  press: [{ hz: 168, ms: 95, gain: 0.028, wave: "sine", cut: 480, atk: 14 }],
  // Two sines: 196 → 174 Hz, and a quiet 294 → 262 Hz a beat later
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
  // 196 → 130 Hz, 150 ms sine through a 900 Hz lowpass
  click: [{ hz: 196, to: 130, ms: 150, gain: 0.07, wave: "sine", cut: 900, atk: 6 }],
  // 330 → 247 Hz, 88 ms sine
  off: [{ hz: 330, to: 247, ms: 88, gain: 0.03, wave: "sine", cut: 720, atk: 8 }],
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

function emit(ctx: AudioContext, voice: Voice) {
  const start = ctx.currentTime + (voice.at ?? 0) / 1000;
  const duration = voice.ms / 1000;
  const attack = Math.min(voice.atk / 1000, duration * 0.6);

  const oscillator = ctx.createOscillator();
  oscillator.type = voice.wave;
  oscillator.frequency.setValueAtTime(voice.hz, start);
  if (voice.to) {
    oscillator.frequency.exponentialRampToValueAtTime(voice.to, start + duration);
  }

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(1e-4, start);
  gain.gain.exponentialRampToValueAtTime(voice.gain, start + attack);
  gain.gain.exponentialRampToValueAtTime(1e-4, start + duration);

  let tail: AudioNode = oscillator;
  if (voice.cut) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = voice.cut;
    oscillator.connect(filter);
    tail = filter;
  }

  tail.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function playCreateMenuSound(name: CreateMenuSound) {
  const ctx = getContext();
  if (!ctx) return;

  // Safari can return a suspended context even inside a gesture; scheduling at
  // the frozen currentTime means the tone starts as soon as it resumes.
  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  for (const voice of VOICES[name]) {
    emit(ctx, voice);
  }
}
