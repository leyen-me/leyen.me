"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { CardArt, CARD_ART } from "./card-art";
import {
  ARC_STEP,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  BOUNCE,
  box,
  CARD_COUNT,
  CARD_HEIGHT,
  CARD_LEFT,
  CARD_TOP,
  CARD_WIDTH,
  CORNER,
  cqw,
  FLIP_IN,
  HIT_CLOSED,
  HIT_OPEN,
  lerp,
  LIFT,
  MAX_CARDS,
  PLACE_BACK,
  REST_ROTATION,
  SCALE_STEP,
  STACK_GAP,
  STAGGER,
  VIEW_HEIGHT,
  VIEW_RADIUS,
  VIEW_TRANSFORM,
  VIEW_WIDTH,
} from "./deck";
import { useReducedMotion, useSprings } from "./springs";

type Viewing = { id: number; from: string };
type Pose = { rot: number; scale: number };

const TILT = 6;
const CENTER = (CARD_COUNT - 1) / 2;

/**
 * A 1:1 port of Bencho's "Card stack" block.
 *
 * `order` is the only deck state: slot `t` paints `order[CARD_COUNT - 1 - t]`,
 * so the front of the deck is the tail of the array. Reaching the deck opens
 * the fan with one spring per card, cascading from the front card backwards;
 * hovering a card lifts its face, and pressing one sends it — flipped — to the
 * middle of the board. Clicking away or pressing Escape puts it on top with a
 * short shuffle.
 *
 * Bencho's photographic deck is replaced with original inline SVG artwork;
 * its four sound cues are not ported, matching the rest of this gallery.
 */
export default function CardStack() {
  const reduced = useReducedMotion();
  const [order, setOrder] = useState<number[]>(() =>
    Array.from({ length: CARD_COUNT }, (_, index) => index)
  );
  const [viewing, setViewing] = useState<Viewing | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [lit, setLit] = useState<boolean[]>(() => Array(MAX_CARDS).fill(false));

  const expanded = hovered || viewing !== null;
  const goals = useMemo(() => lit.map((value) => (value ? 100 : 0)), [lit]);
  const values = useSprings(goals, BOUNCE, reduced);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<HTMLSpanElement | null>(null);
  const tiltRef = useRef<HTMLSpanElement | null>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const faceRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const poses = useRef<Array<Pose>>(
    Array.from({ length: MAX_CARDS }, () => ({ rot: 0, scale: 1 }))
  );
  const closing = useRef(false);
  const opened = useRef(false);
  const hadView = useRef(false);
  const closeAnimation = useRef<Animation | null>(null);

  useEffect(
    () => () => {
      closeAnimation.current?.cancel();
    },
    []
  );

  /** Opening cascades from the front card backwards; closing unwinds from the back. */
  useEffect(() => {
    const timers: number[] = [];
    const step = reduced ? 0 : STAGGER;

    for (let slot = 0; slot < MAX_CARDS; slot += 1) {
      const stagger = expanded ? CARD_COUNT - 1 - slot : slot;
      const apply = () =>
        setLit((current) => {
          if (current[slot] === expanded) return current;
          const next = current.slice();
          next[slot] = expanded;
          return next;
        });

      if (step * stagger <= 0) apply();
      else timers.push(window.setTimeout(apply, step * stagger));
    }

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [expanded, reduced]);

  /**
   * The enlarged card continues from wherever its face currently sits. Bencho
   * converts the measured distance into board coordinates, then to the same
   * container units the layout uses.
   */
  const measure = useCallback((slot: number) => {
    const board = boardRef.current?.getBoundingClientRect();
    const face = faceRefs.current[slot]?.getBoundingClientRect();
    const pose = poses.current[slot] ?? { rot: 0, scale: 1 };
    if (!board || !face || !board.width) return VIEW_TRANSFORM;

    const unit = board.width / BOARD_WIDTH;
    const dx = (face.left + face.width / 2 - (board.left + board.width / 2)) / unit;
    const dy = (face.top + face.height / 2 - (board.top + board.height / 2)) / unit;
    const scale = (CARD_WIDTH / VIEW_WIDTH) * pose.scale;

    return `perspective(2000px) translate(${cqw(dx)}, ${cqw(dy)}) rotate(${pose.rot.toFixed(
      3
    )}deg) rotateY(0deg) scale(${scale.toFixed(4)})`;
  }, []);

  const openCard = useCallback(
    (slot: number) => {
      if (closing.current || opened.current) return;
      const id = order[CARD_COUNT - 1 - slot];
      if (id === undefined) return;
      opened.current = true;
      setViewing({ id, from: measure(slot) });
    },
    [measure, order]
  );

  const closeView = useCallback(() => {
    const current = viewing;
    if (!current || closing.current) return;

    closing.current = true;
    if (tiltRef.current) tiltRef.current.style.transform = "";

    const target = measure(CARD_COUNT - 1);
    const nextOrder = [current.id, ...order.filter((id) => id !== current.id)];
    if (order[0] !== current.id) setShuffle(true);
    setOrder(nextOrder);

    const finish = () => {
      closing.current = false;
      opened.current = false;
      closeAnimation.current = null;
      setViewing(null);
      setShuffle(false);
      setActive(null);
    };

    const element = viewRef.current;
    if (!element || reduced) {
      finish();
      return;
    }

    const animation = element.animate(
      [{ transform: VIEW_TRANSFORM }, { transform: target }],
      { duration: PLACE_BACK, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" }
    );
    closeAnimation.current = animation;
    animation.onfinish = finish;
  }, [measure, order, reduced, viewing]);

  /** Fly the chosen card into the middle of the board. */
  useEffect(() => {
    if (!viewing) return;
    const element = viewRef.current;
    if (!element) return;

    const animation = element.animate(
      [{ transform: viewing.from }, { transform: VIEW_TRANSFORM }],
      {
        duration: reduced ? 1 : FLIP_IN,
        easing: reduced ? "linear" : "cubic-bezier(0.25, 0.8, 0.25, 1)",
        fill: "both",
      }
    );
    element.focus({ preventScroll: true });

    return () => animation.cancel();
  }, [viewing, reduced]);

  /** Clicking outside the enlarged card, or Escape, puts it back. */
  useEffect(() => {
    if (!viewing) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!event.isTrusted) return;
      const target = event.target;
      if (viewRef.current && target instanceof Node && viewRef.current.contains(target)) return;
      closeView();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeView();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [viewing, closeView]);

  /** Return keyboard focus to the card that is now on top. */
  useEffect(() => {
    if (viewing) {
      hadView.current = true;
      return;
    }
    if (!hadView.current) return;
    hadView.current = false;
    cardRefs.current[CARD_COUNT - 1]?.focus({ preventScroll: true });
  }, [viewing]);

  function handleTilt(event: ReactPointerEvent<HTMLSpanElement>) {
    const element = tiltRef.current;
    if (!element || reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.min(1, Math.max(-1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
    const y = Math.min(1, Math.max(-1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
    element.style.transform = `rotateX(${(y * TILT).toFixed(2)}deg) rotateY(${(
      x * TILT
    ).toFixed(2)}deg)`;
  }

  const hit = expanded ? HIT_OPEN : HIT_CLOSED;
  const front = CARD_ART[order[CARD_COUNT - 1] ?? 0] ?? CARD_ART[0];
  const viewedArt = viewing ? CARD_ART[viewing.id] : null;

  return (
    <div className="w-full max-w-[472px] select-none">
      <div
        ref={boardRef}
        role="group"
        aria-label="Card stack"
        className="pointer-events-none relative w-full touch-manipulation [-webkit-tap-highlight-color:transparent] [container-type:inline-size]"
        style={{ aspectRatio: `${BOARD_WIDTH} / ${BOARD_HEIGHT}` }}
        onPointerOver={() => {
          if (!hovered) setHovered(true);
        }}
        onPointerOut={(event) => {
          const next = event.relatedTarget;
          if (next instanceof Node && event.currentTarget.contains(next)) return;
          setHovered(false);
          setActive(null);
        }}
        onPointerCancel={() => {
          setHovered(false);
          setActive(null);
        }}
      >
        {/* Keeps the fan's empty middle from holding a card in its lifted state. */}
        <span
          aria-hidden="true"
          className="pointer-events-auto absolute"
          style={box(hit)}
          onPointerOver={() => setActive(null)}
        />

        {Array.from({ length: CARD_COUNT }, (_, slot) => {
          const depth = CARD_COUNT - 1 - slot;
          const id = order[depth];
          const open = (values[slot] ?? 0) / 100;
          const rotateOpen = (slot - CENTER) * ARC_STEP;
          const rotateRest = rotateOpen * REST_ROTATION;
          const rotation = lerp(rotateRest, rotateOpen, open);
          const offsetY = -(depth * STACK_GAP) * (1 - open);
          const scale = 1 - depth * SCALE_STEP * (1 - open);
          const lifted = expanded && active === slot && !viewing;
          const hidden = viewing?.id === id;
          const title = CARD_ART[id]?.title ?? "Card";

          poses.current[slot] = { rot: rotation, scale };

          const cardStyle: CSSProperties = {
            left: cqw(CARD_LEFT),
            top: cqw(CARD_TOP),
            width: cqw(CARD_WIDTH),
            height: cqw(CARD_HEIGHT),
            borderRadius: cqw(CORNER),
            transformOrigin: `50% ${cqw(CARD_HEIGHT / 2 + 260)}`,
            transform: `translate(0px, ${cqw(offsetY)}) rotate(${rotation.toFixed(3)}deg)`,
            zIndex: slot + 1,
            visibility: hidden ? "hidden" : undefined,
          };

          return (
            <button
              key={id}
              ref={(node) => {
                cardRefs.current[slot] = node;
              }}
              type="button"
              aria-label={`Open ${title}, card ${slot + 1} of ${CARD_COUNT}`}
              tabIndex={viewing || hidden ? -1 : undefined}
              style={cardStyle}
              className={`pointer-events-auto absolute cursor-pointer touch-manipulation appearance-none border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1f2f2] motion-reduce:transition-none dark:focus-visible:ring-offset-[#171717] ${
                shuffle
                  ? "transition-transform duration-[460ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  : "transition-opacity duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              }`}
              onPointerEnter={() => {
                if (active !== slot) setActive(slot);
              }}
              onPointerDown={(event) => {
                if (event.button === 0) openCard(slot);
              }}
              onClick={(event) => {
                // Pointer presses already opened on pointerdown; this covers
                // keyboard and assistive-technology activation (detail 0).
                if (event.detail === 0) openCard(slot);
              }}
            >
              <span
                ref={(node) => {
                  faceRefs.current[slot] = node;
                }}
                data-lift={lifted || undefined}
                className={`absolute inset-0 block overflow-hidden bg-surface-0 [backface-visibility:hidden] ${
                  lifted
                    ? "ring-1 ring-inset ring-zinc-900/10 transition-[translate] delay-[15ms] duration-[300ms] ease-[cubic-bezier(0.2,0.7,0.3,1)]"
                    : "ring-1 ring-inset ring-zinc-900/10 transition-[translate] duration-[480ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                }`}
                style={{
                  borderRadius: cqw(CORNER),
                  scale: scale.toFixed(4),
                  translate: lifted ? `0px ${cqw(-LIFT)}` : "0px 0px",
                }}
              >
                <CardArt index={id} />
              </span>
            </button>
          );
        })}

        {viewing ? (
          <span
            ref={viewRef}
            role="img"
            tabIndex={-1}
            aria-label="Card in view. Click outside or press Escape to put it back."
            className="pointer-events-auto absolute z-20 cursor-default outline-none [transform-style:preserve-3d] will-change-transform focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1f2f2] dark:focus-visible:ring-offset-[#171717]"
            style={{
              left: cqw((BOARD_WIDTH - VIEW_WIDTH) / 2),
              top: cqw((BOARD_HEIGHT - VIEW_HEIGHT) / 2),
              width: cqw(VIEW_WIDTH),
              height: cqw(VIEW_HEIGHT),
              transform: viewing.from,
            }}
            onPointerMove={handleTilt}
            onPointerLeave={() => {
              if (tiltRef.current) tiltRef.current.style.transform = "";
            }}
          >
            <span
              ref={tiltRef}
              className="absolute inset-0 [transform-style:preserve-3d] transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            >
              <span
                className="absolute inset-0 block overflow-hidden bg-surface-0 [backface-visibility:hidden]"
                style={{ borderRadius: cqw(VIEW_RADIUS) }}
              >
                <CardArt index={viewing.id} />
              </span>
              <span
                className="absolute inset-0 block overflow-hidden bg-surface-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
                style={{ borderRadius: cqw(VIEW_RADIUS) }}
              >
                <CardArt index={viewing.id} />
              </span>
            </span>
          </span>
        ) : null}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {viewedArt
          ? `${viewedArt.title} is in view. Press Escape or click away to put it back.`
          : `${front.title} is on top of the deck.`}
      </p>
    </div>
  );
}
