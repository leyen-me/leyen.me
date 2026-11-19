/**
 * Bencho's `expand` and `lift` cues, rebuilt from the voice tables in its shared
 * sound kit:
 *
 *   expand: 196 → 174 Hz over 360 ms (gain .042, low-pass 880, attack 36 ms)
 *           294 → 262 Hz over 300 ms (gain .014, low-pass 1100, attack 48 ms,
 *           delayed 24 ms)
 *   lift:   660 → 720 Hz over  38 ms (gain .028, sine)
 *
 * The AudioContext is created lazily inside the gesture that needs it, so the
 * module never touches `window` during render or evaluation.
 */
type Voice = {
  hz: number;
  to?: number;
  ms: number;
  gain: number;
  cut?: number;
  atk: number;
  /** Offset from the start of the cue, in milliseconds. */
  at?: number;
};

export type GenerateSound = "expand" | "lift";

const VOICES: Record<GenerateSound, readonly Voice[]> = {
  expand: [
    { hz: 196, to: 174, ms: 360, gain: 0.042, cut: 880, atk: 36 },
    { hz: 294, to: 262, ms: 300, gain: 0.014, cut: 1100, atk: 48, at: 24 },
  ],
  lift: [{ hz: 660, to: 720, ms: 38, gain: 0.028, atk: 4 }],
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
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(voice.hz, start);
  if (voice.to) {
    oscillator.frequency.exponentialRampToValueAtTime(
      voice.to,
      start + duration,
    );
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

export function playGenerateSound(name: GenerateSound) {
  const ctx = getContext();
  if (!ctx) return;

  // Safari can hand back a suspended context even inside a click; scheduling at
  // the frozen currentTime means the tone starts as soon as it resumes.
  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  for (const voice of VOICES[name]) {
    emit(ctx, voice);
  }
}
