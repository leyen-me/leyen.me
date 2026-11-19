/**
 * A stand-in for Bencho's `/lab/flower.jpg`: a black-and-white halftone print of
 * a flower. The original ships a 540×720 photograph; the gallery stays offline,
 * so the same silhouette is drawn as vector petals, a stem and a dot screen.
 * It is deliberately monochrome so the displacement/blur filter has the same
 * broad masses and fine grain to work with as the source photo.
 */

/** One petal, drawn from the flower's centre and pointing up. */
const PETAL =
  "M0 6C-30 -40 -55 -105 -58 -168C-61 -232 -45 -284 -18 -308C8 -322 30 -304 38 -270C48 -224 36 -160 20 -96C12 -58 8 -24 0 6Z";

/** The pale highlight that runs down the middle of a petal. */
const RIDGE = "M-6 -26C-22 -78 -31 -136 -29 -192C-27 -242 -18 -276 -4 -292";

/** Angles are measured from the petal's upward axis, clockwise. */
const PETALS = [
  { angle: -58, scale: 1.0 },
  { angle: -16, scale: 1.12 },
  { angle: 24, scale: 1.04 },
  { angle: 70, scale: 1.08 },
  { angle: 122, scale: 1.01 },
  { angle: 184, scale: 0.95 },
  { angle: 242, scale: 0.98 },
] as const;

type FlowerArtProps = { idPrefix: string };

export function FlowerArt({ idPrefix }: FlowerArtProps) {
  return (
    <svg
      viewBox="0 0 540 720"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={`${idPrefix}-petal`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="8"
          x2="0"
          y2="-310"
        >
          <stop offset="0" stopColor="#0a0a09" />
          <stop offset="0.28" stopColor="#1d1d1b" />
          <stop offset="0.52" stopColor="#77776f" />
          <stop offset="0.74" stopColor="#141413" />
          <stop offset="1" stopColor="#4b4b46" />
        </linearGradient>

        <pattern
          id={`${idPrefix}-dots`}
          width="3.4"
          height="3.4"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.1" cy="1.1" r="0.8" fill="#000" />
          <circle cx="2.8" cy="2.8" r="0.6" fill="#000" />
        </pattern>

        <radialGradient id={`${idPrefix}-paper`} cx="0.5" cy="0.38" r="0.78">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#cfcec8" stopOpacity="0.16" />
          <stop offset="1" stopColor="#9c9b94" stopOpacity="0.34" />
        </radialGradient>
      </defs>

      <rect width="540" height="720" fill="#f2f1ed" />

      {/* stem, behind the head */}
      <path
        d="M262 318C250 414 224 512 196 720"
        stroke="#151514"
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
        opacity="0.82"
      />

      <g transform="translate(270 300)">
        {PETALS.map((petal, index) => (
          <g
            key={petal.angle}
            transform={`rotate(${petal.angle}) scale(${petal.scale})`}
          >
            <path d={PETAL} fill={`url(#${idPrefix}-petal)`} />
            <path d={PETAL} fill={`url(#${idPrefix}-dots)`} opacity="0.28" />
            <path
              d={RIDGE}
              stroke="#d7d6d0"
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
              opacity={index === 0 ? 0.2 : 0.34}
            />
          </g>
        ))}

        {/* the knotted centre, where every petal overlaps */}
        <ellipse cx="0" cy="0" rx="52" ry="44" fill="#080807" />
        <ellipse cx="8" cy="6" rx="30" ry="24" fill="#2b2b28" opacity="0.8" />
        <ellipse
          cx="0"
          cy="0"
          rx="70"
          ry="58"
          fill="none"
          stroke="#0a0a09"
          strokeWidth="14"
          opacity="0.22"
        />
      </g>

      {/* a whisper of paper shading, so the print does not end flat */}
      <rect
        width="540"
        height="720"
        fill={`url(#${idPrefix}-paper)`}
        opacity="0.5"
      />
    </svg>
  );
}

type FlowerDefsProps = {
  filterId: string;
  baseFrequency: string;
  displacement: string;
  blur: string;
  slope: string;
  intercept: string;
};

/** The reactive displacement filter, shared by the print through `filterId`. */
export function FlowerDefs({
  filterId,
  baseFrequency,
  displacement,
  blur,
  slope,
  intercept,
}: FlowerDefsProps) {
  return (
    <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
      <defs>
        <filter
          id={filterId}
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency={baseFrequency}
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={displacement}
            xChannelSelector="R"
            yChannelSelector="G"
            result="shifted"
          />
          <feGaussianBlur in="shifted" stdDeviation={blur} />
          <feComponentTransfer>
            <feFuncR type="linear" slope={slope} intercept={intercept} />
            <feFuncG type="linear" slope={slope} intercept={intercept} />
            <feFuncB type="linear" slope={slope} intercept={intercept} />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}
