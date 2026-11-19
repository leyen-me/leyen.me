import { cqw, type CardId } from "./deck";

/**
 * Neutral, self-contained card artwork. Bencho's deck uses four photographs;
 * these are gradient-and-SVG stand-ins with the same muted, photographic feel
 * and the same portrait crop (190 × 240 = the card's inner box).
 */
export function CardArt({ id }: { id: CardId }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 block overflow-hidden"
      style={{ borderRadius: cqw(17) }}
    >
      {id === "mount" ? <Mountain /> : null}
      {id === "bloom" ? <Bloom /> : null}
      {id === "peak" ? <Peak /> : null}
      {id === "wings" ? <Wings /> : null}
    </span>
  );
}

function Mountain() {
  return (
    <svg
      viewBox="0 0 190 240"
      preserveAspectRatio="xMidYMid slice"
      className="block h-full w-full"
      focusable="false"
    >
      <defs>
        <linearGradient id="csw-mount-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9e7e2" />
          <stop offset="0.55" stopColor="#d3cec6" />
          <stop offset="1" stopColor="#b8b2a8" />
        </linearGradient>
        <linearGradient id="csw-mount-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#aca69d" />
          <stop offset="1" stopColor="#8b857c" />
        </linearGradient>
      </defs>
      <rect width="190" height="240" fill="url(#csw-mount-sky)" />
      <circle cx="139" cy="54" r="19" fill="#f7f5ef" opacity="0.85" />
      <path
        d="M0 171 L38 133 L66 155 L103 112 L141 151 L190 121 V240 H0 Z"
        fill="url(#csw-mount-far)"
      />
      <path
        d="M103 112 L118 130 L110 126 L103 136 L96 126 L90 130 Z"
        fill="#f3f1ea"
        opacity="0.9"
      />
      <path d="M0 197 L49 154 L91 187 L132 151 L190 183 V240 H0 Z" fill="#78726a" />
      <path d="M0 218 L37 191 L83 213 L136 185 L190 215 V240 H0 Z" fill="#4a4640" />
    </svg>
  );
}

function Bloom() {
  const petals = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <svg
      viewBox="0 0 190 240"
      preserveAspectRatio="xMidYMid slice"
      className="block h-full w-full"
      focusable="false"
    >
      <defs>
        <linearGradient id="csw-bloom-bg" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#efe9df" />
          <stop offset="0.62" stopColor="#e2dacd" />
          <stop offset="1" stopColor="#c9bfae" />
        </linearGradient>
        <radialGradient id="csw-bloom-glow" cx="0.5" cy="0.45" r="0.62">
          <stop offset="0" stopColor="#faf7f1" stopOpacity="0.9" />
          <stop offset="1" stopColor="#faf7f1" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="csw-bloom-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b6152" stopOpacity="0" />
          <stop offset="1" stopColor="#5c5346" stopOpacity="0.32" />
        </linearGradient>
      </defs>
      <rect width="190" height="240" fill="url(#csw-bloom-bg)" />
      <circle cx="95" cy="110" r="78" fill="url(#csw-bloom-glow)" />
      <g transform="translate(95 116)">
        {petals.map((angle) => (
          <ellipse
            key={angle}
            cx="0"
            cy="-34"
            rx="19"
            ry="38"
            transform={`rotate(${angle})`}
            fill="#f6f2ea"
            stroke="#c6bcab"
            strokeWidth="1"
          />
        ))}
        <circle r="15" fill="#b3a48e" />
        <circle r="15" fill="none" stroke="#8f8170" strokeWidth="1" opacity="0.5" />
      </g>
      <rect y="168" width="190" height="72" fill="url(#csw-bloom-shade)" />
    </svg>
  );
}

function Peak() {
  return (
    <svg
      viewBox="0 0 190 240"
      preserveAspectRatio="xMidYMid slice"
      className="block h-full w-full"
      focusable="false"
    >
      <defs>
        <linearGradient id="csw-peak-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b5b64" />
          <stop offset="0.55" stopColor="#33333a" />
          <stop offset="1" stopColor="#1b1b20" />
        </linearGradient>
      </defs>
      <rect width="190" height="240" fill="url(#csw-peak-sky)" />
      <circle cx="46" cy="58" r="14" fill="#e7e5e4" opacity="0.55" />
      <path d="M0 168 L30 141 L56 159 L88 128 L118 152 L148 132 L190 158 V240 H0 Z" fill="#2a2a31" />
      <path d="M0 206 L42 158 L74 184 L107 146 L139 176 L190 148 V240 H0 Z" fill="#202026" />
      <path
        d="M42 158 L61 178 L75 176 L88 190 L107 146 L129 170 L139 176"
        fill="none"
        stroke="#8d8d98"
        strokeWidth="1"
        opacity="0.55"
      />
      <path d="M0 240 L18 214 L44 226 L78 200 L112 222 L148 196 L190 224 V240 Z" fill="#101014" />
      <path d="M107 146 L120 163 L110 160 L104 168 L97 158 L88 164 Z" fill="#d6d3d1" opacity="0.45" />
    </svg>
  );
}

function Wings() {
  const wingPath =
    "M-4 -6 C-26 -46 -70 -56 -78 -30 C-84 -10 -56 14 -22 12 C-12 11 -6 5 -4 -6 Z";
  const lowerPath =
    "M-4 6 C-20 10 -54 26 -50 48 C-46 66 -22 66 -10 50 C-4 42 -2 24 -4 6 Z";

  return (
    <svg
      viewBox="0 0 190 240"
      preserveAspectRatio="xMidYMid slice"
      className="block h-full w-full"
      focusable="false"
    >
      <defs>
        <linearGradient id="csw-wings-bg" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#e6e3dc" />
          <stop offset="0.6" stopColor="#d2cec5" />
          <stop offset="1" stopColor="#b6b0a4" />
        </linearGradient>
        <linearGradient id="csw-wings-wing" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#fbf9f4" />
          <stop offset="1" stopColor="#e3ded3" />
        </linearGradient>
        <linearGradient id="csw-wings-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5c584f" stopOpacity="0" />
          <stop offset="1" stopColor="#4f4b43" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <rect width="190" height="240" fill="url(#csw-wings-bg)" />
      <g transform="translate(95 124)">
        <g stroke="#a29a8c" strokeWidth="1" fill="url(#csw-wings-wing)">
          <path d={wingPath} />
          <path d={lowerPath} />
        </g>
        <g transform="scale(-1 1)" stroke="#a29a8c" strokeWidth="1" fill="url(#csw-wings-wing)">
          <path d={wingPath} />
          <path d={lowerPath} />
        </g>
        <ellipse cx="0" cy="8" rx="4" ry="34" fill="#4a4640" />
        <path d="M-3 -22 C-10 -34 -16 -40 -22 -42" fill="none" stroke="#4a4640" strokeWidth="1.2" />
        <path d="M3 -22 C10 -34 16 -40 22 -42" fill="none" stroke="#4a4640" strokeWidth="1.2" />
      </g>
      <rect y="176" width="190" height="64" fill="url(#csw-wings-shade)" />
    </svg>
  );
}
