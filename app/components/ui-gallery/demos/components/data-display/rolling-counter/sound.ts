/**
 * Bencho plays its `tock` cue on every count change, throttled to one per
 * 45 ms. The voice is 250 Hz triangle through a 1.7 kHz lowpass for 28 ms.
 *
 * The AudioContext is created inside the first real gesture, so nothing runs
 * at module scope and browsers that refuse audio simply stay silent.
 */

const GAP = 45;

const TOCK = {
  hz: 250,
  ms: 28,
  gain: 0.045,
  attack: 10,
  cut: 1700,
} as const;

let context: AudioContext | null = null;
let lastPlayed = -Infinity;

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

function emit(ctx: AudioContext) {
  const start = ctx.currentTime;
  const duration = TOCK.ms / 1000;
  const attack = Math.min(TOCK.attack / 1000, duration * 0.6);

  const oscillator = ctx.createOscillator();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(TOCK.hz, start);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = TOCK.cut;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(1e-4, start);
  gain.gain.exponentialRampToValueAtTime(TOCK.gain, start + attack);
  gain.gain.exponentialRampToValueAtTime(1e-4, start + duration);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function playTock() {
  const now = performance.now();
  if (now - lastPlayed < GAP) return;
  lastPlayed = now;

  const ctx = getContext();
  if (!ctx) return;

  // Safari can return a suspended context even inside a gesture; scheduling
  // at the frozen currentTime starts the tick as soon as it resumes.
  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  emit(ctx);
}
