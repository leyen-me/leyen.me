"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createCuePlayer, type CuePlayer, type HuddleCue } from "./cue";
import { HUDDLE_CSS } from "./huddle-css";
import { HandIcon, MicIcon, MicOffIcon, MoreIcon } from "./icons";
import { PersonOrb } from "./person-orb";

/* Bencho's geometry, unchanged: 52px orbs with a 16px gutter, a 300px card,
   a speaker change every 1.7s and a 160ms exit. */
const ORB = 52;
const GAP = 16;
const CARD_WIDTH = 300;
const SPEAKER_STEP = 1700;
const EXIT_MS = 160;

const PEOPLE = [
  { name: "Ines", hue: 268 },
  { name: "Tom", hue: 28 },
  { name: "Aiko", hue: 168 },
] as const;

const YOU = { name: "You", hue: 214 } as const;

/** Centre of slot `index` in a row of `count` orbs, relative to the room. */
const slot = (index: number, count: number) =>
  `calc(-50% + ${(index - (count - 1) / 2) * (ORB + GAP)}px)`;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1f1f0] dark:focus-visible:ring-offset-[#101010]";

const BUTTON =
  "inline-flex items-center justify-center rounded-full font-medium transition-[background-color,color,scale] duration-200 ease-out active:scale-[.96] [-webkit-tap-highlight-color:transparent]";

/**
 * 1:1 port of Bencho's "Huddle" press block.
 *
 * Three people sit in a row of 52px mesh orbs. Joining pops your orb into the
 * fourth slot while the others spring apart (the room makes room); leaving
 * shrinks your orb out and lets everyone slide back. While live, a speaker is
 * picked every 1.7s and carries a breathing ring plus a four-bar wave over the
 * orb. Sound cues are the source's Web Audio `pop`, `off` and `shift` recipes.
 *
 * Gallery additions: the source's "More" button only plays a cue, so it opens a
 * small disclosure here with a raise-hand toggle; join, leave, mute and hand
 * changes are announced through a polite live region.
 */
export default function Huddle() {
  const [joined, setJoined] = useState(false);
  const [speaker, setSpeaker] = useState(0);
  const [muted, setMuted] = useState(false);
  const [hand, setHand] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const player = useRef<CuePlayer | null>(null);
  const exitTimer = useRef(0);
  const moreRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const cue = useCallback((name: HuddleCue) => {
    player.current ??= createCuePlayer();
    player.current.play(name);
  }, []);

  useEffect(
    () => () => {
      player.current?.dispose();
      player.current = null;
      window.clearTimeout(exitTimer.current);
    },
    [],
  );

  /* Speak in turn: 1–2 slots forward each time. A muted "You" is skipped. */
  useEffect(() => {
    if (!joined) {
      setSpeaker(0);
      setMuted(false);
      return;
    }

    const id = window.setInterval(() => {
      setSpeaker((current) => {
        let next = (current + 1 + Math.floor(Math.random() * 2)) % 4;
        if (mutedRef.current && next === 3) next = 0;
        return next;
      });
    }, SPEAKER_STEP);

    return () => window.clearInterval(id);
  }, [joined]);

  useEffect(() => {
    if (muted && speaker === 3) setSpeaker(0);
  }, [muted, speaker]);

  /* Dismiss the options disclosure on an outside press or Escape. */
  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target)) return;
      if (moreRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      moreRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  function toggleJoin() {
    setMenuOpen(false);

    if (joined) {
      setJoined(false);
      setMuted(false);
      setHand(false);
      setExiting(true);
      window.clearTimeout(exitTimer.current);
      exitTimer.current = window.setTimeout(() => setExiting(false), EXIT_MS);
      cue("leave");
      setAnnouncement(
        "You left the huddle. Three people are still in the room.",
      );
      return;
    }

    window.clearTimeout(exitTimer.current);
    setExiting(false);
    setSpeaker(0);
    setJoined(true);
    cue("join");
    setAnnouncement("You joined the huddle. Four people are in the room.");
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    cue("mute");
    setAnnouncement(next ? "Microphone muted." : "Microphone on.");
  }

  function toggleHand() {
    const next = !hand;
    setHand(next);
    setMenuOpen(false);
    cue("mute");
    setAnnouncement(next ? "Hand raised." : "Hand lowered.");
    moreRef.current?.focus();
  }

  const roster = joined ? [...PEOPLE, YOU] : PEOPLE;
  const count = roster.length;

  return (
    <div className="flex w-full justify-center">
      <style>{HUDDLE_CSS}</style>

      <div className="w-full max-w-[340px] p-5">
        <section
          aria-label="Design huddle voice room"
          className="mx-auto w-full select-none rounded-panel bg-surface-0 p-4 text-zinc-900 dark:text-zinc-50"
          style={{ maxWidth: CARD_WIDTH }}
        >
          <p className="text-base font-medium leading-[22px] tracking-[-0.01em]">
            Design huddle
          </p>

          <ul aria-label="Participants" className="relative mt-4 h-[76px]">
            {roster.map((person, index) => {
              const isYou = person === YOU;
              const talking = joined && speaker === index;

              return (
                <li
                  key={person.name}
                  className="huddle-person absolute top-0 flex w-[52px] flex-col items-center gap-2"
                  style={{ "--huddle-x": slot(index, count) } as CSSProperties}
                  data-muted={isYou && muted ? "true" : undefined}
                >
                  <span className="relative block">
                    <span
                      aria-hidden="true"
                      className={`huddle-ring pointer-events-none absolute -inset-[3px] rounded-full border-[1.5px] border-zinc-900/35 transition-opacity duration-200 dark:border-white/45 ${
                        talking ? "huddle-breathe opacity-100" : "opacity-0"
                      }`}
                    />
                    <PersonOrb hue={person.hue} talking={talking} />
                    {isYou && hand ? (
                      <span
                        aria-hidden="true"
                        title="Hand raised"
                        className="absolute -right-1 -top-1 grid h-[18px] w-[18px] place-items-center rounded-full bg-surface-0 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                      >
                        <HandIcon className="h-2.5 w-2.5" />
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={`text-xs leading-4 transition-colors duration-150 ${
                      talking
                        ? "font-medium text-zinc-900 dark:text-zinc-50"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {person.name}
                  </span>
                </li>
              );
            })}

            {!joined && exiting ? (
              <li
                key="you-exit"
                className="huddle-person huddle-exit absolute top-0 flex w-[52px] flex-col items-center gap-2"
                style={{ "--huddle-x": slot(3, 4) } as CSSProperties}
              >
                <span className="relative block">
                  <PersonOrb hue={YOU.hue} talking={false} />
                </span>
                <span className="text-xs leading-4 text-zinc-500 dark:text-zinc-400">
                  You
                </span>
              </li>
            ) : null}
          </ul>

          <div className="relative mt-4 flex gap-2">
            {joined ? (
              <>
                <button
                  type="button"
                  aria-label={muted ? "Unmute microphone" : "Mute microphone"}
                  aria-pressed={muted}
                  onClick={toggleMute}
                  className={`${BUTTON} ${FOCUS_RING} huddle-meta-in h-10 w-10 shrink-0 ${
                    muted
                      ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
                      : "bg-zinc-900/[0.06] text-zinc-900 hover:bg-zinc-900/[0.1] dark:bg-white/10 dark:text-zinc-50 dark:hover:bg-white/15"
                  }`}
                >
                  {muted ? <MicOffIcon /> : <MicIcon />}
                </button>

                <button
                  ref={moreRef}
                  type="button"
                  aria-label="More options"
                  aria-expanded={menuOpen}
                  aria-controls={menuId}
                  onClick={() => {
                    setMenuOpen((open) => !open);
                    cue("mute");
                  }}
                  className={`${BUTTON} ${FOCUS_RING} huddle-meta-in h-10 w-10 shrink-0 bg-zinc-900/[0.06] text-zinc-900 hover:bg-zinc-900/[0.1] dark:bg-white/10 dark:text-zinc-50 dark:hover:bg-white/15`}
                >
                  <MoreIcon />
                </button>
              </>
            ) : null}

            <button
              type="button"
              aria-pressed={joined}
              onClick={toggleJoin}
              className={`${BUTTON} ${FOCUS_RING} h-10 flex-1 px-3 text-sm ${
                joined
                  ? "bg-[#e5484d] text-white hover:bg-[#d93f44]"
                  : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
              }`}
            >
              <span>{joined ? "Leave" : "Join huddle"}</span>
            </button>

            {menuOpen && joined ? (
              <div
                ref={menuRef}
                id={menuId}
                role="group"
                aria-label="Huddle options"
                className="absolute bottom-full right-0 z-10 mb-2 w-44 rounded-panel border border-zinc-200 bg-surface-0 p-1 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <button
                  type="button"
                  aria-pressed={hand}
                  onClick={toggleHand}
                  className={`${FOCUS_RING} flex h-9 w-full items-center gap-2 rounded-item px-2.5 text-[13px] font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-700 ${
                    hand ? "bg-zinc-100 dark:bg-zinc-700" : ""
                  }`}
                >
                  <HandIcon className="h-3.5 w-3.5" />
                  <span className="flex-1 text-left">
                    {hand ? "Lower hand" : "Raise hand"}
                  </span>
                </button>
              </div>
            ) : null}
          </div>

          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {announcement}
          </p>
        </section>
      </div>
    </div>
  );
}
