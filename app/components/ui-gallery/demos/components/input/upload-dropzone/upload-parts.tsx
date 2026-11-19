"use client";

import { useEffect, useState } from "react";
import { DIGITS } from "./upload-data";

export function usePrefersReducedMotion() {
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

/** Bencho's odometer percent: each column is a 0–9 strip slid to its digit. */
export function RollingPercent({ value }: { value: number }) {
  const text = String(Math.round(value)).split("");

  return (
    <span className="upl-roll" aria-hidden="true">
      {text.map((digit, index) => (
        <span className="upl-roll-col" key={text.length - index}>
          <span
            className="upl-roll-strip"
            style={{ transform: `translateY(${-Number(digit)}em)` }}
          >
            {DIGITS.map((entry) => (
              <span key={entry}>{entry}</span>
            ))}
          </span>
        </span>
      ))}
      <span className="upl-pct">%</span>
    </span>
  );
}
