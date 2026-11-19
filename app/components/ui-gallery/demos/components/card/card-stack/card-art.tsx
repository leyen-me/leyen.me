/**
 * Original card artwork for the stack.
 *
 * Bencho's deck uses five flower photographs (`/lab/stack-flowers*.jpg`).
 * Those are external assets, so they are replaced here by five abstract,
 * vector studies drawn in the same portrait crop (156 × 208): Strata, Orbit,
 * Fold, Ridge and Bloom. Everything is inline SVG, so the deck ships without
 * a network request and stays sharp when a card is enlarged.
 */

export const CARD_ART = [
  { title: "Strata" },
  { title: "Orbit" },
  { title: "Fold" },
  { title: "Ridge" },
  { title: "Bloom" },
] as const;

export function CardArt({ index }: { index: number }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 block">
      {index === 0 ? <Strata /> : null}
      {index === 1 ? <Orbit /> : null}
      {index === 2 ? <Fold /> : null}
      {index === 3 ? <Ridge /> : null}
      {index === 4 ? <Bloom /> : null}
    </span>
  );
}

const svg = "block h-full w-full";

function Strata() {
  return (
    <svg viewBox="0 0 156 208" preserveAspectRatio="xMidYMid slice" className={svg} focusable="false">
      <defs>
        <linearGradient id="stk-strata-bg" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#ece7de" />
          <stop offset="1" stopColor="#ded7ca" />
        </linearGradient>
      </defs>
      <rect width="156" height="208" fill="url(#stk-strata-bg)" />
      <circle cx="112" cy="50" r="21" fill="#f7f3ea" />
      <path d="M0 72 C34 60 64 84 96 74 C118 67 136 70 156 62 V208 H0 Z" fill="#d8d0c0" />
      <path d="M0 96 C40 84 72 112 108 100 C130 93 142 96 156 90 V208 H0 Z" fill="#c1b7a4" />
      <path d="M0 121 C36 110 76 137 112 124 C132 117 146 120 156 116 V208 H0 Z" fill="#a09684" />
      <path d="M0 147 C38 137 74 162 108 151 C128 145 144 147 156 142 V208 H0 Z" fill="#776e60" />
      <path d="M0 171 C44 161 82 186 118 174 C134 169 146 171 156 168 V208 H0 Z" fill="#514b41" />
      <path d="M0 195 C40 187 80 206 120 197 C136 193 146 195 156 192 V208 H0 Z" fill="#3b3731" />
      <path d="M0 88 C42 78 78 102 118 90 C132 86 144 88 156 84" fill="none" stroke="#5f8271" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="116" cy="51" r="2" fill="#3b3731" />
    </svg>
  );
}

function Orbit() {
  return (
    <svg viewBox="0 0 156 208" preserveAspectRatio="xMidYMid slice" className={svg} focusable="false">
      <defs>
        <radialGradient id="stk-orbit-glow" cx="0.5" cy="0.42" r="0.62">
          <stop offset="0" stopColor="#2b2e31" />
          <stop offset="1" stopColor="#1a1c1e" />
        </radialGradient>
      </defs>
      <rect width="156" height="208" fill="url(#stk-orbit-glow)" />
      {[28, 46, 64, 82, 100].map((radius) => (
        <circle key={radius} cx="78" cy="96" r={radius} fill="none" stroke="#3a3d40" strokeWidth="1" />
      ))}
      <path d="M78 14 A82 82 0 0 1 160 96" fill="none" stroke="#cdc8be" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M78 178 A82 82 0 0 1 -4 96" fill="none" stroke="#777d80" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="78" cy="96" r="20" fill="#26282b" stroke="#4a4e51" />
      <circle cx="78" cy="96" r="6" fill="#d5d0c6" />
      <circle cx="141" cy="69" r="3.4" fill="#69a187" />
      <path d="M78 8 V22 M78 170 V184 M12 96 H26 M130 96 H144" stroke="#4a4e51" strokeWidth="1" />
      <path d="M20 180 L34 166 M122 26 L136 12" stroke="#3a3d40" strokeWidth="1" />
      <circle cx="34" cy="166" r="1.8" fill="#8b918f" />
    </svg>
  );
}

function Fold() {
  return (
    <svg viewBox="0 0 156 208" preserveAspectRatio="xMidYMid slice" className={svg} focusable="false">
      <defs>
        <linearGradient id="stk-fold-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e3ded4" />
          <stop offset="1" stopColor="#b2a898" />
        </linearGradient>
        <linearGradient id="stk-fold-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6f2ea" />
          <stop offset="1" stopColor="#d8d1c4" />
        </linearGradient>
        <linearGradient id="stk-fold-shade" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#9c9283" />
          <stop offset="1" stopColor="#6d655a" />
        </linearGradient>
      </defs>
      <rect width="156" height="208" fill="url(#stk-fold-bg)" />
      <path d="M0 0 H156 L0 172 Z" fill="url(#stk-fold-light)" />
      <path d="M156 0 V208 L0 172 Z" fill="url(#stk-fold-shade)" />
      <path d="M156 0 L0 172 L78 208 L156 150 Z" fill="#cbc3b5" opacity="0.55" />
      <path d="M0 172 L78 208 L52 208 L0 184 Z" fill="#857b6d" opacity="0.7" />
      <path d="M156 0 L0 172" fill="none" stroke="#f7f4ed" strokeWidth="1.2" />
      <path d="M156 96 L64 208" fill="none" stroke="#5f8271" strokeWidth="1.6" opacity="0.8" />
      <circle cx="120" cy="46" r="13" fill="none" stroke="#f2eee6" strokeWidth="1" opacity="0.8" />
      <circle cx="120" cy="46" r="3" fill="#f2eee6" />
    </svg>
  );
}

function Ridge() {
  const contours = [
    "M-8 54 C28 38 54 62 84 50 C112 39 136 50 164 34",
    "M-8 72 C26 56 58 80 90 68 C118 57 140 68 164 54",
    "M-8 92 C30 74 58 100 92 88 C120 78 142 88 164 74",
    "M-8 114 C32 96 62 120 94 108 C122 98 144 108 164 96",
    "M-8 138 C34 120 64 144 96 132 C124 122 146 132 164 122",
    "M-8 164 C38 146 68 170 98 158 C126 148 148 158 164 150",
    "M-8 192 C40 174 74 198 104 186 C130 176 150 186 164 180",
  ];

  return (
    <svg viewBox="0 0 156 208" preserveAspectRatio="xMidYMid slice" className={svg} focusable="false">
      <defs>
        <linearGradient id="stk-ridge-bg" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#eeebe4" />
          <stop offset="1" stopColor="#dcd6c9" />
        </linearGradient>
      </defs>
      <rect width="156" height="208" fill="url(#stk-ridge-bg)" />
      <path d="M-8 54 C28 38 54 62 84 50 C112 39 136 50 164 34 V208 H-8 Z" fill="#e6e1d5" />
      {contours.map((d) => (
        <path key={d} d={d} fill="none" stroke="#a99f8e" strokeWidth="1.1" strokeLinecap="round" />
      ))}
      <path d="M-8 114 C32 96 62 120 94 108 C122 98 144 108 164 96" fill="none" stroke="#5f8271" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M-8 164 C38 146 68 170 98 158 C126 148 148 158 164 150 V208 H-8 Z" fill="#948a79" opacity="0.5" />
      <circle cx="48" cy="62" r="15" fill="#2d2c29" />
      <path d="M48 39 V47 M48 77 V85 M25 62 H33 M63 62 H71" stroke="#2d2c29" strokeWidth="1" />
    </svg>
  );
}

function Bloom() {
  const petals = Array.from({ length: 10 }, (_, index) => index * 36);

  return (
    <svg viewBox="0 0 156 208" preserveAspectRatio="xMidYMid slice" className={svg} focusable="false">
      <defs>
        <linearGradient id="stk-bloom-bg" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#e8ebe4" />
          <stop offset="1" stopColor="#d3dacf" />
        </linearGradient>
      </defs>
      <rect width="156" height="208" fill="url(#stk-bloom-bg)" />
      <g transform="translate(78 102)">
        {petals.map((angle, index) => (
          <ellipse
            key={angle}
            rx={index % 2 === 0 ? 20 : 15}
            ry={index % 2 === 0 ? 68 : 54}
            fill={index % 3 === 0 ? "#5f8271" : "#7c9a88"}
            opacity={index % 2 === 0 ? 0.75 : 0.5}
            transform={`rotate(${angle})`}
          />
        ))}
        <circle r="21" fill="#f1eee5" />
        <circle r="9" fill="#3b3731" />
        <circle r="3" cy="-3" fill="#f1eee5" />
      </g>
      <path d="M-8 186 C30 176 62 194 94 184 C118 177 140 182 164 172" fill="none" stroke="#aab4a7" strokeWidth="1.2" />
      <circle cx="128" cy="42" r="2.2" fill="#5f8271" />
      <circle cx="26" cy="150" r="1.6" fill="#5f8271" />
    </svg>
  );
}
