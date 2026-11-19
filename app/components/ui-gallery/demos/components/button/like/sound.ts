/**
 * Bencho's like sound, reconstructed from the `pop` and `tock` voice tables in
 * its sound engine: a short sine chirp going up when liking, and a low
 * triangle click when unliking.
 *
 * The AudioContext is created lazily inside the click handler, so it is born
 * from a user gesture and never touches `window` during render or module load.
 * No sound is played if the browser refuses to start audio.
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

export type LikeSound = "pop" | "tock";

const VOICES: Record<LikeSound, readonly Voice[]> = {
  // 680 → 930 Hz, 34 ms, sine
  pop: [{ hz: 680, to: 930, ms: 34, gain: 0.05, wave: "sine", atk: 3 }],
  // 250 Hz, 28 ms, triangle through a 1.7 kHz lowpass
  tock: [{ hz: 250, ms: 28, gain: 0.045, wave: "triangle", cut: 1700, atk: 10 }],
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

export function playLikeSound(name: LikeSound) {
  const ctx = getContext();
  if (!ctx) return;

  // Safari can hand back a suspended context even inside a click; scheduling
  // at the frozen currentTime means the tone starts as soon as it resumes.
  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  for (const voice of VOICES[name]) {
    emit(ctx, voice);
  }
}
