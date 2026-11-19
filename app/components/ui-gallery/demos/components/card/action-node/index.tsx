"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Copy,
  GitCommitHorizontal,
  Link2,
  Plus,
  Settings2,
} from "lucide-react";
import { ACTION_NODE_CSS } from "./action-node-css";

/* ── Bencho's constants, unchanged ──────────────────────────
   DOT / SPACING / AIR set the button size, the arc-length gap between
   buttons, and the air the block keeps above and below the card. */
const DOT = 36;
const R = DOT / 2;
const SPACING = DOT + 12;
const BEAT = 90;

const REACH = 25;
const BOUNCE = 20;
const STAGGER = 55;
const COUNT = 4;
const CORNER = 20;

const ACTS = [
  { id: "link", label: "Connect", Icon: Link2 },
  { id: "add", label: "Add a step", Icon: Plus },
  { id: "copy", label: "Duplicate", Icon: Copy },
  { id: "settings", label: "Settings", Icon: Settings2 },
] as const;

const CREW = [
  { id: "mara", name: "Mara Quinn" },
  { id: "ines", name: "Tomás Oliveira" },
  { id: "kai", name: "Lars Andersen" },
] as const;

const ON_STEP = 6;
const NODE = "Node 07";
const SAY =
  "Reads the thread, writes a summary, and posts it back to the channel it came from.";

const clamp = (value: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, value));

/** 0..100 on Bencho's scale, with the used window 20..40 → 11..16px of air. */
const gapPx = (reach: number) => 6 + (clamp(reach, 20, 40) / 100) * 24;

/* The air the block keeps above and below the card, measured at the top of
   the reach window so the box never resizes while the fan moves. */
const AIR = Math.ceil(gapPx(100) + DOT); // 52

const springOf = (tune: number) => ({
  k: 0.08 + (tune / 100) * 0.16,
  d: 0.62 + (tune / 100) * 0.2,
});

/**
 * One spring for every value that settles, ported from Bencho's lab/spring.
 * Frames, not milliseconds: `dt` is in sixtieths and the damping is raised to
 * it, so a dropped frame decays the same energy as the frames it replaced.
 */
function useSpring(target: number, tune = 50, instant = false) {
  const [at, setAt] = useState(target);
  const current = useRef(target);
  const velocity = useRef(0);
  const frame = useRef(0);

  useEffect(() => {
    if (instant) {
      current.current = target;
      velocity.current = 0;
      setAt(target);
      return;
    }

    const { k, d } = springOf(tune);
    let previous = 0;

    const tick = (time: number) => {
      const dt = previous ? clamp((time - previous) / 16.67, 0, 2.5) : 1;
      previous = time;
      velocity.current += (target - current.current) * k * dt;
      velocity.current *= Math.pow(d, dt);
      current.current += velocity.current * dt;

      if (
        Math.abs(target - current.current) < 0.02 &&
        Math.abs(velocity.current) < 0.02
      ) {
        current.current = target;
        velocity.current = 0;
        setAt(target);
        frame.current = 0;
        return;
      }

      setAt(current.current);
      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [target, tune, instant]);

  return at;
}

/**
 * The card outline pushed out by a constant distance: along the top edge,
 * round the corner on a concentric arc, then down the right edge. `s` is arc
 * length from where the corner arc meets the top edge.
 */
function ride(s: number, corner: number, offset: number) {
  const arc = Math.max(0.001, corner + offset);
  const len = (arc * Math.PI) / 2;

  if (s <= 0) return { x: -corner + s, y: -offset };
  if (s >= len) return { x: offset, y: corner + (s - len) };

  const theta = Math.PI / 2 - s / arc;
  return {
    x: -corner + arc * Math.cos(theta),
    y: corner - arc * Math.sin(theta),
  };
}

/**
 * Where a button hides: on the card's diagonal, far enough in that a whole
 * button sits behind the card. A rounded corner needs the longer path.
 */
const hideAt = (corner: number) =>
  corner >= R + 2
    ? corner * Math.SQRT2
    : Math.max(R * Math.SQRT2 + 2, corner * Math.SQRT2 + corner + 2);

const initials = (name: string) =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * 1:1 port of Bencho's "Action node" card.
 *
 * The card's four actions hide underneath its top-right corner and travel out
 * along an arc struck from that corner. Each button owns a spring; stagger is
 * a delay on each spring's target, opening first-to-last and folding back
 * last-to-first.
 *
 * Deliberate additions for the gallery: the card itself is focusable, so
 * keyboard users can open the fan (the source is pointer-only), and Escape
 * closes it. The avatars use initials because Bencho's photographs are not
 * licensed to travel.
 */
export default function Demo() {
  const n = clamp(Math.round(COUNT), 2, 4);
  const [still, setStill] = useState(false);
  const [on, setOn] = useState(false);
  const [lit, setLit] = useState([false, false, false, false]);
  const timers = useRef<number[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setStill(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const gap = still ? 0 : (clamp(STAGGER, 0, 100) / 100) * BEAT;

    for (let i = 0; i < 4; i += 1) {
      // Opening runs first to last; closing runs last to first.
      const place = on ? i : n - 1 - i;
      const at = gap * place;
      const set = () =>
        setLit((previous) => {
          if (previous[i] === on) return previous;
          const next = [...previous];
          next[i] = on;
          return next;
        });

      if (at <= 0) set();
      else timers.current.push(window.setTimeout(set, at));
    }

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [on, n, still]);

  /* Four springs, always constructed, as in the source. */
  const p0 = useSpring(lit[0] ? 100 : 0, BOUNCE, still);
  const p1 = useSpring(lit[1] ? 100 : 0, BOUNCE, still);
  const p2 = useSpring(lit[2] ? 100 : 0, BOUNCE, still);
  const p3 = useSpring(lit[3] ? 100 : 0, BOUNCE, still);
  const springAt = [p0, p1, p2, p3];

  const c = clamp(CORNER, 0, 32);
  const offset = gapPx(REACH) + R;
  const middle = ((c + offset) * Math.PI) / 4;
  const spots = Array.from({ length: n }, (_, index) =>
    ride(middle + (index - (n - 1) / 2) * SPACING, c, offset),
  );

  const deep = hideAt(c) / Math.SQRT2;
  const hidden = { x: -deep, y: deep };

  const BLEED = 6;
  const box = spots.reduce(
    (bounds, spot) => ({
      l: Math.min(bounds.l, spot.x - R - BLEED),
      r: Math.max(bounds.r, spot.x + R + BLEED),
      t: Math.min(bounds.t, spot.y - R - BLEED),
      d: Math.max(bounds.d, spot.y + R + BLEED),
    }),
    { l: 0, r: 0, t: 0, d: 0 },
  );
  const padWidth = box.r - box.l;
  const padHeight = box.d - box.t;
  const padX = -box.l;
  const padY = -box.t;

  // Cut the card's quadrant out of the reach pad, so it keeps all of the air
  // and none of the card's surface.
  const biteX = Math.max(0, padX - c);
  const biteY = Math.min(padHeight, padY + c);

  function handlePointerOut(event: ReactPointerEvent<HTMLDivElement>) {
    const to = event.relatedTarget as Node | null;
    if (to && event.currentTarget.contains(to)) return;

    // Keep the fan open while one of its buttons still owns keyboard focus.
    const active = document.activeElement;
    if (
      active &&
      active !== cardRef.current &&
      event.currentTarget.contains(active)
    ) {
      return;
    }

    setOn(false);
  }

  function handleBlur(event: ReactFocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget as Node | null;
    if (!next || !event.currentTarget.contains(next)) setOn(false);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape") return;
    setOn(false);
    cardRef.current?.focus({ preventScroll: true });
  }

  return (
    <div className="action-node-demo flex w-full justify-center">
      <style>{ACTION_NODE_CSS}</style>

      <div className="w-full max-w-[368px] [container-type:inline-size]">
        <div className="an-scaler flex justify-center">
          <div
            className="an-nod"
            style={{ paddingBlock: AIR }}
            onPointerEnter={() => setOn(true)}
            onPointerOut={handlePointerOut}
            onPointerCancel={() => setOn(false)}
            onFocus={() => setOn(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          >
            <div
              ref={cardRef}
              className="an-card"
              data-on={on || undefined}
              role="group"
              tabIndex={0}
              aria-label={`${NODE} automation step. Focus or hover to reveal four actions.`}
              style={
                {
                  "--an-r": `${c}px`,
                  "--an-mark-r": `${Math.min(15, c * 0.47).toFixed(2)}px`,
                } as CSSProperties
              }
            >
              <div className="an-top">
                <span className="an-mark" aria-hidden="true">
                  <GitCommitHorizontal size={18} strokeWidth={2} />
                </span>
                <span className="an-name">{NODE}</span>
              </div>

              <p className="an-say">{SAY}</p>

              <div className="an-chain" aria-hidden="true">
                {CREW.map((person) => (
                  <span key={person.id} className="an-link">
                    {initials(person.name)}
                  </span>
                ))}
                <span className="an-more">+{ON_STEP - CREW.length}</span>
              </div>
            </div>

            <div className="an-fan" style={{ top: AIR, right: 0 }}>
              <i
                className="an-reach"
                aria-hidden="true"
                data-on={on || undefined}
                style={{
                  left: box.l,
                  top: box.t,
                  width: padWidth,
                  height: padHeight,
                  clipPath: `polygon(0 0, ${padWidth}px 0, ${padWidth}px ${padHeight}px, ${biteX}px ${padHeight}px, ${biteX}px ${biteY}px, 0 ${biteY}px)`,
                }}
              />

              {ACTS.slice(0, n).map((action, index) => {
                // Not clamped: the spring's overshoot carries the button a
                // little past its spot and back.
                const u = clamp(springAt[index] / 100, 0, 1.4);
                const spot = spots[index];
                const put = (from: number, to: number) =>
                  from + (to - from) * u;

                return (
                  <button
                    key={action.id}
                    className="an-act"
                    type="button"
                    aria-label={action.label}
                    title={action.label}
                    tabIndex={on ? 0 : -1}
                    style={
                      {
                        width: DOT,
                        height: DOT,
                        marginTop: -R,
                        marginLeft: -R,
                        translate: `${put(hidden.x, spot.x)}px ${put(
                          hidden.y,
                          spot.y,
                        )}px`,
                        "--pop": 0.82 + 0.18 * Math.min(u, 1),
                      } as CSSProperties
                    }
                  >
                    <action.Icon size={16} strokeWidth={2} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
