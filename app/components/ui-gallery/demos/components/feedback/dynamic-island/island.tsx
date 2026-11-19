"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  AlbumArt,
  CallerFace,
  MusicBars,
  PauseIcon,
  PhoneIcon,
  PlaneIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
  TimerIcon,
} from "./icons";
import { useContentPop, useReducedMotion, useSpringVector } from "./springs";
import { DYNAMIC_ISLAND_CSS } from "./styles";

export const ACTIVITIES = ["Timer", "Call", "Music", "Flight"] as const;
export type Activity = (typeof ACTIVITIES)[number];
export type Tone = "Black" | "White";

/** Live values the island ticks forward once a second, exactly as the source. */
export type IslandData = {
  left: number;
  talk: number;
  at: number;
  flown: number;
  paused: boolean;
  playing: boolean;
};

const COMPACT = { width: 150, height: 36, radius: 18 };

/**
 * The four opened shapes. The catalog copy advertises 332 × 76 for the demo
 * pill, but the component's shipped table — which is what this port follows —
 * is 300 wide for every activity.
 */
const OPEN = {
  Timer: { width: 300, height: 76, radius: 38 },
  Call: { width: 300, height: 76, radius: 38 },
  Music: { width: 300, height: 150, radius: 42 },
  Flight: { width: 300, height: 116, radius: 40 },
} as const;

const FLIGHT_TOTAL = 180;
const TRACK_TOTAL = 214;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`;
}

function remaining(flown: number) {
  const left = FLIGHT_TOTAL - flown;
  if (left <= 0) return "Landed";
  const hours = Math.floor(left / 60);
  return `${hours ? `${hours}h ` : ""}${left % 60}m`;
}

function stop(event: ReactPointerEvent | ReactMouseEvent) {
  event.stopPropagation();
}

type PanelProps = {
  kind: Activity;
  open: boolean;
  data: IslandData;
  inert?: boolean;
  onPause: () => void;
  onPlay: () => void;
  onEnd: () => void;
};

/** The compact row: one glanceable control per activity. */
function Compact({ kind, data }: Pick<PanelProps, "kind" | "data">) {
  if (kind === "Timer") {
    return (
      <>
        <TimerIcon size={16} className="dyn-amber" />
        <span className="dyn-num dyn-amber">{clock(data.left)}</span>
      </>
    );
  }

  if (kind === "Flight") {
    return (
      <>
        <PlaneIcon size={16} className="dyn-cyan dyn-plane" />
        <span className="dyn-num dyn-cyan">{remaining(data.flown)}</span>
      </>
    );
  }

  if (kind === "Call") {
    return (
      <>
        <PhoneIcon
          size={14}
          fill="currentColor"
          strokeWidth={2}
          className="dyn-green"
        />
        <span className="dyn-num dyn-green">{clock(data.talk)}</span>
      </>
    );
  }

  return (
    <>
      <AlbumArt small />
      <MusicBars on={data.playing} />
    </>
  );
}

/** The expanded card, one layout per activity. */
function Expanded({
  kind,
  data,
  inert,
  onPause,
  onPlay,
  onEnd,
}: Omit<PanelProps, "open">) {
  if (kind === "Timer") {
    return (
      <>
        <button
          type="button"
          className="dyn-round dyn-amber-bg"
          tabIndex={inert ? -1 : undefined}
          aria-label={data.paused ? "Resume timer" : "Pause timer"}
          onClick={(event) => {
            stop(event);
            onPause();
          }}
        >
          {data.paused ? <PlayIcon size={18} /> : <PauseIcon size={18} />}
        </button>
        <span className="dyn-grow" />
        <span className="dyn-label">Timer</span>
        <span className="dyn-big dyn-amber">{clock(data.left)}</span>
      </>
    );
  }

  if (kind === "Call") {
    return (
      <>
        <CallerFace />
        <span className="dyn-who">
          <span className="dyn-label">Mara · {clock(data.talk)}</span>
          <span className="dyn-name">On a call</span>
        </span>
        <span className="dyn-grow" />
        <button
          type="button"
          className="dyn-round dyn-red-bg"
          tabIndex={inert ? -1 : undefined}
          aria-label="End call"
          onClick={(event) => {
            stop(event);
            onEnd();
          }}
        >
          <PhoneIcon
            size={20}
            fill="currentColor"
            strokeWidth={0}
            style={{ rotate: "135deg" }}
          />
        </button>
      </>
    );
  }

  if (kind === "Flight") {
    const progress = Math.min(1, data.flown / FLIGHT_TOTAL);
    return (
      <span
        className="dyn-flight"
        style={{ "--p": progress } as CSSProperties}
      >
        <span className="dyn-row dyn-ends">
          <span className="dyn-label">San Francisco</span>
          <span className="dyn-label">Edmonton</span>
        </span>
        <span className="dyn-row">
          <span className="dyn-code">SFO</span>
          <span className="dyn-fly">
            <i />
            <PlaneIcon size={18} className="dyn-plane" />
          </span>
          <span className="dyn-code">YEG</span>
        </span>
        <span className="dyn-row dyn-ends">
          <span className="dyn-t">21:59</span>
          <span className="dyn-eta dyn-cyan">
            {progress >= 1 ? "Landed" : `Arrives in ${remaining(data.flown)}`}
          </span>
          <span className="dyn-t">00:59</span>
        </span>
      </span>
    );
  }

  const track = Math.min(1, data.at / TRACK_TOTAL);
  return (
    <span className="dyn-music">
      <span className="dyn-row">
        <AlbumArt />
        <span className="dyn-who">
          <span className="dyn-name">Soft Focus</span>
          <span className="dyn-label">Lumen Park</span>
        </span>
        <span className="dyn-grow" />
        <MusicBars on={data.playing} />
      </span>
      <span className="dyn-row dyn-track">
        <span className="dyn-t">{clock(data.at)}</span>
        <span className="dyn-rail">
          <span style={{ width: `${track * 100}%` }} />
        </span>
        <span className="dyn-t">-{clock(TRACK_TOTAL - data.at)}</span>
      </span>
      <span className="dyn-row dyn-ctl">
        <span aria-hidden="true">
          <SkipBackIcon size={20} />
        </span>
        <button
          type="button"
          className="dyn-play"
          tabIndex={inert ? -1 : undefined}
          aria-label={data.playing ? "Pause track" : "Play track"}
          onClick={(event) => {
            stop(event);
            onPlay();
          }}
        >
          {data.playing ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
        </button>
        <span aria-hidden="true">
          <SkipForwardIcon size={20} />
        </span>
      </span>
    </span>
  );
}

function Panel({ kind, open, ...rest }: PanelProps) {
  return open ? (
    <span className="dyn-open" data-kind={kind}>
      <Expanded kind={kind} {...rest} />
    </span>
  ) : (
    <span className="dyn-compact" data-kind={kind}>
      <Compact kind={kind} data={rest.data} />
    </span>
  );
}

type IslandProps = {
  activity: Activity;
  bounce: number;
  tone: Tone;
  startOpen?: boolean;
};

/**
 * A 1:1 port of Bencho's "Dynamic island" block.
 *
 * One black pill holds a live activity. Pressing it springs width, height and
 * corner radius from 150 × 36 to the activity's card with 380 / (34 − 16b)
 * over mass 0.9, and the compact row crossfades into the card through blur and
 * scale. Timer pauses in place, the call can be hung up, the flight bar creeps
 * towards Edmonton, and the track pauses. All four activities share the same
 * second-by-second tick.
 *
 * The source's Web Audio cues and framer-motion are not ported: the spring is
 * integrated locally, and the album/portrait photos are replaced with local
 * CSS artwork. Press feedback (0.97 while held), geometry, copy, colours and
 * the reduced-motion behaviour are kept.
 */
export default function DynamicIsland({
  activity,
  bounce,
  tone,
  startOpen = true,
}: IslandProps) {
  const reduced = useReducedMotion();
  const kind: Activity = ACTIVITIES.includes(activity) ? activity : "Timer";

  const [open, setOpen] = useState(startOpen);
  const [pressed, setPressed] = useState(false);
  const [pop, setPop] = useState(0);

  const [data, setData] = useState<IslandData>({
    left: 299,
    talk: 42,
    at: 71,
    flown: 24,
    paused: false,
    playing: true,
  });

  /** Bumped only when the activity is changed from outside the pill. */
  const popScale = useContentPop(pop, reduced);
  const previousActivity = useRef(activity);

  useEffect(() => {
    // Pop the content shell every time the activity prop changes, like the
    // source's `l` counter; the initial mount stays still.
    if (previousActivity.current === activity) return;
    previousActivity.current = activity;
    setPop((value) => value + 1);
  }, [activity]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setData((current) => ({
        ...current,
        left: current.paused
          ? current.left
          : current.left <= 0
            ? 299
            : current.left - 1,
        talk: current.talk + 1,
        at: current.playing
          ? current.at >= TRACK_TOTAL
            ? 0
            : current.at + 1
          : current.at,
        flown: current.flown >= FLIGHT_TOTAL ? 0 : current.flown + 1,
      }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const shape = open ? OPEN[kind] : COMPACT;
  const clampedBounce = Math.min(100, Math.max(0, bounce)) / 100;

  const targets = useMemo(
    () => ({
      width: shape.width,
      height: shape.height,
      radius: shape.radius,
      scale: reduced ? 1 : pressed ? 0.97 : 1,
    }),
    [shape.width, shape.height, shape.radius, pressed, reduced],
  );

  const config = useMemo(
    () => ({ stiffness: 380, damping: 34 - clampedBounce * 16, mass: 0.9 }),
    [clampedBounce],
  );

  const geometry = useSpringVector(targets, config, reduced);

  /** Two-layer content swap: the old row fades out while the new one arrives. */
  const layerKey = `${kind}-${open}`;
  const [tracked, setTracked] = useState({ key: layerKey, kind, open });
  const [animated, setAnimated] = useState(false);
  const [leaving, setLeaving] = useState<{
    key: string;
    kind: Activity;
    open: boolean;
  } | null>(null);

  if (tracked.key !== layerKey) {
    setLeaving(tracked);
    setTracked({ key: layerKey, kind, open });
    setAnimated(true);
  }

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(
      () => setLeaving(null),
      reduced ? 0 : 220,
    );
    return () => window.clearTimeout(timer);
  }, [leaving, reduced]);

  const setPaused = () =>
    setData((current) => ({ ...current, paused: !current.paused }));
  const setPlaying = () =>
    setData((current) => ({ ...current, playing: !current.playing }));
  const close = () => setOpen(false);

  const announcement = !open
    ? `${kind} island closed.`
    : kind === "Timer"
      ? `Timer island open. ${data.paused ? "Timer paused." : "Timer running."}`
      : kind === "Call"
        ? "Call island open. Mara is on a call."
        : kind === "Music"
          ? `Music island open. Soft Focus by Lumen Park. ${data.playing ? "Playing." : "Paused."}`
          : `Flight island open. SFO to YEG.`;

  const radius = geometry.radius;

  return (
    <div
      className="dyn mx-auto"
      data-reduced={reduced ? "true" : undefined}
    >
      <style>{DYNAMIC_ISLAND_CSS}</style>

      <div className="dyn-top">
        <div
          className="dyn-pill"
          data-tone={tone === "White" ? "white" : undefined}
          style={{
            width: geometry.width,
            height: geometry.height,
            borderRadius: radius,
            transform: `scale(${geometry.scale})`,
          }}
          onPointerDown={() => {
            if (!reduced) setPressed(true);
          }}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
        >
          <button
            type="button"
            className="dyn-toggle"
            aria-expanded={open}
            aria-label={open ? `Close ${kind}` : `Open ${kind}`}
            style={{ borderRadius: radius }}
            onClick={() => setOpen((value) => !value)}
          />

          <div
            className="dyn-in"
            style={{ transform: `scale(${popScale})` }}
          >
            {leaving && !reduced ? (
              <div
                key={leaving.key}
                className="dyn-layer dyn-exit"
                aria-hidden="true"
              >
                <Panel
                  kind={leaving.kind}
                  open={leaving.open}
                  data={data}
                  inert
                  onPause={setPaused}
                  onPlay={setPlaying}
                  onEnd={close}
                />
              </div>
            ) : null}

            <div
              key={layerKey}
              className={`dyn-layer${animated ? " dyn-enter" : ""}`}
            >
              <Panel
                kind={kind}
                open={open}
                data={data}
                onPause={setPaused}
                onPlay={setPlaying}
                onEnd={close}
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
