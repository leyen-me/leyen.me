"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * One wheel per character position. A digit that changes rolls in from the
 * direction the total moved (Bencho uses framer-motion; this is the same
 * 500 ms, 70 ms-per-column entrance expressed as a keyframed span). The
 * source's 160 ms exit blur is omitted; the entering digit covers it.
 */
export default function RollingText({
  text,
  up,
  animate,
}: {
  text: string;
  up: boolean;
  animate: boolean;
}) {
  const previous = useRef(text);
  const previousText = previous.current;

  useEffect(() => {
    previous.current = text;
  }, [text]);

  const chars = text.split("");
  const from = up ? "0.18em" : "-0.18em";

  return (
    <span className="flex leading-none" aria-hidden="true">
      {chars.map((char, index) => {
        const place = chars.length - 1 - index;
        const previousChar = previousText[previousText.length - 1 - place];
        const changed = previousChar !== char;

        if (!/[0-9]/.test(char)) {
          return (
            <span key={`sym-${place}`} className="leading-[1.15]">
              {char}
            </span>
          );
        }

        return (
          <span
            key={`place-${place}`}
            className="inline-block h-[1.15em] overflow-hidden"
          >
            <span
              key={char}
              className={
                animate && changed
                  ? "ctx-digit-roll block leading-[1.15]"
                  : "block leading-[1.15]"
              }
              style={
                animate && changed
                  ? ({
                      "--ctx-from": from,
                      animationDelay: `${index * 70}ms`,
                    } as CSSProperties)
                  : undefined
              }
            >
              {char}
            </span>
          </span>
        );
      })}
    </span>
  );
}
