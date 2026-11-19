"use client";

import {
  type CSSProperties,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/* The block's fixed geometry, unchanged. The notch is measured from the
   rendered label so the gap follows the word, and the SVG stroke sits half a
   stroke inside the box so rounding cannot clip it. */
const W = 280;
const H = 52;
const SCALE = 0.78;
const IN = 0.75;

/* Measure before paint in the browser, without tripping the SSR warning. */
const useSafeLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export type LabelInputField = "Email" | "Password";

type LabelInputProps = {
  field: LabelInputField;
  corner: number;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur: () => void;
  show?: boolean;
  onToggleShow?: () => void;
  invalid?: boolean;
  describedBy?: string;
  maxLength?: number;
};

export default function LabelInput({
  field,
  corner,
  value,
  onChange,
  onFocus,
  onBlur,
  show = false,
  onToggleShow,
  invalid = false,
  describedBy,
  maxLength,
}: LabelInputProps) {
  const id = `lbi-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const secret = field === "Password";
  const label = secret ? "Password" : "Email";

  const [focus, setFocus] = useState(false);
  const labelRef = useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = useState(40);

  useSafeLayoutEffect(() => {
    const node = labelRef.current;
    if (!node) return;

    /* The notch follows the rendered word, so remeasure if the web font
       swaps in after the first layout. */
    setLabelWidth(node.offsetWidth);
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => setLabelWidth(node.offsetWidth));
    observer.observe(node);
    return () => observer.disconnect();
  }, [label]);

  const radius = clamp(corner, 0, H / 2);
  const up = focus || value.length > 0;

  /* Never start the notch inside the corner curve: the gap has to open on
     the straight part of the top edge. */
  const lx = Math.max(14, radius + 4);
  const x0 = Math.max(radius * 0.6, lx - 5);
  const x1 = lx + labelWidth * SCALE + 5;
  const a = radius - IN;
  const R = W - IN;
  const B = H - IN;
  const mid = W / 2;

  const notchMid = (x0 + x1) / 2;
  const gapLeft = `M${notchMid},${IN} L${x0},${IN}`;
  const gapRight = `M${notchMid},${IN} L${x1},${IN}`;

  const right =
    radius > 0
      ? `M${x1},${IN} L${W - radius},${IN} A${a},${a} 0 0 1 ${R},${radius} L${R},${H - radius} A${a},${a} 0 0 1 ${W - radius},${B} L${mid},${B}`
      : `M${x1},${IN} L${R},${IN} L${R},${B} L${mid},${B}`;

  const left =
    radius > 0
      ? `M${x0},${IN} L${radius},${IN} A${a},${a} 0 0 0 ${IN},${radius} L${IN},${H - radius} A${a},${a} 0 0 0 ${radius},${B} L${mid},${B}`
      : `M${x0},${IN} L${IN},${IN} L${IN},${B} L${mid},${B}`;

  const [flip, setFlip] = useState(0);

  const reveal = () => {
    setFlip((current) => current + 1);
    onToggleShow?.();
  };

  return (
    <div
      className="lbi"
      data-up={up ? "true" : "false"}
      data-focus={focus ? "true" : "false"}
      data-filled={value.length > 0 ? "true" : "false"}
    >
      <div
        className="lbi-box"
        style={
          {
            width: W,
            height: H,
            borderRadius: radius,
            "--lbi-x": `${lx}px`,
          } as CSSProperties
        }
      >
        <svg
          className="lbi-ring"
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          aria-hidden="true"
          focusable="false"
        >
          <path d={right} />
          <path d={left} />
          <path className="lbi-gap" d={gapLeft} pathLength={1} />
          <path className="lbi-gap" d={gapRight} pathLength={1} />
        </svg>

        <label className="lbi-label" htmlFor={id} ref={labelRef}>
          {[...label].map((character, index) => (
            <span
              key={`${character}-${index}`}
              style={{ "--i": index } as CSSProperties}
            >
              {character}
            </span>
          ))}
        </label>

        <input
          id={id}
          className="lbi-field"
          data-flip={flip % 2}
          type={secret && !show ? "password" : secret ? "text" : "email"}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          maxLength={maxLength}
          value={value}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => {
            setFocus(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocus(false);
            onBlur();
          }}
          style={{ paddingRight: secret ? 48 : lx }}
        />

        {secret ? (
          <button
            className="lbi-eye"
            type="button"
            data-show={show ? "true" : "false"}
            aria-label={show ? "Hide password" : "Show password"}
            onPointerDown={(event) => event.preventDefault()}
            onClick={reveal}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
              <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
              <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
              <path d="m2 2 20 20" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
