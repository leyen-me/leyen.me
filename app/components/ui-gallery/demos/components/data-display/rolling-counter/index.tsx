"use client";

import type { CSSProperties } from "react";
import {
  CELL,
  DEFAULT_START,
  DEFAULTS,
  MAX_CORNER,
  MAX_VALUE,
  PADDING,
  PLACES,
  clamp,
  initialOffset,
} from "./engine";
import { ROLLING_COUNTER_CSS } from "./styles";
import { useRollingCounter } from "./use-rolling-counter";

const CORNER = clamp(DEFAULTS.corner, 0, MAX_CORNER);
const INNER = Math.max(0, CORNER - PADDING);
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

function MinusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M12 5v14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Bencho's "Rolling counter" (Drag, MIT), ported to the gallery.
 *
 * Drag the number up or down (12 px per step, with momentum), arrow-key it,
 * or press and hold the minus / plus buttons. The colours resolve Bencho's
 * `--fill-slab`, `--fill-on` and `--pane-edge` for the light and dark fills.
 * The only deliberate change is a fully visible focus ring: the source masks
 * the number itself, which would clip the outer ring, so the mask moved to an
 * inner window.
 */
export default function Demo() {
  const { value, stripsRef, numberHandlers, buttonHandlers } =
    useRollingCounter();
  const length = Math.max(1, String(value).length);

  return (
    <div className="roll-demo flex w-full max-w-[360px] items-center justify-center rounded-[28px] bg-[#f1f2f2] px-6 py-14 dark:bg-[#171717]">
      <style>{ROLLING_COUNTER_CSS}</style>

      <div
        className="rct"
        style={
          {
            "--rct-r": `${CORNER}px`,
            "--rct-in": `${INNER}px`,
            "--rct-cell": `${CELL}px`,
          } as CSSProperties
        }
      >
        <button
          type="button"
          className="rct-btn"
          aria-label="Less"
          {...buttonHandlers(-1)}
        >
          <MinusIcon />
        </button>

        <div
          className="rct-num"
          role="spinbutton"
          aria-label="Count. Drag up or down to change it."
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={MAX_VALUE}
          tabIndex={0}
          {...numberHandlers}
        >
          <span className="rct-window">
            {Array.from({ length: PLACES }, (_, index) => {
              const place = PLACES - 1 - index;
              return (
                <span className="rct-pair" key={place}>
                  <span className="rct-col" data-on={place < length || undefined}>
                    <span
                      className="rct-strip"
                      style={{
                        transform: `translateY(${
                          -initialOffset(DEFAULT_START, place) * CELL
                        }px)`,
                      }}
                      ref={(node) => {
                        stripsRef.current[place] = node;
                      }}
                    >
                      {DIGITS.map((digit, digitIndex) => (
                        <span key={digitIndex}>{digit}</span>
                      ))}
                    </span>
                  </span>

                  {place === 3 ? (
                    <span className="rct-sep" data-on={length > 3 || undefined}>
                      ,
                    </span>
                  ) : null}
                </span>
              );
            })}
          </span>
        </div>

        <button
          type="button"
          className="rct-btn"
          aria-label="More"
          {...buttonHandlers(1)}
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
}
