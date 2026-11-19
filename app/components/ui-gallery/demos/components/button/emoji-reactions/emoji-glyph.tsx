import type { CSSProperties } from "react";
import {
  CONFETTI_ANGLES,
  CONFETTI_COLOURS,
  EMOJI_FX,
} from "./emoji";

type EmojiGlyphProps = {
  emoji: string;
  /** Runs the emoji's little choreography; confetti also throws its bits. */
  play: boolean;
};

export function EmojiGlyph({ emoji, play }: EmojiGlyphProps) {
  const kind = EMOJI_FX[emoji] ?? "nod";

  return (
    <i className="rxn-p" data-k={kind} data-play={play ? "true" : undefined}>
      {emoji}
      {play && kind === "confetti" ? (
        <span className="rxn-bits" aria-hidden="true">
          {CONFETTI_ANGLES.map((angle, index) => (
            <b
              key={angle}
              style={
                {
                  "--a": `${angle}deg`,
                  "--c": CONFETTI_COLOURS[index],
                } as CSSProperties
              }
            />
          ))}
        </span>
      ) : null}
    </i>
  );
}
