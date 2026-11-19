"use client";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

/*
 * A 1:1 port of Bencho's "Signature pad" drag block. The source is vector, not
 * a bitmap: every stroke is a chain of quadratic segments through point
 * midpoints, and each segment owns its stroke width. Width follows the hand's
 * velocity — `v = dist / dt`, fast ink thins, slow ink pools — then eases 35%
 * toward the new target so a single fast frame cannot notch the line.
 *
 * Bencho's numbers, unchanged: a 300 × 180 pad, a 220 ms settle, a 1500 ms
 * auto-sign, a 112 × 40 signed pill, a baseline at y = 128, and a clear that
 * un-draws the ink last-point-first over 350–2400 ms.
 */

const WIDTH = 300;
const HEIGHT = 180;
const BASELINE = 128;
const LINE_INSET = 28;
const SETTLE_MS = 220;
const SIGN_MS = 1500;

const MIN_STEP = 0.8;
const SPEED_NORM = 1.6;
const WIDTH_EASE = 0.35;
const SMOOTH_STRENGTH = 0.75;
const REWIND_MIN = 350;
const REWIND_MAX = 2400;

const DEFAULT_PEN = 40;
const DEFAULT_SMOOTH = 50;
const DEFAULT_REWIND = 50;
const DEFAULT_CORNER = 20;

type Point = { x: number; y: number; w: number };
type TrackPoint = Point & { t: number };

type SignaturePadProps = {
  /** Nib weight, 0–100. Thin 0.8–2.8 px, thick 2.2–7.2 px. */
  pen?: number;
  /** How much hand wobble is removed, 0–100. */
  smooth?: number;
  ink?: "Black" | "Blue";
  /** How fast Clear un-draws, 0–100. */
  rewind?: number;
  /** Corner in px, clamped to 0–28 like the source. */
  corner?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** The source's easeInOutQuad, used only by the clear rewind. */
const easeInOutQuad = (value: number) =>
  value < 0.5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2;

function nib(pen: number) {
  const weight = clamp(pen, 0, 100) / 100;
  return { thin: 0.8 + weight * 2, thick: 2.2 + weight * 5 };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

/**
 * One stroke as Bencho draws it: the first segment starts at the first point;
 * every later segment runs from the previous midpoint through the current
 * point to the next midpoint. A partially revealed stroke ends at a midpoint,
 * so the clear animation cuts cleanly.
 */
function strokePaths(
  stroke: Point[],
  count: number,
  key: string,
): ReactElement[] {
  const nodes: ReactElement[] = [];
  const first = stroke[0];
  if (!first || count <= 0) return nodes;

  if (count === 1 || stroke.length === 1) {
    nodes.push(
      <circle
        key={`${key}-0`}
        cx={first.x}
        cy={first.y}
        r={first.w / 2}
        fill="currentColor"
      />,
    );
    return nodes;
  }

  for (let index = 1; index < count; index++) {
    const point = stroke[index];
    const previous = stroke[index - 1];
    if (!point || !previous) continue;

    const start =
      index === 1
        ? previous
        : {
            x: (stroke[index - 2].x + previous.x) / 2,
            y: (stroke[index - 2].y + previous.y) / 2,
          };
    const end =
      index === stroke.length - 1
        ? point
        : { x: (previous.x + point.x) / 2, y: (previous.y + point.y) / 2 };

    nodes.push(
      <path
        key={`${key}-${index}`}
        d={`M${start.x.toFixed(1)} ${start.y.toFixed(1)}Q${previous.x.toFixed(
          1,
        )} ${previous.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`}
        strokeWidth={((previous.w + point.w) / 2).toFixed(2)}
      />,
    );
  }

  return nodes;
}

function buildInk(strokes: Point[][], limit: number) {
  const nodes: ReactElement[] = [];
  let remaining = limit;

  strokes.forEach((stroke, index) => {
    if (remaining <= 0) return;
    nodes.push(
      ...strokePaths(stroke, Math.min(stroke.length, remaining), String(index)),
    );
    remaining -= stroke.length;
  });

  return nodes;
}

export default function SignaturePad({
  pen = DEFAULT_PEN,
  smooth = DEFAULT_SMOOTH,
  ink = "Black",
  rewind = DEFAULT_REWIND,
  corner = DEFAULT_CORNER,
}: SignaturePadProps) {
  const reduced = usePrefersReducedMotion();
  const hintId = useId();

  const strokesRef = useRef<Point[][]>([]);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const activePointer = useRef<number | null>(null);
  const lastPoint = useRef<TrackPoint>({ x: 0, y: 0, t: 0, w: 0 });
  const settleTimer = useRef<number | undefined>(undefined);
  const signTimer = useRef<number | undefined>(undefined);
  const frame = useRef(0);

  // Pointer moves and rewind frames mutate the stroke list in place and bump a
  // revision; the SVG is derived from the ref during the resulting render.
  const [, setRevision] = useState(0);
  const [visible, setVisible] = useState<number | null>(null);
  const [settled, setSettled] = useState(false);
  const [signed, setSigned] = useState(false);
  const [rewinding, setRewinding] = useState(false);
  const [live, setLive] = useState("");

  const bump = () => setRevision((revision) => revision + 1);

  const strokes = strokesRef.current;
  const total = strokes.reduce((sum, stroke) => sum + stroke.length, 0);
  const hasInk = total > 0;
  const canEdit = hasInk && !rewinding && !signed;
  const radius = clamp(corner, 0, 28);
  const inner = Math.min(
    14,
    Math.max(0, radius - 10 * Math.min(1, radius / 20)),
  );
  const nodes = buildInk(strokes, visible ?? Number.POSITIVE_INFINITY);

  useEffect(() => {
    return () => {
      window.clearTimeout(settleTimer.current);
      window.clearTimeout(signTimer.current);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  function clearTimers() {
    window.clearTimeout(settleTimer.current);
    window.clearTimeout(signTimer.current);
  }

  function mapPoint(clientX: number, clientY: number): Point {
    const surface = surfaceRef.current;
    if (!surface) return { x: 0, y: 0, w: 0 };

    const rect = surface.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0, w: 0 };

    return {
      x: ((clientX - rect.left) * WIDTH) / rect.width,
      y: ((clientY - rect.top) * HEIGHT) / rect.height,
      w: 0,
    };
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (signed || rewinding || drawing.current) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Capture is an optimisation; drawing still works over the pad.
    }

    activePointer.current = event.pointerId;
    drawing.current = true;
    clearTimers();
    setSettled(false);
    setSigned(false);

    const point = mapPoint(event.clientX, event.clientY);
    const { thin, thick } = nib(pen);
    const width = (thin + thick) / 2;
    const start = { ...point, w: width };

    lastPoint.current = { ...start, t: performance.now() };
    strokesRef.current.push([start]);
    bump();
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drawing.current || activePointer.current !== event.pointerId) return;

    const target = mapPoint(event.clientX, event.clientY);
    const previous = lastPoint.current;

    // Bencho eases the incoming point toward the last one: higher smoothing
    // keeps less of the hand's wobble, never more than 75%.
    const follow = 1 - (clamp(smooth, 0, 100) / 100) * SMOOTH_STRENGTH;
    const x = previous.x + (target.x - previous.x) * follow;
    const y = previous.y + (target.y - previous.y) * follow;
    const distance = Math.hypot(x - previous.x, y - previous.y);
    if (distance < MIN_STEP) return;

    const now = performance.now();
    const speed = distance / Math.max(1, now - previous.t);
    const { thin, thick } = nib(pen);
    const targetWidth =
      thick - (thick - thin) * clamp(speed / SPEED_NORM, 0, 1);
    const width = previous.w + (targetWidth - previous.w) * WIDTH_EASE;

    lastPoint.current = { x, y, t: now, w: width };
    strokesRef.current[strokesRef.current.length - 1]?.push({
      x,
      y,
      w: width,
    });
    bump();
  }

  function finishStroke() {
    if (!drawing.current) return;

    drawing.current = false;
    activePointer.current = null;
    clearTimers();
    if (!strokesRef.current.some((stroke) => stroke.length > 0)) return;

    // 220 ms of stillness fades the ink and the baseline; 1500 ms signs it.
    settleTimer.current = window.setTimeout(() => {
      if (!drawing.current && strokesRef.current.length > 0) setSettled(true);
    }, SETTLE_MS);

    signTimer.current = window.setTimeout(() => {
      if (drawing.current || strokesRef.current.length === 0) return;
      setSettled(true);
      setSigned(true);
      setLive("Signed. Activate the Signed button to sign again.");
    }, SIGN_MS);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (activePointer.current !== event.pointerId) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // The browser may already have released it.
    }
    finishStroke();
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    if (activePointer.current !== event.pointerId) return;
    finishStroke();
  }

  function handleLostPointerCapture(event: ReactPointerEvent<HTMLDivElement>) {
    if (activePointer.current !== event.pointerId) return;
    finishStroke();
  }

  function clear() {
    if (drawing.current || signed || rewinding || total === 0) return;

    clearTimers();
    setSettled(false);
    setSigned(false);

    if (reduced) {
      strokesRef.current = [];
      setVisible(null);
      bump();
      setLive("Signature cleared.");
      return;
    }

    setRewinding(true);
    setLive("Clearing signature.");
    const duration = clamp(
      total * (2 + ((100 - clamp(rewind, 0, 100)) / 100) * 8),
      REWIND_MIN,
      REWIND_MAX,
    );
    const startedAt = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      setVisible(Math.round(total * (1 - easeInOutQuad(progress))));

      if (progress < 1) {
        frame.current = requestAnimationFrame(step);
        return;
      }

      strokesRef.current = [];
      setVisible(null);
      setRewinding(false);
      bump();
      setLive("Signature cleared.");
    };

    frame.current = requestAnimationFrame(step);
  }

  function undo() {
    if (
      drawing.current ||
      signed ||
      rewinding ||
      strokesRef.current.length === 0
    )
      return;

    clearTimers();
    setSettled(false);
    strokesRef.current.pop();
    bump();
    setLive(
      strokesRef.current.length > 0
        ? "Last stroke undone."
        : "Signature cleared.",
    );

    if (strokesRef.current.length === 0) {
      surfaceRef.current?.focus({ preventScroll: true });
    }
  }

  function reset() {
    clearTimers();
    cancelAnimationFrame(frame.current);
    strokesRef.current = [];
    setVisible(null);
    setRewinding(false);
    setSettled(false);
    setSigned(false);
    bump();
    setLive("Ready for a new signature.");
    surfaceRef.current?.focus({ preventScroll: true });
  }

  return (
    <>
      <div className="sig-frame">
        <div
          ref={surfaceRef}
          className="sig"
          data-ink={ink}
          data-inked={hasInk || undefined}
          data-settled={settled || signed || undefined}
          data-signed={signed || undefined}
          data-actions={canEdit || undefined}
          style={
            {
              "--sig-r": `${radius}px`,
              "--sig-inner": `${inner}px`,
            } as CSSProperties
          }
          role="group"
          aria-label="Signature pad"
          aria-describedby={hintId}
          tabIndex={-1}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onLostPointerCapture={handleLostPointerCapture}
          onContextMenu={(event) => event.preventDefault()}
        >
          <div className="sig-face">
            <span
              className="sig-line"
              style={{ top: BASELINE, left: LINE_INSET, right: LINE_INSET }}
              aria-hidden="true"
            />
            <span className="sig-hint" aria-hidden="true">
              Sign here
            </span>
            <svg
              className="sig-ink"
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              width={WIDTH}
              height={HEIGHT}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-label={hasInk ? "Signature" : "Empty signature pad"}
            >
              {nodes}
            </svg>
          </div>

          <div
            className="sig-actions"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="sig-btn"
              disabled={!canEdit}
              tabIndex={canEdit ? 0 : -1}
              onClick={undo}
            >
              Undo
            </button>
            <button
              type="button"
              className="sig-btn"
              disabled={!canEdit}
              tabIndex={canEdit ? 0 : -1}
              onClick={clear}
            >
              Clear
            </button>
          </div>

          <span className="sig-said">
            {signed ? (
              <button
                type="button"
                className="sig-pill"
                aria-label="Signed. Sign again"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={reset}
              >
                <svg
                  className="sig-check"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Signed
              </button>
            ) : null}
          </span>

          <p id={hintId} className="sr-only">
            Draw a signature with a mouse, finger, or stylus. Undo and Clear are
            available while the pad is editable. The pad signs itself after a
            short pause.
          </p>
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {live}
      </p>
    </>
  );
}
