import { useId } from "react";

export type SceneMode = "before" | "after";

/* Original artwork, not Bencho's photos: the same lake cabin at noon and at
   night. Every shape is shared between the two palettes so the halves line up
   exactly like the source's x-ray / colour pair. */
const DAY = {
  skyTop: "#5fa9c8",
  skyMid: "#b9dcdd",
  skyLow: "#f6e3bd",
  sun: "#ffe8a1",
  glow: "#ffdf8c",
  far: "#7d9aa0",
  mid: "#4d787d",
  near: "#2c5a5d",
  waterTop: "#93c9cc",
  waterBottom: "#2b5f6b",
  landFar: "#3b655c",
  land: "#1f423d",
  trunk: "#183530",
  pine: "#24493f",
  cabin: "#c7a07a",
  roof: "#6f4f3b",
  window: "#7c9791",
  reflection: "#ffe6a0",
  cloud: "#ffffff",
  bird: "#3f5b5d",
  rock: "#183430",
  star: 0,
  cloudOpacity: 0.55,
} as const;

const NIGHT = {
  skyTop: "#060b1a",
  skyMid: "#15213c",
  skyLow: "#3a4468",
  sun: "#eaf0ff",
  glow: "#b8c8ff",
  far: "#1a2741",
  mid: "#101c31",
  near: "#0a1424",
  waterTop: "#182a46",
  waterBottom: "#060e1b",
  landFar: "#0d1b28",
  land: "#07121c",
  trunk: "#040c12",
  pine: "#0a1820",
  cabin: "#463a32",
  roof: "#241b16",
  window: "#ffd27d",
  reflection: "#cdddff",
  cloud: "#8fa3c8",
  bird: "#8fa3c8",
  rock: "#040d13",
  star: 0.85,
  cloudOpacity: 0.16,
} as const;

const STARS: Array<[number, number, number]> = [
  [18, 26, 0.9],
  [38, 54, 0.6],
  [58, 22, 0.7],
  [76, 48, 0.5],
  [94, 18, 0.8],
  [112, 62, 0.55],
  [132, 30, 0.65],
  [150, 88, 0.45],
  [166, 22, 0.75],
  [186, 50, 0.5],
  [208, 32, 0.7],
  [226, 70, 0.45],
  [244, 24, 0.8],
  [256, 92, 0.5],
  [30, 96, 0.4],
  [120, 108, 0.35],
  [230, 118, 0.3],
];

export default function CompareScene({ mode }: { mode: SceneMode }) {
  const night = mode === "after";
  const c = night ? NIGHT : DAY;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const skyId = `cmp-sky-${uid}`;
  const waterId = `cmp-water-${uid}`;
  const glowId = `cmp-glow-${uid}`;
  const glowFadeId = `cmp-glow-fade-${uid}`;

  return (
    <svg
      viewBox="0 0 270 360"
      preserveAspectRatio="xMidYMid slice"
      className="block h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.skyTop} />
          <stop offset="0.55" stopColor={c.skyMid} />
          <stop offset="1" stopColor={c.skyLow} />
        </linearGradient>
        <linearGradient id={waterId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.waterTop} />
          <stop offset="1" stopColor={c.waterBottom} />
        </linearGradient>
        <radialGradient id={glowId} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={c.glow} stopOpacity="0.9" />
          <stop offset="0.45" stopColor={c.glow} stopOpacity="0.32" />
          <stop offset="1" stopColor={c.glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={glowFadeId} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={c.window} stopOpacity="0.5" />
          <stop offset="1" stopColor={c.window} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="270" height="224" fill={`url(#${skyId})`} />
      <circle cx="196" cy="80" r="58" fill={`url(#${glowId})`} />
      <circle cx="196" cy="80" r="23" fill={c.sun} />
      {night ? (
        <g fill="#aab6d8" opacity="0.3">
          <circle cx="188" cy="74" r="4.5" />
          <circle cx="203" cy="86" r="3" />
          <circle cx="201" cy="70" r="2" />
        </g>
      ) : null}

      {night ? (
        <g fill="#e9efff">
          {STARS.map(([x, y, opacity], index) => (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={index % 4 === 0 ? 1.1 : 0.7}
              opacity={opacity}
            />
          ))}
        </g>
      ) : null}

      <g fill={c.cloud} opacity={c.cloudOpacity}>
        <ellipse cx="62" cy="88" rx="30" ry="7" />
        <ellipse cx="48" cy="81" rx="15" ry="8" />
        <ellipse cx="78" cy="79" rx="13" ry="7" />
        <ellipse cx="208" cy="146" rx="26" ry="5" />
        <ellipse cx="198" cy="140" rx="12" ry="6" />
      </g>

      {night ? null : (
        <g
          fill="none"
          stroke={c.bird}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.7"
        >
          <path d="M142 70q4-5 8 0q4-5 8 0" />
          <path d="M120 96q3-4 6 0q3-4 6 0" />
        </g>
      )}

      {/* Far ridge and the opposite shore. */}
      <path
        d="M0 224V183q24-17 46-7 16-22 40-8 26-24 52 2 22-12 42 4 30-6 52 8l38-6v48Z"
        fill={c.far}
      />
      <path
        d="M0 224v-25q20-10 38-2 18-18 40-6 24-14 46 0 28-8 50 6 30-2 50 8 20 8 46 2v17Z"
        fill={c.mid}
      />
      <path
        d="M0 224v-12q28-6 50 2 24-8 48-1 30-4 54 3 26-4 48 2 34-2 70 4v2Z"
        fill={c.near}
      />

      {/* Water. */}
      <rect y="224" width="270" height="136" fill={`url(#${waterId})`} />
      <g stroke={c.waterTop} strokeWidth="1" opacity="0.32">
        <path d="M16 244h62" />
        <path d="M138 256h48" />
        <path d="M34 282h58" />
        <path d="M154 302h54" />
        <path d="M24 326h48" />
        <path d="M148 338h62" />
      </g>

      {/* Sun / moon reflection. */}
      <ellipse
        cx="196"
        cy="238"
        rx="21"
        ry="4"
        fill={c.reflection}
        opacity={night ? 0.55 : 0.7}
      />
      <g fill={c.reflection} opacity={night ? 0.28 : 0.4}>
        <rect x="174" y="248" width="44" height="2" rx="1" />
        <rect x="180" y="258" width="32" height="2" rx="1" />
        <rect x="186" y="269" width="22" height="2" rx="1" />
        <rect x="191" y="281" width="14" height="2" rx="1" />
        <rect x="195" y="294" width="8" height="2" rx="1" />
      </g>

      {/* Left and right banks frame the water. */}
      <path
        d="M0 224v136h118q-8-30-24-52-12-18-28-32-20-18-40-28Z"
        fill={c.landFar}
      />
      <path d="M0 272q28 10 48 30 22 20 34 58H0Z" fill={c.land} />
      <path
        d="M270 224v136h-82q10-30 26-52 12-18 28-32 16-16 28-24Z"
        fill={c.landFar}
      />
      <path d="M270 286q-26 12-42 32-14 16-22 42h64Z" fill={c.land} />

      {/* Cabin on the far-left shore. */}
      <rect x="26" y="194" width="24" height="16" rx="1" fill={c.cabin} />
      <path d="M22 194l16-12 16 12Z" fill={c.roof} />
      <rect x="44" y="184" width="3" height="9" fill={c.roof} />
      <rect x="31" y="202" width="5" height="8" fill={c.roof} />
      <rect x="41" y="199" width="5" height="5" fill={c.window} />
      {night ? (
        <circle cx="43.5" cy="201.5" r="11" fill={`url(#${glowFadeId})`} />
      ) : null}

      {/* Pines around the cabin. */}
      <g fill={c.pine}>
        <path d="M12 196l7-23 7 23Z" />
        <path d="M13 187l6-18 6 18Z" />
        <path d="M58 198l8-24 8 24Z" />
        <path d="M59 189l7-19 7 19Z" />
      </g>
      <g fill={c.trunk}>
        <rect x="17.5" y="196" width="3" height="7" />
        <rect x="64.5" y="198" width="3" height="7" />
      </g>

      {/* Jetty. */}
      <path d="M70 272l66 15v6l-66-15Z" fill={c.trunk} />
      <g stroke={c.trunk} strokeWidth="2.5">
        <path d="M84 276v13" />
        <path d="M104 281v13" />
        <path d="M124 286v13" />
      </g>

      {/* Foreground rocks and a small pine at the water's edge. */}
      <path d="M96 360q10-24 32-30 16-4 28 8 8 8 12 22Z" fill={c.rock} />
      <path d="M131 344l9-26 9 26Z" fill={c.pine} />
      <rect x="138.5" y="344" width="3" height="8" fill={c.trunk} />
    </svg>
  );
}
