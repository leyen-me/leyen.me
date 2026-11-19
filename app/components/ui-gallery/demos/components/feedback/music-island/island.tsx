"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlbumArt,
  MusicBars,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PreviousIcon,
} from "./icons";
import { useReducedMotion, useSpringVector } from "./springs";
import { MUSIC_ISLAND_CSS } from "./styles";

export type Tone = "Black" | "White";

/** Compact pill from the source; 150 × 36 with an 18px corner. */
const COMPACT = { width: 150, height: 36, radius: 18 };

/** The opened music card; 300 × 150. Corner matches `--radius-shell`. */
const OPEN = { width: 300, height: 150, radius: 28 };

/** Damping is 34 − 16 × bounce/100 with the block's default bounce of 40. */
const SPRING = { stiffness: 380, damping: 27.6, mass: 0.9 };

type Track = {
  title: string;
  artist: string;
  duration: number;
  art: number;
};

/**
 * The block ships one song ("Soft Focus" on `/lab/mount.jpg`). "Next" needs a
 * destination, so two sibling tracks reuse the same card layout and swap only
 * the local CSS cover palette.
 */
const TRACKS: Track[] = [
  { title: "Soft Focus", artist: "Lumen Park", duration: 214, art: 0 },
  { title: "Glass Hours", artist: "Lumen Park", duration: 186, art: 1 },
  { title: "Night Signal", artist: "Lumen Park", duration: 241, art: 2 },
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`;
}

type PlayerState = { at: number; playing: boolean };

type PanelProps = {
  open: boolean;
  index: number;
  data: PlayerState;
  inert?: boolean;
  onToggle: () => void;
  onSeek: (seconds: number) => void;
  onPrevious: () => void;
  onNext: () => void;
};

/** One layer of content: the compact row, or the full player. */
function Panel({
  open,
  index,
  data,
  inert,
  onToggle,
  onSeek,
  onPrevious,
  onNext,
}: PanelProps) {
  const track = TRACKS[index];
  const progress = Math.min(1, data.at / track.duration);

  if (!open) {
    return (
      <span className="mi-compact">
        <AlbumArt art={track.art} small />
        <MusicBars on={data.playing} />
      </span>
    );
  }

  return (
    <span className="mi-open">
      <span className="mi-music">
        <span className="mi-row">
          <AlbumArt art={track.art} />
          <span className="mi-who">
            <span className="mi-name">{track.title}</span>
            <span className="mi-label">{track.artist}</span>
          </span>
          <span className="mi-grow" />
          <MusicBars on={data.playing} />
        </span>

        <span className="mi-row mi-track">
          <span className="mi-t">{clock(data.at)}</span>
          <span className="mi-rail">
            <span className="mi-fill" style={{ width: `${progress * 100}%` }} />
            <input
              type="range"
              className="mi-seek"
              min={0}
              max={track.duration}
              step={1}
              value={data.at}
              tabIndex={inert ? -1 : undefined}
              aria-label={`Seek in ${track.title}`}
              aria-valuetext={`${clock(data.at)} of ${clock(track.duration)}`}
              onChange={(event) => onSeek(Number(event.target.value))}
            />
          </span>
          <span className="mi-t">
            -{clock(Math.max(0, track.duration - data.at))}
          </span>
        </span>

        <span className="mi-row mi-ctl">
          <button
            type="button"
            className="mi-skip"
            tabIndex={inert ? -1 : undefined}
            aria-label="Restart track"
            onClick={onPrevious}
          >
            <PreviousIcon size={20} />
          </button>
          <button
            type="button"
            className="mi-play"
            tabIndex={inert ? -1 : undefined}
            aria-label={data.playing ? "Pause track" : "Play track"}
            onClick={onToggle}
          >
            {data.playing ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
          </button>
          <button
            type="button"
            className="mi-skip"
            tabIndex={inert ? -1 : undefined}
            aria-label="Next track"
            onClick={onNext}
          >
            <NextIcon size={20} />
          </button>
        </span>
      </span>
    </span>
  );
}

type IslandProps = {
  tone?: Tone;
  startOpen?: boolean;
};

/**
 * Music island, ported from Bencho's press block.
 *
 * Closed it is a 150 × 36 black pill showing the cover and four pink bars.
 * Pressing it springs width, height and radius to 300 × 150 / 42 with the
 * source's 380 / (34 − 16b) / 0.9 spring, while the two content layers
 * crossfade through blur and scale. The player owns a second-by-second clock:
 * play/pause, restart, next and seeking all update the same track position.
 *
 * Approximations: Web Audio click cues are omitted, the photo cover is local
 * CSS art, and "next" cycles a small playlist so the button has a result.
 */
export default function MusicIsland({
  tone = "Black",
  startOpen = false,
}: IslandProps) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(startOpen);
  const [pressed, setPressed] = useState(false);
  const [index, setIndex] = useState(0);
  const [data, setData] = useState<PlayerState>({ at: 71, playing: true });
  const toggleRef = useRef<HTMLButtonElement>(null);

  const track = TRACKS[index];

  useEffect(() => {
    // The source advances one second at a time and loops at the track end.
    const timer = window.setInterval(() => {
      setData((current) =>
        current.playing
          ? {
              ...current,
              at: current.at >= track.duration ? 0 : current.at + 1,
            }
          : current,
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [track.duration]);

  const shape = open ? OPEN : COMPACT;
  const targets = useMemo(
    () => ({
      width: shape.width,
      height: shape.height,
      radius: shape.radius,
      scale: reduced ? 1 : pressed ? 0.97 : 1,
    }),
    [shape.width, shape.height, shape.radius, pressed, reduced],
  );
  const geometry = useSpringVector(targets, SPRING, reduced);

  /**
   * Two-layer content swap. The old layer leaves immediately; the new one
   * arrives after the source's 60ms beat, so the pill never shows both at
   * full opacity.
   */
  const layerKey = `${open}-${index}`;
  const [tracked, setTracked] = useState({ key: layerKey, open, index });
  const [animated, setAnimated] = useState(false);
  const [leaving, setLeaving] = useState<typeof tracked | null>(null);

  if (tracked.key !== layerKey) {
    setLeaving(tracked);
    setTracked({ key: layerKey, open, index });
    setAnimated(true);
  }

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => setLeaving(null), reduced ? 0 : 220);
    return () => window.clearTimeout(timer);
  }, [leaving, reduced]);

  const seek = (seconds: number) =>
    setData((current) => ({ ...current, at: seconds }));
  const previous = () => setData((current) => ({ ...current, at: 0 }));
  const next = () => {
    setIndex((current) => (current + 1) % TRACKS.length);
    setData((current) => ({ ...current, at: 0 }));
  };

  const announcement = open
    ? `Now playing ${track.title} by ${track.artist}. ${
        data.playing ? "Playing." : "Paused."
      }`
    : "Music island closed.";

  return (
    <div className="mi mx-auto" data-reduced={reduced ? "true" : undefined}>
      <style>{MUSIC_ISLAND_CSS}</style>

      <div className="mi-top">
        <div
          className="mi-pill"
          data-tone={tone === "White" ? "white" : undefined}
          style={{
            width: geometry.width,
            height: geometry.height,
            borderRadius: geometry.radius,
            transform: `scale(${geometry.scale})`,
          }}
          onPointerDown={() => {
            if (!reduced) setPressed(true);
          }}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && open) {
              setOpen(false);
              toggleRef.current?.focus();
            }
          }}
        >
          <button
            ref={toggleRef}
            type="button"
            className="mi-toggle"
            aria-expanded={open}
            aria-label={open ? "Close music island" : "Open music island"}
            style={{ borderRadius: geometry.radius }}
            onClick={() => setOpen((value) => !value)}
          />

          <div className="mi-in">
            {leaving && !reduced ? (
              <div
                key={leaving.key}
                className="mi-layer mi-exit"
                aria-hidden="true"
              >
                <Panel
                  open={leaving.open}
                  index={leaving.index}
                  data={data}
                  inert
                  onToggle={() => {}}
                  onSeek={() => {}}
                  onPrevious={() => {}}
                  onNext={() => {}}
                />
              </div>
            ) : null}

            <div
              key={layerKey}
              className={`mi-layer${animated ? " mi-enter" : ""}`}
            >
              <Panel
                open={open}
                index={index}
                data={data}
                onToggle={() =>
                  setData((current) => ({
                    ...current,
                    playing: !current.playing,
                  }))
                }
                onSeek={seek}
                onPrevious={previous}
                onNext={next}
              />
            </div>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  );
}
