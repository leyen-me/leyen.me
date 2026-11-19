"use client";

import {
  type AnimationEvent as ReactAnimationEvent,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { EMOJI } from "./emoji";
import { EmojiGlyph } from "./emoji-glyph";
import { REACTIONS_CSS } from "./reactions-css";
import { RollingCount } from "./rolling-count";
import { playReactionSound } from "./sound";

/** Bencho's documented defaults: magnify 50, corner 20. Bounce 45 is baked
 * into the shared cubic-bezier curves below, because the port is CSS-only. */
const MAGNIFY = 50;
const CORNER = 20;

/** One picker slot is 34 px wide; the open slab is slots plus 12 px of air. */
const EMOJI_WIDTH = 34;
const PILL_RADIUS = 24;
const PILL_HEIGHT = 48;
const LANDED_MS = 700;
const TOUCH_HOLD_MS = 260;

/** Hovered emoji grows by magnify * 0.7 * 0.01, and only that one. */
const HOVER_SCALE = 1 + (MAGNIFY / 100) * 0.34;

/** The same two chips the block starts with. */
const INITIAL_REACTIONS: Reaction[] = [
  { e: "🚀", n: 3, mine: false, landing: false },
  { e: "🔥", n: 2, mine: false, landing: false },
];

type Reaction = {
  e: string;
  n: number;
  mine: boolean;
  landing: boolean;
};

type Flight = {
  e: string;
  fx: number;
  fy: number;
  mx: number;
  my: number;
  tx: number;
  ty: number;
};

/**
 * A 1:1 port of Bencho's "Emoji reactions" block. The message slab widens into
 * a pill of emoji; choosing one hands the emoji to the row as a measured arc,
 * keeps the chip's glyph hidden until it lands, and rolls the count in from
 * `n - 1`. Springs are re-expressed as the block's own CSS curves because the
 * gallery item stays dependency-free.
 */
export default function Demo() {
  const [reactions, setReactions] = useState<Reaction[]>(INITIAL_REACTIONS);
  const [open, setOpen] = useState(false);
  const [textWidth, setTextWidth] = useState<number | null>(null);
  /** Raw pointer x inside the picker; the source keeps the same coordinate. */
  const [pointerX, setPointerX] = useState<number | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [landed, setLanded] = useState<string | null>(null);
  const [focusFirst, setFocusFirst] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const chipRefs = useRef(new Map<string, HTMLSpanElement>());
  const pendingFlight = useRef<{ e: string; fx: number; fy: number } | null>(
    null,
  );
  const closeTimer = useRef<number | undefined>(undefined);
  const touchTimer = useRef<number | undefined>(undefined);
  const landedTimer = useRef<number | undefined>(undefined);
  const touch = useRef({ active: false, sliding: false });

  const pillWidth = EMOJI_WIDTH * EMOJI.length + 12;
  const hoveredIndex =
    pointerX === null
      ? null
      : Math.max(
          0,
          Math.min(EMOJI.length - 1, Math.floor((pointerX - 6) / EMOJI_WIDTH)),
        );

  const closePicker = useCallback((delay = 0) => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      setPointerX(null);
    }, delay);
  }, []);

  const openPicker = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    if (open) return;
    setOpen(true);
    playReactionSound("hover");
  }, [open]);

  /** Returns the centre of an element in the root's coordinate space. */
  const localCentre = useCallback((element: Element) => {
    const root = rootRef.current;
    if (!root) return { x: 0, y: 0 };

    const rootRect = root.getBoundingClientRect();
    const scale = rootRect.width / (root.offsetWidth || 1) || 1;
    const rect = element.getBoundingClientRect();

    return {
      x: (rect.left + rect.width / 2 - rootRect.left) / scale,
      y: (rect.top + rect.height / 2 - rootRect.top) / scale,
    };
  }, []);

  // The slab is measured rather than hard-coded so the port keeps Bencho's
  // behaviour with whatever UI font the gallery is using.
  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const measure = () => setTextWidth(element.offsetWidth);
    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Clicking anywhere outside the picker or its trigger folds it away.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (pickerRef.current?.contains(target)) return;
      if (addRef.current?.contains(target)) return;
      closePicker();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [open, closePicker]);

  // Escape closes and gives focus back to the trigger.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closePicker();
      addRef.current?.focus();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, closePicker]);

  useEffect(() => {
    if (!open || !focusFirst) return;
    const first = pickerRef.current?.querySelector<HTMLButtonElement>(".rxn-emo");
    first?.focus();
    setFocusFirst(false);
  }, [open, focusFirst]);

  // Once the new chip exists, measure where the emoji has to land.
  useEffect(() => {
    const pending = pendingFlight.current;
    if (!pending) return;
    pendingFlight.current = null;

    const target = chipRefs.current.get(pending.e);
    if (!target) return;

    const to = localCentre(target);
    setFlight({
      e: pending.e,
      fx: pending.fx,
      fy: pending.fy,
      mx: (pending.fx + to.x) / 2,
      my: Math.min(pending.fy, to.y) - 46,
      tx: to.x,
      ty: to.y,
    });
  }, [reactions, localCentre]);

  useEffect(() => {
    return () => {
      window.clearTimeout(closeTimer.current);
      window.clearTimeout(touchTimer.current);
      window.clearTimeout(landedTimer.current);
    };
  }, []);

  function choose(emoji: string, source: Element) {
    const from = localCentre(source);
    const existing = reactions.find((reaction) => reaction.e === emoji);
    const restoreFocus = document.activeElement === source;

    setOpen(false);
    setPointerX(null);
    if (restoreFocus) addRef.current?.focus();

    if (existing?.mine) {
      playReactionSound("tock");
      return;
    }

    playReactionSound("pop");

    if (reducedMotion) {
      setReactions((current) =>
        current.some((reaction) => reaction.e === emoji)
          ? current.map((reaction) =>
              reaction.e === emoji
                ? { ...reaction, n: reaction.n + 1, mine: true }
                : reaction,
            )
          : [...current, { e: emoji, n: 1, mine: true, landing: false }],
      );
      return;
    }

    pendingFlight.current = { e: emoji, fx: from.x, fy: from.y };
    setReactions((current) =>
      current.some((reaction) => reaction.e === emoji)
        ? current.map((reaction) =>
            reaction.e === emoji
              ? {
                  ...reaction,
                  n: reaction.n + 1,
                  mine: true,
                  landing: true,
                }
              : reaction,
          )
        : [...current, { e: emoji, n: 1, mine: true, landing: true }],
    );
  }

  function finishFlight(event: ReactAnimationEvent<HTMLSpanElement>) {
    if (event.target !== event.currentTarget) return;

    const current = flight;
    if (!current) return;

    setFlight(null);
    playReactionSound("drop");
    setReactions((items) =>
      items.map((reaction) =>
        reaction.e === current.e ? { ...reaction, landing: false } : reaction,
      ),
    );
    setLanded(current.e);
    window.clearTimeout(landedTimer.current);
    landedTimer.current = window.setTimeout(() => {
      setLanded((value) => (value === current.e ? null : value));
    }, LANDED_MS);
  }

  function toggleReaction(emoji: string) {
    const target = reactions.find((reaction) => reaction.e === emoji);
    if (!target) return;

    playReactionSound(target.mine ? "off" : "pop");
    setReactions((items) =>
      items
        .map((reaction) =>
          reaction.e === emoji
            ? {
                ...reaction,
                n: reaction.mine ? reaction.n - 1 : reaction.n + 1,
                mine: !reaction.mine,
              }
            : reaction,
        )
        .filter((reaction) => reaction.n > 0),
    );

    if (!target.mine) {
      setLanded(emoji);
      window.clearTimeout(landedTimer.current);
      landedTimer.current = window.setTimeout(() => {
        setLanded((value) => (value === emoji ? null : value));
      }, LANDED_MS);
    }
  }

  function handleAddClick(event: ReactMouseEvent<HTMLButtonElement>) {
    if (touch.current.active) {
      touch.current.active = false;
      return;
    }

    if (open) {
      closePicker();
      return;
    }

    openPicker();

    // A click with detail 0 came from the keyboard: continue into the menu.
    if (event.detail === 0) setFocusFirst(true);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    const isTouch =
      event.pointerType === "touch" || event.pointerType === "pen";
    touch.current.active = isTouch;

    if (!isTouch) return;

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is best-effort, exactly like the source.
    }

    window.clearTimeout(touchTimer.current);
    touch.current.sliding = false;
    touchTimer.current = window.setTimeout(() => {
      touch.current.sliding = true;
      openPicker();
    }, TOUCH_HOLD_MS);
  }

  function pickerIndexOf(clientX: number) {
    const picker = pickerRef.current;
    if (!picker) return -1;

    const rect = picker.getBoundingClientRect();
    const scale = rect.width / (picker.offsetWidth || 1) || 1;
    const x = (clientX - rect.left) / scale;
    const index = Math.floor((x - 6) / EMOJI_WIDTH);

    return index >= 0 && index < EMOJI.length ? index : -1;
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!touch.current.sliding) return;

    const picker = pickerRef.current;
    if (!picker) return;

    const rect = picker.getBoundingClientRect();
    const scale = rect.width / (picker.offsetWidth || 1) || 1;
    setPointerX((event.clientX - rect.left) / scale);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!touch.current.active) return;

    window.clearTimeout(touchTimer.current);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Released already, or capture was never granted.
    }

    if (touch.current.sliding) {
      touch.current.sliding = false;
      const index = pickerIndexOf(event.clientX);
      const button =
        index >= 0
          ? pickerRef.current?.querySelectorAll<HTMLButtonElement>(".rxn-emo")[
              index
            ]
          : undefined;

      if (button && index >= 0) {
        choose(EMOJI[index].e, button);
      } else {
        closePicker();
      }
      return;
    }

    if (open) {
      closePicker();
    } else {
      openPicker();
    }
  }

  function handlePickerKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(".rxn-emo"),
    );
    const active = document.activeElement as HTMLButtonElement | null;
    const index = active ? buttons.indexOf(active) : -1;

    let next = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % buttons.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + buttons.length) % buttons.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = buttons.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    buttons[next]?.focus();
  }

  function handleAddKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    if (!open) openPicker();
    setFocusFirst(true);
  }

  const liveText =
    reactions.length === 0
      ? "No reactions"
      : reactions.map((reaction) => `${reaction.e} ${reaction.n}`).join(", ");

  return (
    <div ref={rootRef} className="rxn-demo relative w-[300px] max-w-full pt-2">
      <style dangerouslySetInnerHTML={{ __html: REACTIONS_CSS }} />

      <div className="flex flex-col items-start gap-2">
        <div
          className="rxn-morph relative flex h-12 items-center justify-center bg-surface-0 shadow-[0_0_0_1px_rgba(23,24,26,0.08)] transition-[width,border-radius] duration-[220ms] ease-[cubic-bezier(0.24,1.34,0.38,1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
          data-open={open ? "true" : "false"}
          style={{
            width: open ? pillWidth : (textWidth ?? undefined),
            height: PILL_HEIGHT,
            borderRadius: open ? PILL_RADIUS : CORNER,
          }}
        >
          <span
            ref={textRef}
            aria-hidden={open || undefined}
            className="rxn-text font-medium tracking-[-0.01em] text-[#17181a] dark:text-white"
          >
            Shipped the new onboarding flow
          </span>

          {open ? (
            <div
              ref={pickerRef}
              role="menu"
              aria-label="Pick a reaction"
              className="absolute left-0 top-0 z-[5] flex items-center p-2"
              onPointerLeave={() => setPointerX(null)}
              onPointerMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const scale =
                  rect.width / (event.currentTarget.offsetWidth || 1) || 1;
                setPointerX((event.clientX - rect.left) / scale);
              }}
              onKeyDown={handlePickerKeyDown}
            >
              {EMOJI.map((item, index) => (
                <button
                  key={item.e}
                  type="button"
                  role="menuitem"
                  aria-label={item.label}
                  onClick={(event) => choose(item.e, event.currentTarget)}
                  onFocus={() => setPointerX(6 + index * EMOJI_WIDTH + 17)}
                  className="rxn-emo grid h-8 w-[34px] cursor-pointer place-items-center rounded-md border-0 bg-transparent p-0 text-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                  style={
                    {
                      "--s": index === hoveredIndex ? HOVER_SCALE : 1,
                      "--d": `${0.02 + index * 0.018}s`,
                    } as CSSProperties
                  }
                >
                  <span>
                    <EmojiGlyph
                      emoji={item.e}
                      play={index === hoveredIndex}
                    />
                  </span>
                </button>
              ))}

              {hoveredIndex !== null ? (
                <span
                  className="rxn-tip pointer-events-none absolute z-[7] whitespace-nowrap rounded-md bg-[#17181a] px-2 py-1 text-[11px] font-normal tracking-normal text-white"
                  style={{
                    left: 6 + hoveredIndex * EMOJI_WIDTH + EMOJI_WIDTH / 2,
                    top: -28,
                  }}
                  aria-hidden="true"
                >
                  {EMOJI[hoveredIndex].label}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative mt-2 flex min-h-9 flex-wrap items-center gap-2">
        {reactions.map((reaction) => {
          const count = reaction.landing ? reaction.n - 1 : reaction.n;

          return (
            <button
              key={reaction.e}
              type="button"
              data-emoji={reaction.e}
              data-mine={reaction.mine || undefined}
              aria-pressed={reaction.mine}
              aria-label={`${reaction.e} ${reaction.n}`}
              onClick={() => toggleReaction(reaction.e)}
              className={`rxn-chip-in flex h-9 items-center gap-2 rounded-full px-4 pl-3 text-sm font-medium tracking-[-0.01em] transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.92] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${
                reaction.mine
                  ? "bg-surface-0 text-[#2231dd] shadow-[inset_0_0_0_1px_rgba(34,49,221,0.35)] dark:text-[#8c9bff] dark:shadow-[inset_0_0_0_1px_rgba(140,155,255,0.4)]"
                  : "bg-surface-0 text-[#17181a] shadow-[inset_0_0_0_1px_rgba(23,24,26,0.06)] dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
              }`}
            >
              <span
                ref={(element) => {
                  if (element) chipRefs.current.set(reaction.e, element);
                  else chipRefs.current.delete(reaction.e);
                }}
                className={`rxn-chip-e text-[20px] leading-none tracking-[-0.02em] transition-opacity duration-150 ${
                  reaction.landing ? "opacity-0" : "opacity-100"
                }`}
              >
                <EmojiGlyph
                  emoji={reaction.e}
                  play={landed === reaction.e}
                />
              </span>
              <RollingCount value={count} />
            </button>
          );
        })}

        <button
          ref={addRef}
          type="button"
          aria-label="Add a reaction"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={handleAddClick}
          onKeyDown={handleAddKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onContextMenu={(event) => event.preventDefault()}
          className="rxn-add grid h-9 w-9 place-items-center rounded-full bg-surface-0 text-[#8a8a8c] shadow-[inset_0_0_0_1px_rgba(23,24,26,0.06)] transition-[color,transform,box-shadow] duration-150 hover:scale-[1.06] hover:text-[#17181a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 dark:text-[#8c8c8f] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] dark:hover:text-white"
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {flight ? (
        <span
          className="rxn-fly"
          aria-hidden="true"
          style={
            {
              "--fx": `${flight.fx}px`,
              "--fy": `${flight.fy}px`,
              "--mx": `${flight.mx}px`,
              "--my": `${flight.my}px`,
              "--tx": `${flight.tx}px`,
              "--ty": `${flight.ty}px`,
            } as CSSProperties
          }
          onAnimationEnd={finishFlight}
        >
          {flight.e}
        </span>
      ) : null}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveText}
      </p>
    </div>
  );
}
