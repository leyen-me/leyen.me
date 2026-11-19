/**
 * Bencho paints each avatar on a small canvas as a seeded mesh gradient derived
 * from the person's hue, then blurs it by 3px. This port keeps the same idea
 * with four soft radial stops and a highlight, so no canvas or bitmap is needed
 * and the orb stays crisp at 52px.
 */

const ORB = 52;

function stop(
  x: number,
  y: number,
  hue: number,
  offset: number,
  lightness: number,
  alpha: number,
  radius: number,
) {
  const h = hue + offset;
  return `radial-gradient(${radius}% ${radius}% at ${x}% ${y}%, hsl(${h} 78% ${lightness}% / ${alpha}) 0%, hsl(${h} 78% ${lightness}% / 0) 68%)`;
}

export function orbBackground(hue: number) {
  return [
    stop(18, 22, hue, -24, 64, 0.95, 78),
    stop(78, 18, hue, 38, 70, 0.9, 74),
    stop(62, 88, hue, 10, 44, 0.95, 82),
    stop(26, 78, hue, 64, 56, 0.85, 72),
    `hsl(${hue} 62% 48%)`,
  ].join(", ");
}

type PersonOrbProps = {
  hue: number;
  /** Whether the wave overlay is showing (the person is the active speaker). */
  talking: boolean;
};

export function PersonOrb({ hue, talking }: PersonOrbProps) {
  return (
    <span
      aria-hidden="true"
      className="huddle-orb relative block overflow-hidden rounded-full"
      style={{ width: ORB, height: ORB, background: orbBackground(hue) }}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_22%,rgba(255,255,255,0.32),transparent_72%)]" />
      <span
        className={`huddle-wave pointer-events-none absolute inset-0 flex items-center justify-center gap-[2.5px] transition-[opacity,transform] duration-200 ease-out ${
          talking ? "is-live scale-100 opacity-100" : "scale-[0.6] opacity-0"
        }`}
      >
        {[0, 1, 2, 3].map((bar) => (
          <i
            key={bar}
            className="huddle-bar block w-[2.5px] rounded-full bg-white"
            style={{ height: bar === 1 || bar === 2 ? 12 : 7 }}
          />
        ))}
      </span>
    </span>
  );
}
