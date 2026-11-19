/**
 * One "whisk": a short downward sine sweep with a 50 ms attack, low-passed at
 * 560 Hz. Built only on the first press, so no AudioContext exists until the
 * visitor has made a gesture that allows audio.
 */

let context: AudioContext | null = null;

function audio() {
  if (context) return context;
  try {
    context = new AudioContext();
  } catch {
    return null;
  }
  return context;
}

export function whisk() {
  const ctx = audio();
  if (!ctx) return;
  if (ctx.state !== "running") void ctx.resume();

  const now = ctx.currentTime;
  const duration = 0.13;
  const end = now + duration;

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(124, now);
  osc.frequency.exponentialRampToValueAtTime(65, end);

  const gain = ctx.createGain();
  const attack = Math.min(0.05, duration * 0.6);
  gain.gain.setValueAtTime(1e-4, now);
  gain.gain.exponentialRampToValueAtTime(0.067, now + attack);
  gain.gain.exponentialRampToValueAtTime(1e-4, end);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 560;

  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(end + 0.02);
}
