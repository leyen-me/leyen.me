"use client";

import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { MicIcon, PlayPauseIcon, XIcon } from "./icons";
import { playVoiceSound, type VoiceSound } from "./sound";
import { VOICE_NOTE_CSS } from "./voice-note-css";

/*
 * Bencho's Voice note defaults, unchanged: a 56 px pill that opens from 216 to
 * 300 px, 28 bars, 60 sensitivity, 40 bounce, a 28 px corner and a 90 px slide
 * to discard. The source simulates the microphone, so this port does too:
 * `levelAt` is the same product of two sines and a random jitter.
 */
const WIDTH_IDLE = 216;
const WIDTH_OPEN = 300;
const BARS = 28;
const GAIN = 60;
const BOUNCE = 40;
const CORNER = 28;
const INNER = CORNER - 6 * Math.min(1, CORNER / 12);
const PULL_DISTANCE = 90;
const MIN_MS = 500;
const MAX_MS = 30_000;
const TICK_MS = 70;
const WAVE_WINDOW = 64;
const CANCEL_MS = 360;
const SCALE = 0.4 + (GAIN / 100) * 1.2;

type Phase = "idle" | "rec" | "clip" | "cancel";
type Clip = { raw: number[]; ms: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Seconds to `m:ss`, exactly as the source formats its timer. */
function formatTime(ms: number) {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * The simulated input level at a recording time in seconds. Two sines gate each
 * other so the waveform breathes instead of looking like noise; the random
 * factor keeps every take different.
 */
function levelAt(seconds: number) {
  const envelope = Math.abs(
    Math.sin(seconds * 6.1) * Math.sin(seconds * 1.9 + 0.7),
  );
  const gate = Math.sin(seconds * 0.9 + 0.4) > -0.55 ? 1 : 0.1;
  return Math.min(1, 0.06 + envelope * gate * (0.5 + Math.random() * 0.5));
}

/** Bucket peaks, used when a finished clip is redrawn with a fixed bar count. */
function downsample(raw: number[], count: number) {
  if (raw.length === 0) return Array<number>(count).fill(0);

  return Array.from({ length: count }, (_, index) => {
    const from = Math.floor((index * raw.length) / count);
    const to = Math.max(
      from + 1,
      Math.floor(((index + 1) * raw.length) / count),
    );
    let peak = 0;
    for (let i = from; i < to && i < raw.length; i++) {
      peak = Math.max(peak, raw[i]);
    }
    return peak;
  });
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const list = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, []);

  return reduced;
}

/**
 * A 1:1 port of Bencho's "Voice note" press block. Hold the pill to record;
 * the timer runs, the wave grows every 70 ms, and the pill widens from 216 to
 * 300 px. Release after 500 ms to keep the clip; slide 90 px left (or press
 * Escape) to discard. A kept clip plays back over the same waveform, with the
 * playhead stored in `--prog` so a frame never re-renders React.
 *
 * Additions for the gallery are interaction-only: the record pill is a real
 * button, the scrubber is a keyboard slider, and status changes go through an
 * aria-live region. No real microphone is opened.
 */
export default function Demo() {
  const reduced = usePrefersReducedMotion();

  const [phase, setPhaseState] = useState<Phase>("idle");
  const [waves, setWaves] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [clip, setClipState] = useState<Clip | null>(null);
  const [playing, setPlayingState] = useState(false);
  const [pull, setPullState] = useState(0);
  const [live, setLive] = useState("");

  const phaseRef = useRef<Phase>("idle");
  const clipRef = useRef<Clip | null>(null);
  const pullRef = useRef(0);
  const rawRef = useRef<number[]>([]);
  const progressRef = useRef(0);
  const startedAt = useRef(0);
  const anchorX = useRef(0);
  const pressing = useRef(false);
  const tickTimer = useRef<number | undefined>(undefined);
  const resetTimer = useRef<number | undefined>(undefined);
  const frame = useRef(0);
  const scrubbing = useRef(false);
  const keyboardRecording = useRef(false);

  const rootRef = useRef<HTMLButtonElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const scrubRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);

  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  const setPlaying = useCallback((next: boolean) => {
    setPlayingState(next);
  }, []);

  const setPull = useCallback((next: number) => {
    pullRef.current = next;
    setPullState(next);
  }, []);

  const sound = useCallback((name: VoiceSound) => {
    playVoiceSound(name);
  }, []);

  const stopPlayback = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    setPlaying(false);
  }, [setPlaying]);

  /**
   * The playhead is written straight to the DOM: one custom property feeds all
   * 28 bar opacities, and the visible time is the same value in `m:ss`.
   */
  const paintProgress = useCallback(() => {
    const scrub = scrubRef.current;
    const current = clipRef.current;
    if (!scrub || !current) return;

    const progress = progressRef.current;
    scrub.style.setProperty("--prog", progress.toFixed(4));
    scrub.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
    scrub.setAttribute(
      "aria-valuetext",
      `${formatTime(progress * current.ms)} of ${formatTime(current.ms)}`,
    );

    if (timeRef.current) {
      timeRef.current.textContent = formatTime(
        progress > 0 && progress < 1 ? progress * current.ms : current.ms,
      );
    }
  }, []);

  useEffect(
    () => () => {
      window.clearInterval(tickTimer.current);
      window.clearTimeout(resetTimer.current);
      cancelAnimationFrame(frame.current);
    },
    [],
  );

  // A recording finished with the keyboard hands the user straight to Play,
  // because the pill they were holding is replaced by the clip controls.
  useEffect(() => {
    if (phase === "clip" && keyboardRecording.current) {
      keyboardRecording.current = false;
      playRef.current?.focus({ preventScroll: true });
    }
  }, [phase]);

  function startRecording() {
    if (phaseRef.current !== "idle") return;

    rawRef.current = [];
    progressRef.current = 0;
    setWaves([]);
    setElapsed(0);
    setPull(0);
    startedAt.current = performance.now();
    setPhase("rec");
    sound("press");
    setLive("Recording. Release to keep, Escape to discard.");

    window.clearInterval(tickTimer.current);
    tickTimer.current = window.setInterval(() => {
      const ms = performance.now() - startedAt.current;
      rawRef.current.push(levelAt(ms / 1000));
      setWaves(rawRef.current.slice(-WAVE_WINDOW));
      setElapsed(ms);
      if (ms >= MAX_MS) finishRecording(false);
    }, TICK_MS);
  }

  function cancelRecording(cue: VoiceSound, message: string) {
    setPhase("cancel");
    sound(cue);
    setLive(message);

    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => {
      clipRef.current = null;
      progressRef.current = 0;
      setClipState(null);
      setElapsed(0);
      setPull(0);
      setPhase("idle");
      keyboardRecording.current = false;
      requestAnimationFrame(() =>
        rootRef.current?.focus({ preventScroll: true }),
      );
    }, CANCEL_MS);
  }

  function finishRecording(discard: boolean) {
    if (phaseRef.current !== "rec") return;

    pressing.current = false;
    window.clearInterval(tickTimer.current);
    const ms = performance.now() - startedAt.current;

    if (!discard && ms >= MIN_MS) {
      const next = { raw: rawRef.current.slice(), ms };
      clipRef.current = next;
      progressRef.current = 0;
      setClipState(next);
      setElapsed(0);
      setPull(0);
      setPhase("clip");
      sound("pop");
      setLive(`Recorded ${formatTime(ms)}. Ready to play.`);
      return;
    }

    cancelRecording(
      discard ? "whisk" : "tock",
      discard ? "Recording discarded." : "Too short — recording discarded.",
    );
  }

  function discard() {
    stopPlayback();
    cancelRecording("whisk", "Recording discarded.");
  }

  function togglePlayback() {
    const current = clipRef.current;
    if (!current) return;

    if (frame.current) {
      stopPlayback();
      sound("tock");
      return;
    }

    if (progressRef.current >= 1) progressRef.current = 0;
    setPlaying(true);
    sound("click");
    paintProgress();

    let previous = performance.now();
    const step = (now: number) => {
      if (!scrubbing.current) {
        progressRef.current = Math.min(
          1,
          progressRef.current + (now - previous) / current.ms,
        );
      }
      previous = now;
      paintProgress();

      if (progressRef.current >= 1) {
        stopPlayback();
        return;
      }
      frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);
  }

  function seekTo(progress: number) {
    progressRef.current = clamp(progress, 0, 1);
    paintProgress();
  }

  function seekClientX(clientX: number) {
    const scrub = scrubRef.current;
    if (!scrub) return;
    const box = scrub.getBoundingClientRect();
    if (box.width === 0) return;
    seekTo((clientX - box.left) / box.width);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (phaseRef.current !== "idle") return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Capture is an optimisation; pointer leave still releases the recording.
    }
    anchorX.current = event.clientX;
    pressing.current = true;
    keyboardRecording.current = false;
    startRecording();
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!pressing.current || phaseRef.current !== "rec") return;

    const next = clamp((anchorX.current - event.clientX) / PULL_DISTANCE, 0, 1);
    if (next >= 1 && pullRef.current < 1) sound("tock");
    setPull(next);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // The pointer may already have been released by the browser.
    }
    if (!pressing.current) return;
    pressing.current = false;
    finishRecording(pullRef.current >= 1);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (
      (event.key === " " || event.key === "Enter") &&
      !event.repeat &&
      phaseRef.current === "idle"
    ) {
      event.preventDefault();
      keyboardRecording.current = true;
      startRecording();
      return;
    }

    if (event.key === "Escape" && phaseRef.current === "rec") {
      event.preventDefault();
      finishRecording(true);
    }
  }

  function handleKeyUp(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (
      (event.key === " " || event.key === "Enter") &&
      phaseRef.current === "rec"
    ) {
      event.preventDefault();
      finishRecording(false);
    }
  }

  function handleScrubKeyDown(event: ReactKeyboardEvent<HTMLSpanElement>) {
    const current = clipRef.current;
    if (!current || phaseRef.current !== "clip") return;

    const step = event.shiftKey ? 0.01 : 0.05;
    let next: number | null = null;

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      next = progressRef.current - step;
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      next = progressRef.current + step;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = 1;
    }

    if (next === null) return;
    event.preventDefault();
    seekTo(next);
  }

  function handleScrubPointerDown(event: ReactPointerEvent<HTMLSpanElement>) {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Dragging still works while the pointer stays over the waveform.
    }
    scrubbing.current = true;
    seekClientX(event.clientX);
  }

  function handleScrubPointerMove(event: ReactPointerEvent<HTMLSpanElement>) {
    if (!scrubbing.current) return;
    seekClientX(event.clientX);
  }

  function handleScrubPointerUp(event: ReactPointerEvent<HTMLSpanElement>) {
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Same as above: releasing twice is harmless.
    }
    scrubbing.current = false;
  }

  const active = phase !== "idle";
  const showClip = clip !== null && (phase === "clip" || phase === "cancel");
  const showRec = phase === "rec" || (phase === "cancel" && clip === null);
  const armed = pullRef.current >= 1;

  // The recording window is the last 64 samples; each bar maps to one sample.
  const recordOffset = rawRef.current.length - waves.length;
  const recordBars = Array.from({ length: BARS }, (_, index) => {
    const sampleIndex = waves.length - BARS + index;
    const value = sampleIndex >= 0 ? waves[sampleIndex] : 0;
    return {
      value,
      index,
      key: sampleIndex >= 0 ? recordOffset + sampleIndex : `e${index}`,
    };
  });

  const clipBars = clip ? downsample(clip.raw, BARS) : [];

  const shellStyle = {
    "--w": `${active ? WIDTH_OPEN : WIDTH_IDLE}px`,
    "--r": `${CORNER}px`,
    "--inner": `${INNER}px`,
    "--ov": (1 + (BOUNCE / 100) * 0.7).toFixed(3),
    "--pull": pull.toFixed(3),
  } as CSSProperties;

  const body = (
    <>
      {phase === "idle" ? (
        <span className="vn-in vn-idle">
          <MicIcon />
          Hold to record
        </span>
      ) : null}

      {showRec ? (
        <span
          className="vn-in vn-rec"
          style={{ translate: `${-pull * PULL_DISTANCE * 0.5}px 0` }}
        >
          <span className="vn-dot" />
          <span className="vn-time">{formatTime(elapsed)}</span>
          <span
            className="vn-wave"
            style={{ "--n": BARS } as CSSProperties}
            aria-hidden="true"
          >
            {recordBars.map((bar) => (
              <i
                key={bar.key}
                className="vn-bar"
                style={
                  {
                    "--l": clamp(bar.value * SCALE, 0, 1).toFixed(3),
                    "--i": bar.index,
                  } as CSSProperties
                }
              />
            ))}
          </span>
        </span>
      ) : null}

      {showRec ? (
        <span
          className="vn-cancel"
          data-on={armed || undefined}
          aria-hidden="true"
        >
          <XIcon size={16} />
        </span>
      ) : null}

      {showClip && clip ? (
        <span className="vn-in vn-clip">
          <button
            ref={playRef}
            type="button"
            className="vn-play"
            aria-label={playing ? "Pause" : "Play"}
            aria-pressed={playing}
            disabled={phase === "cancel"}
            onClick={togglePlayback}
          >
            <PlayPauseIcon playing={playing} reduced={reduced} />
          </button>

          <span
            ref={scrubRef}
            className="vn-wave vn-scrub"
            style={{ "--n": BARS, "--prog": 0 } as CSSProperties}
            role="slider"
            tabIndex={phase === "clip" ? 0 : -1}
            aria-label="Playback position"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
            aria-valuetext={`0:00 of ${formatTime(clip.ms)}`}
            onPointerDown={handleScrubPointerDown}
            onPointerMove={handleScrubPointerMove}
            onPointerUp={handleScrubPointerUp}
            onPointerCancel={handleScrubPointerUp}
            onKeyDown={handleScrubKeyDown}
          >
            {clipBars.map((value, index) => (
              <i
                key={index}
                className="vn-bar"
                style={
                  {
                    "--l": clamp(value * SCALE, 0, 1).toFixed(3),
                    "--i": index,
                  } as CSSProperties
                }
              />
            ))}
          </span>

          <span ref={timeRef} className="vn-time">
            {formatTime(clip.ms)}
          </span>

          <button
            type="button"
            className="vn-x"
            aria-label="Discard"
            disabled={phase === "cancel"}
            onClick={discard}
          >
            <XIcon />
          </button>
        </span>
      ) : null}
    </>
  );

  return (
    <div className="voice-note-demo w-full max-w-[340px]">
      <style>{VOICE_NOTE_CSS}</style>

      <div className="grid h-[200px] w-full place-items-center rounded-2xl border border-black/[0.04] bg-[#f7f7f6] dark:border-white/[0.06] dark:bg-[#0a0a0a]">
        <div className="vn-frame">
          {phase === "idle" || phase === "rec" ? (
            <button
              ref={rootRef}
              type="button"
              className="vn"
              data-phase={phase}
              data-stroke="on"
              style={shellStyle}
              aria-label={
                phase === "rec"
                  ? "Recording. Release to keep, Escape to discard."
                  : "Hold to record a voice note"
              }
              aria-pressed={phase === "rec"}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => {
                pressing.current = false;
                finishRecording(false);
              }}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onBlur={() => {
                if (phaseRef.current === "rec") finishRecording(false);
              }}
              onContextMenu={(event) => event.preventDefault()}
            >
              {body}
            </button>
          ) : (
            <div
              className="vn"
              data-phase={phase}
              data-stroke="on"
              style={shellStyle}
              role="group"
              aria-label="Voice note"
            >
              {body}
            </div>
          )}

          <span
            className="vn-hint"
            data-on={phase === "rec" || undefined}
            data-armed={armed || undefined}
            style={{ "--pull": pull.toFixed(3) } as CSSProperties}
            aria-hidden="true"
          >
            {phase === "rec" && armed
              ? "Release to cancel"
              : "‹ Slide to cancel"}
          </span>
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {live}
      </p>
    </div>
  );
}
