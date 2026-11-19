"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { CardArt } from "./card-art";
import {
  CARDS,
  DECK_HEIGHT,
  DECK_WIDTH,
  STAGE_HEIGHT,
  STAGE_INSET_BOTTOM,
  STAGE_INSET_LEFT,
  STAGE_WIDTH,
  cqw,
  slot,
  type CardId,
} from "./deck";

/** Drag response is clamped with tanh(160), exactly like the source. */
const DRAG_CLAMP = 160;
/** Below this many px a release counts as a tap and sends the card back. */
const TAP_DISTANCE = 6;
/** Dragged further than this and the card is thrown to the back. */
const THROW_DISTANCE = 70;
/** A quick flick only needs this much travel: px per ms, then px. */
const FLICK_SPEED = 0.6;
const FLICK_DISTANCE = 24;

type DragState = {
  id: CardId;
  /** Bencho's preview player replays events; trusted input cancels a scripted drag. */
  real: boolean;
  pointerId: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  startedAt: number;
};

type CardSwapProps = {
  /** Swap on an interval while idle. Bencho's default is off. */
  auto?: boolean;
  /** Seconds between automatic swaps, minimum 1.5. */
  every?: number;
};

function cardStyle(index: number): CSSProperties {
  return { zIndex: CARDS.length - index, "--t": slot(index) } as CSSProperties;
}

/**
 * A 1:1 port of Bencho's "Card swap" block.
 *
 * The order array is the only state. Every card sits in a fixed slot; changing
 * the order animates each card's `--t` custom property with one CSS transition.
 * While dragging, the front card's transform is written imperatively so the
 * pointer path never re-renders React.
 *
 * Bencho plays a `swoop` cue on each swap; the gallery stays silent, so that
 * call is the only part of the block that is not ported.
 */
function CardSwap({ auto = false, every = 4 }: CardSwapProps) {
  const [order, setOrder] = useState<CardId[]>(() => CARDS.map((card) => card.id));
  const cardRefs = useRef<Partial<Record<CardId, HTMLDivElement | null>>>({});
  const interaction = useRef<{ hover: boolean; drag: DragState | null }>({
    hover: false,
    drag: null,
  });
  /** Window listeners for the active drag; also cleaned up on unmount. */
  const teardownPointer = useRef<() => void>(() => {});
  const focusNext = useRef(false);

  /** Drop the imperative drag styles so the slot transition takes over again. */
  const settle = useCallback(() => {
    for (const card of Object.values(cardRefs.current)) {
      if (!card) continue;
      card.style.transition = "";
      card.style.transform = "";
    }
  }, []);

  const advance = useCallback(
    (moveFocus = false) => {
      settle();
      focusNext.current = moveFocus;
      setOrder((current) => [...current.slice(1), current[0]]);
    },
    [settle]
  );

  useEffect(() => {
    return () => teardownPointer.current();
  }, []);

  /** Keep keyboard focus on whichever card is now on top. */
  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    const front = order[0];
    if (front) cardRefs.current[front]?.focus({ preventScroll: true });
  }, [order]);

  useEffect(() => {
    if (!auto) return;
    const interval = window.setInterval(() => {
      const { hover, drag } = interaction.current;
      if (!hover && !drag && !document.hidden) advance();
    }, Math.max(1.5, every) * 1000);
    return () => window.clearInterval(interval);
  }, [advance, auto, every]);

  function handlePointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    id: CardId,
    isFront: boolean
  ) {
    const state = interaction.current;

    // A real pointer cancels any scripted drag left behind by a replay.
    if (state.drag && event.nativeEvent.isTrusted && !state.drag.real) {
      teardownPointer.current();
      state.drag = null;
      settle();
    }

    if (!isFront || state.drag || event.button !== 0) return;

    const card = cardRefs.current[id];
    if (!card) return;
    state.drag = {
      id,
      real: event.nativeEvent.isTrusted,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      dx: 0,
      dy: 0,
      startedAt: performance.now(),
    };
    card.style.transition = "none";

    const damp = (value: number) => DRAG_CLAMP * Math.tanh(value / DRAG_CLAMP);
    const owns = (native: PointerEvent) => {
      const drag = state.drag;
      return (
        drag !== null &&
        native.pointerId === drag.pointerId &&
        native.isTrusted === drag.real
      );
    };

    const move = (native: PointerEvent) => {
      const drag = state.drag;
      if (!drag || !owns(native)) return;
      drag.dx = native.clientX - drag.x;
      drag.dy = native.clientY - drag.y;
      const x = damp(drag.dx);
      const y = damp(drag.dy);
      card.style.transform = `${slot(0)} translate(${cqw(x)}, ${cqw(
        y
      )}) rotate(${(x * 0.05).toFixed(2)}deg)`;
    };

    const end = (native: PointerEvent) => {
      const drag = state.drag;
      if (!drag || !owns(native)) return;
      state.drag = null;
      teardownPointer.current();

      const distance = Math.hypot(drag.dx, drag.dy);
      const flick = distance / Math.max(1, performance.now() - drag.startedAt) > FLICK_SPEED;
      const thrown =
        native.type !== "pointercancel" &&
        (distance < TAP_DISTANCE ||
          distance > THROW_DISTANCE ||
          (flick && distance > FLICK_DISTANCE));

      // A tap, a throw or a quick flick advances; anything else springs back.
      if (thrown) {
        advance(true);
        return;
      }
      settle();
    };

    const teardown = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      teardownPointer.current = () => {};
    };

    teardownPointer.current = teardown;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    advance(true);
  }

  const front = CARDS.find((card) => card.id === order[0]);

  return (
    <div
      role="group"
      aria-label="Card deck"
      className="relative w-full max-w-[360px] select-none rounded-[28px] bg-[#f1f2f2] [-webkit-tap-highlight-color:transparent] [container-type:inline-size] dark:bg-[#171717]"
      style={{ aspectRatio: `${DECK_WIDTH} / ${DECK_HEIGHT}` }}
      onPointerEnter={() => {
        interaction.current.hover = true;
      }}
      onPointerLeave={() => {
        interaction.current.hover = false;
      }}
    >
      <div
        className="absolute"
        style={{
          width: cqw(STAGE_WIDTH),
          height: cqw(STAGE_HEIGHT),
          left: cqw(STAGE_INSET_LEFT),
          bottom: cqw(STAGE_INSET_BOTTOM),
          perspective: cqw(1000),
          perspectiveOrigin: `${cqw(150)} ${cqw(95)}`,
        }}
      >
        {CARDS.map((card) => {
          const index = order.indexOf(card.id);
          const isFront = index === 0;

          return (
            <div
              key={card.id}
              ref={(node) => {
                cardRefs.current[card.id] = node;
              }}
              data-front={isFront || undefined}
              aria-hidden={!isFront}
              style={{ ...cardStyle(index), borderRadius: cqw(20), padding: cqw(3) }}
              className={`absolute inset-0 bg-white shadow-[0_0_0_1px_rgba(23,24,26,0.12)] [backface-visibility:hidden] [transform:var(--t)] transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:bg-[#0e0f11] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] ${
                isFront ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              <CardArt id={card.id} />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute rounded-full bg-white text-[13px] font-medium leading-normal text-[#17181a] dark:bg-[#0e0f11] dark:text-white"
                style={{
                  bottom: cqw(14),
                  left: cqw(14),
                  padding: `${cqw(6)} ${cqw(12)}`,
                }}
              >
                {card.title}
              </span>

              {/* Only the top card is a real control; the rest are scenery. */}
              {isFront ? (
                <button
                  type="button"
                  aria-label={`${card.title}, top card. Swipe, throw or press Enter to send it to the back.`}
                  onPointerDown={(event) => handlePointerDown(event, card.id, isFront)}
                  onKeyDown={handleKeyDown}
                  className="absolute cursor-grab touch-none rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1f2f2] active:cursor-grabbing dark:focus-visible:ring-offset-[#171717]"
                  style={{ inset: cqw(-3), borderRadius: cqw(20) }}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {front ? `${front.title} is on top.` : ""}
      </p>
    </div>
  );
}

export default function Demo() {
  return <CardSwap />;
}
