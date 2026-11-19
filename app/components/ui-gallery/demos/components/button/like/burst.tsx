import type { CSSProperties } from "react";

export type BurstEffect = "Bloom" | "Firework";

/** Bencho's confetti palette, kept verbatim. */
const PALETTE = [
  "#f48ea7",
  "#cc8ef5",
  "#8ce8c3",
  "#91d2fa",
  "#f5a524",
  "#e5484d",
  "#9fc7fa",
] as const;

/** Deterministic pseudo-random from the source, so particles never hydrate differently. */
function noise(a: number, b: number) {
  const raw = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return raw - Math.floor(raw);
}

function dot(color: string, key: number) {
  return <i key={key} style={{ "--c": color } as CSSProperties} />;
}

/**
 * Two shapes from the original: "Bloom" opens a ring inside the heart and
 * flicks seven pairs of confetti out of it; "Firework" throws twelve sparks
 * upward. `fly` (0–1) is the Burst slider, normalised.
 */
export function LikeBurst({
  effect,
  fly,
}: {
  effect: BurstEffect;
  fly: number;
}) {
  if (effect === "Firework") {
    return (
      <>
        {Array.from({ length: 12 }, (_, index) => {
          const angle = -Math.PI / 2 + (index / 11 - 0.5) * Math.PI * 1.25;
          const distance = 22 + fly * 22 + noise(index, 7) * 10;

          return (
            <span
              key={index}
              className="like-fw"
              style={
                {
                  "--x": `${Math.cos(angle) * distance}px`,
                  "--d": `${noise(index, 8) * 60}ms`,
                } as CSSProperties
              }
            >
              <i
                style={
                  {
                    "--y": `${Math.sin(angle) * distance}px`,
                    background: PALETTE[index % PALETTE.length],
                  } as CSSProperties
                }
              />
            </span>
          );
        })}
      </>
    );
  }

  return (
    <>
      <span className="like-bloom" />
      {Array.from({ length: 7 }, (_, index) => (
        <span
          key={index}
          className="like-spoke"
          style={{ "--a": `${(360 / 7) * index - 90}deg` } as CSSProperties}
        >
          {dot(PALETTE[index % PALETTE.length], 0)}
          {dot(PALETTE[(index + 3) % PALETTE.length], 1)}
        </span>
      ))}
    </>
  );
}
