/**
 * Bencho's reaction sounds, rebuilt from the `hover`, `pop`, `drop`, `tock`
 * and `off` voice tables in its sound engine. The AudioContext is created
 * lazily inside the gesture that needs it, so nothing touches `window` during
 * render or module evaluation.
 */

type Voice = {
  hz: number;
  to?: number;
  ms: number;
  gain: number;
  wave: OscillatorType;
  cut?: number;
  atk: number;
};

export type ReactionSound = "hover" | "pop" | "drop" | "tock" | "off";

const VOICES: Record<ReactionSound, readonly Voice[]> = {
  // 232 Hz sine through a 560 Hz lowpass, long 66 ms swell
  hover: [{ hz: 232, ms: 360, gain: 0.038, wave: "sine", cut: 560, atk: 66 }],
  // 680 → 930 Hz, 34 ms sine chirp
  pop: [{ hz: 680, to: 930, ms: 34, gain: 0.05, wave: "sine", atk: 3 }],
  // 196 → 130 Hz, 150 ms sine through a 900 Hz lowpass
  drop: [{ hz: 196, to: 130, ms: 150, gain: 0.07, wave: "sine", cut: 900, atk: 6 }],
  // 250 Hz triangle click through a 1.7 kHz lowpass
  tock: [{ hz: 250, ms: 28, gain: 0.045, wave: "triangle", cut: 1700, atk: 10 }],
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
  const start = ctx.currentTime;
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

export function playReactionSound(name: ReactionSound) {
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
