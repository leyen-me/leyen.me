"use client";

import { useId, useRef, type CSSProperties } from "react";
import { TIME_SCRUBBER_CSS } from "./styles";
import {
  DIGITS,
  buildTicks,
  formatHourLabel,
  formatTime,
} from "./time";
import { useTimeScrubber } from "./use-time-scrubber";

const CORNER = 20;
const USE_24_HOUR = false;

/*
 * Bencho's "Time scrubber" (Slide, MIT), ported to the gallery.
 *
 * A 300 px slab shows a 1.5em odometer readout above a 58 px dial: 2 px per
 * minute, ticks every 5 minutes, taller marks each quarter and hour, and hour
 * labels every 60 minutes. Dragging horizontally rolls the ruler under a fixed
 * red center marker; release predicts where the flick would coast and lets one
 * spring carry the ruler to the nearest 15-minute step.
 *
 * Deliberate gallery additions: a keyboard slider contract (arrows / Page /
 * Home / End), Shift for a larger jump, an explicit focus-visible inset ring,
 * and full frame / listener / timer cleanup. The drum's digit blur and the
 * spring are disabled under prefers-reduced-motion.
 */
export default function Demo() {
  const { position, time, meridiem, minuteOfDay, rulerRef, handlers } =
    useTimeScrubber();
  const hintId = useId();
  const ticks = buildTicks(position);

  return (
    <div className="tms-demo w-full max-w-[340px]">
      <style>{TIME_SCRUBBER_CSS}</style>

      <div className="grid w-full place-items-center px-5 py-7">
        <div
          className="tms"
          style={{ "--tms-r": `${CORNER}px` } as CSSProperties}
        >
          <div className="tms-read" aria-hidden="true">
            <span className="tms-time">
              {time.split("").map((character, index) =>
                character === ":" ? (
                  <span className="tms-colon" key={`colon-${index}`}>
                    :
                  </span>
                ) : (
                  <Digit
                    key={`digit-${time.length - index}`}
                    value={character}
                  />
                ),
              )}
            </span>
            {meridiem ? <span className="tms-mer">{meridiem}</span> : null}
          </div>

          <div
            ref={rulerRef}
            role="slider"
            tabIndex={0}
            aria-label="Time"
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={1439}
            aria-valuenow={minuteOfDay}
            aria-valuetext={meridiem ? `${time} ${meridiem}` : time}
            aria-describedby={hintId}
            className="tms-ruler"
            {...handlers}
          >
            <div className="tms-track">
              {ticks.map((tick) => (
                <span
                  key={tick.minute}
                  className="tms-tick"
                  data-kind={tick.kind}
                  style={{
                    transform: `translateX(${tick.x.toFixed(2)}px) scaleY(${(
                      0.55 +
                      0.45 * tick.fade
                    ).toFixed(3)})`,
                    opacity: 0.18 + 0.82 * tick.fade,
                  }}
                />
              ))}

              {ticks
                .filter((tick) => tick.kind === "hour")
                .map((tick) => (
                  <span
                    key={`label-${tick.minute}`}
                    className="tms-hour"
                    style={{
                      transform: `translateX(${tick.x.toFixed(
                        2,
                      )}px) translateX(-50%)`,
                      opacity: 0.15 + 0.85 * tick.fade,
                    }}
                  >
                    {formatHourLabel(tick.hour, USE_24_HOUR)}
                  </span>
                ))}
            </div>

            <span className="tms-mark" aria-hidden="true" />
          </div>
        </div>
      </div>

      <p id={hintId} className="sr-only">
        拖动标尺选择时间，甩动后停在最近的 15 分钟。方向键可微调。
      </p>
    </div>
  );
}

function Digit({ value }: { value: string }) {
  const previous = useRef(value);
  const flip = useRef<"a" | "b" | null>(null);

  if (previous.current !== value) {
    previous.current = value;
    flip.current = flip.current === "a" ? "b" : "a";
  }

  return (
    <span className="tms-col">
      <span
        className="tms-strip"
        data-flip={flip.current ?? undefined}
        style={{ transform: `translateY(${-Number(value) * 1.5}em)` }}
      >
        {DIGITS.map((digit) => (
          <span key={digit}>{digit}</span>
        ))}
      </span>
    </span>
  );
}
