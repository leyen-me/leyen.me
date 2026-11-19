/**
 * Bencho's Web Audio cues for Huddle, reduced to the three the block uses.
 *
 * Tones are lifted from the source's `pop`, `shift` and `off` recipes: a short
 * upward sine blip when you join, a longer downward glide when you leave, and a
 * soft descending "shift" for the mute and options buttons. The context is
 * created lazily inside a click (never at module scope) and closed on unmount.
 */

export type HuddleCue = "join" | "leave" | "mute";

type Tone = {
  hz: number;
  to?: number;
  /** Total length in milliseconds. */
  ms: number;
  gain: number;
  /** Attack in milliseconds. */
  atk: number;
  cut?: number;
  wave?: OscillatorType;
};

const CUES: Record<HuddleCue, Tone[]> = {
  // source: { hz: 680, to: 930, ms: 34, gain: 0.05, wave: "sine", atk: 3 }
  join: [{ hz: 680, to: 930, ms: 34, gain: 0.05, atk: 3 }],
  // source: { hz: 330, to: 247, ms: 88, gain: 0.03, cut: 720, atk: 8 }
  leave: [{ hz: 330, to: 247, ms: 88, gain: 0.03, atk: 8, cut: 720 }],
  // source: { hz: 294, to: 147, ms: 360, gain: 0.053, cut: 560, atk: 90 }
  mute: [{ hz: 294, to: 147, ms: 360, gain: 0.053, atk: 90, cut: 560 }],
};

export type CuePlayer = {
  play: (cue: HuddleCue) => void;
  dispose: () => void;
};

export function createCuePlayer(): CuePlayer {
  let context: AudioContext | null = null;
  let disposed = false;

  const open = () => {
    if (disposed) return null;
    if (!context) {
      if (typeof window === "undefined" || !window.AudioContext) return null;
      try {
        context = new window.AudioContext();
      } catch {
        return null;
      }
    }
    if (context.state === "suspended") void context.resume();
    return context;
  };

  const play = (cue: HuddleCue) => {
    const audio = open();
    if (!audio) return;

    const now = audio.currentTime;

    for (const tone of CUES[cue]) {
      const start = now;
      const end = start + tone.ms / 1000;
      const attack = Math.min(tone.atk / 1000, (tone.ms / 1000) * 0.6);

      const osc = audio.createOscillator();
      osc.type = tone.wave ?? "sine";
      osc.frequency.setValueAtTime(tone.hz, start);
      if (tone.to) {
        osc.frequency.exponentialRampToValueAtTime(tone.to, end);
      }

      const gain = audio.createGain();
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(tone.gain, start + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      let tail: AudioNode = osc;
      if (tone.cut) {
        const filter = audio.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = tone.cut;
        osc.connect(filter);
        tail = filter;
      }

      tail.connect(gain).connect(audio.destination);
      osc.start(start);
      osc.stop(end + 0.02);
    }
  };

  const dispose = () => {
    disposed = true;
    if (context) {
      void context.close();
      context = null;
    }
  };

  return { play, dispose };
}
