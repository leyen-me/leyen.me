"use client";

import { useEffect, useRef, useState } from "react";

type Layer = { id: number; character: string };

/**
 * One wheel per decimal place. Only the wheels whose digit changed roll; the
 * outgoing and incoming glyphs travel in opposite directions (`up` = liking)
 * with a `place * 40ms` delay, so a carry reads right to left exactly like
 * Bencho's `popLayout` odometer.
 */
function Wheel({
  character,
  place,
  up,
  reduced,
}: {
  character: string;
  place: number;
  up: boolean;
  reduced: boolean;
}) {
  const [pair, setPair] = useState<{ current: Layer; previous: Layer | null }>(
    () => ({ current: { id: 0, character }, previous: null })
  );
  const last = useRef(character);

  // Render-phase adjustment: the new digit appears in the same paint as the
  // count change, with the old one stacked behind it for the exit roll.
  if (last.current !== character) {
    last.current = character;
    setPair((state) => ({
      current: { id: state.current.id + 1, character },
      previous: state.current,
    }));
  }

  useEffect(() => {
    const previous = pair.previous;
    if (!previous || reduced) return;

    const timer = window.setTimeout(
      () => {
        setPair((state) =>
          state.previous?.id === previous.id
            ? { ...state, previous: null }
            : state
        );
      },
      480 + place * 40
    );

    return () => window.clearTimeout(timer);
  }, [pair.previous, place, reduced]);

  const direction = up ? "up" : "down";

  return (
    <span className="relative inline-block h-[1.25em] overflow-hidden">
      {pair.previous && !reduced ? (
        <span
          key={pair.previous.id}
          className={`like-digit like-digit-out-${direction}`}
          style={{ animationDelay: `${place * 0.04}s` }}
        >
          {pair.previous.character}
        </span>
      ) : null}
      <span
        key={pair.current.id}
        className={
          pair.previous && !reduced
            ? `like-digit like-digit-in-${direction}`
            : "like-digit"
        }
        style={{ animationDelay: `${place * 0.04}s` }}
      >
        {pair.current.character}
      </span>
    </span>
  );
}

export function Odometer({ value, up }: { value: number; up: boolean }) {
  const [reduced, setReduced] = useState(false);
  const characters = value.toLocaleString("en-US").split("");

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return (
    <span className="flex tabular-nums" aria-hidden="true">
      {characters.map((character, index) => {
        const place = characters.length - 1 - index;

        if (character === ",") {
          return (
            <span key={`comma-${place}`} className="leading-[1.25em]">
              ,
            </span>
          );
        }

        return (
          <Wheel
            key={`wheel-${place}`}
            character={character}
            place={place}
            up={up}
            reduced={reduced}
          />
        );
      })}
    </span>
  );
}
