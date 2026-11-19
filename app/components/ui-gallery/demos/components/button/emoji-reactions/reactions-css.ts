/**
 * Bencho's `.rxn-*` motion layer, ported verbatim and scoped under
 * `.rxn-demo`. Static layout and colour live in Tailwind classes; this file
 * keeps the keyframes, the emoji choreography and the per-item custom
 * properties that Tailwind cannot express.
 */
export const REACTIONS_CSS = `
.rxn-demo .rxn-text {
  display: block;
  width: max-content;
  white-space: nowrap;
  padding: 0 20px;
  font-size: 16px;
  line-height: 22px;
  letter-spacing: -0.01em;
  transform-origin: 50%;
  transition:
    opacity 0.22s ease 0.08s,
    filter 0.22s ease 0.08s,
    transform 0.22s ease 0.08s;
}
.rxn-demo .rxn-morph[data-open="true"] .rxn-text {
  opacity: 0;
  filter: blur(4px);
  transform: scale(0.96);
  transition-duration: 0.09s;
  transition-delay: 0s;
}

.rxn-demo .rxn-add {
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}

.rxn-demo .rxn-emo {
  animation: rxn-in 0.22s cubic-bezier(0.24, 1.34, 0.38, 1) backwards;
  animation-delay: var(--d, 0s);
}
.rxn-demo .rxn-emo span {
  display: block;
  font-size: 20px;
  line-height: 1;
  letter-spacing: -0.02em;
  transform: scale(var(--s, 1));
  transform-origin: 50% 90%;
  transition: transform 0.22s cubic-bezier(0.24, 1.34, 0.38, 1);
}

.rxn-demo .rxn-chip-in {
  animation: rxn-chip-in 0.42s cubic-bezier(0.24, 1.34, 0.38, 1) backwards;
}

.rxn-demo .rxn-fly {
  position: absolute;
  top: 0;
  left: 0;
  display: grid;
  width: 24px;
  height: 24px;
  margin: -12px 0 0 -12px;
  place-items: center;
  font-size: 16px;
  letter-spacing: -0.01em;
  pointer-events: none;
  z-index: 6;
  animation: rxn-fly 0.6s cubic-bezier(0.35, 0, 0.3, 1) forwards;
}

.rxn-demo .rxn-tip {
  animation: rxn-tip-in 0.16s ease-out both;
}

/* the little emoji performances */
.rxn-demo .rxn-p {
  position: relative;
  display: inline-block;
  font-style: normal;
  line-height: 1;
}
.rxn-demo .rxn-p[data-play][data-k="launch"] {
  animation: rxn-launch 0.64s cubic-bezier(0.3, 1.2, 0.4, 1);
}
.rxn-demo .rxn-p[data-play][data-k="launch"]:after {
  content: "";
  position: absolute;
  top: 70%;
  left: 20%;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: color-mix(in srgb, currentColor 20%, transparent);
  animation: rxn-puff 0.52s ease-out forwards;
}
.rxn-demo .rxn-p[data-play][data-k="flicker"] {
  animation: rxn-flicker 0.62s ease-out;
}
.rxn-demo .rxn-p[data-play][data-k="confetti"] {
  animation: rxn-pop 0.42s cubic-bezier(0.3, 1.6, 0.4, 1);
}
.rxn-demo .rxn-bits {
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: none;
}
.rxn-demo .rxn-bits b {
  position: absolute;
  width: 3px;
  height: 3px;
  margin: -1.5px;
  border-radius: 1px;
  background: var(--c);
  animation: rxn-bit 0.56s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
}
.rxn-demo .rxn-p[data-play][data-k="glance"] {
  animation: rxn-glance 0.7s ease-in-out;
}
.rxn-demo .rxn-p[data-play][data-k="tick"] {
  animation: rxn-tick 0.46s cubic-bezier(0.3, 1.6, 0.4, 1);
}
.rxn-demo .rxn-p[data-play][data-k="beat"] {
  animation: rxn-beat 0.62s ease-in-out;
}
.rxn-demo .rxn-p[data-play][data-k="nod"] {
  transform-origin: 50% 90%;
  animation: rxn-nod 0.52s cubic-bezier(0.3, 1.4, 0.4, 1);
}
.rxn-demo .rxn-p[data-play][data-k="laugh"] {
  animation: rxn-laugh 0.56s ease-in-out;
}
.rxn-demo .rxn-p[data-play][data-k="wow"] {
  transform-origin: 50% 100%;
  animation: rxn-wow 0.52s cubic-bezier(0.3, 1.5, 0.4, 1);
}
.rxn-demo .rxn-p[data-play][data-k="droop"] {
  transform-origin: 50% 100%;
  animation: rxn-droop 0.7s ease-in-out;
}
.rxn-demo .rxn-p[data-play][data-k="bow"] {
  transform-origin: 50% 100%;
  animation: rxn-bow 0.62s ease-in-out;
}

@keyframes rxn-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.5);
    filter: blur(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}
@keyframes rxn-chip-in {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes rxn-tip-in {
  from {
    opacity: 0;
    transform: translate(-50%, 4px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
@keyframes rxn-fly {
  0% {
    transform: translate(var(--fx), var(--fy)) scale(1.4) rotate(0deg);
  }
  45% {
    transform: translate(var(--mx), var(--my)) scale(1.25) rotate(-14deg);
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(1) rotate(0deg);
  }
}

@keyframes rxn-launch {
  0% {
    transform: translate(0) rotate(0);
  }
  30% {
    transform: translate(2px, -7px) rotate(-12deg);
  }
  60% {
    transform: translate(-1px, 1px) rotate(4deg);
  }
  to {
    transform: translate(0) rotate(0);
  }
}
@keyframes rxn-puff {
  0% {
    opacity: 0;
    transform: scale(0.4);
  }
  25% {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: translate(-5px, 6px) scale(1.6);
  }
}
@keyframes rxn-flicker {
  0% {
    filter: brightness(1);
    transform: scale(1);
  }
  15% {
    filter: brightness(1.35);
    transform: scale(1.18, 1.1);
  }
  30% {
    filter: brightness(1);
    transform: scale(0.94, 1.08);
  }
  48% {
    filter: brightness(1.25);
    transform: scale(1.1, 0.96);
  }
  66% {
    transform: scale(0.98, 1.04);
  }
  to {
    filter: brightness(1);
    transform: scale(1);
  }
}
@keyframes rxn-pop {
  0% {
    transform: scale(0.7) rotate(-12deg);
  }
  50% {
    transform: scale(1.18) rotate(6deg);
  }
  to {
    transform: none;
  }
}
@keyframes rxn-bit {
  0% {
    opacity: 1;
    transform: rotate(var(--a)) translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: rotate(var(--a)) translateY(-16px) scale(0.6);
  }
}
@keyframes rxn-glance {
  0%,
  to {
    transform: translate(0);
  }
  25% {
    transform: translate(-2.5px);
  }
  60% {
    transform: translate(2.5px);
  }
}
@keyframes rxn-tick {
  0% {
    transform: scale(0.6) rotate(-14deg);
  }
  55% {
    transform: scale(1.2) rotate(4deg);
  }
  to {
    transform: none;
  }
}
@keyframes rxn-beat {
  0%,
  to {
    transform: scale(1);
  }
  15% {
    transform: scale(1.26);
  }
  30% {
    transform: scale(1);
  }
  45% {
    transform: scale(1.18);
  }
  60% {
    transform: scale(1);
  }
}
@keyframes rxn-nod {
  0% {
    transform: rotate(0);
  }
  35% {
    transform: rotate(-16deg) translateY(-2px);
  }
  to {
    transform: rotate(0);
  }
}
@keyframes rxn-laugh {
  0%,
  to {
    transform: rotate(0);
  }
  20% {
    transform: rotate(-10deg);
  }
  40% {
    transform: rotate(9deg);
  }
  60% {
    transform: rotate(-7deg);
  }
  80% {
    transform: rotate(4deg);
  }
}
@keyframes rxn-wow {
  0% {
    transform: scale(1);
  }
  35% {
    transform: scale(0.92, 1.22);
  }
  to {
    transform: scale(1);
  }
}
@keyframes rxn-droop {
  0%,
  to {
    transform: none;
  }
  40% {
    transform: translateY(2px) rotate(-8deg) scale(0.96);
  }
}
@keyframes rxn-bow {
  0%,
  to {
    transform: none;
  }
  40% {
    transform: translateY(2px) scaleY(0.9);
  }
  60% {
    transform: translateY(1px) scaleY(0.95);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rxn-demo *,
  .rxn-demo *::before,
  .rxn-demo *::after {
    animation-duration: 0.001ms !important;
    animation-delay: 0ms !important;
    transition-duration: 0.001ms !important;
    transition-delay: 0ms !important;
  }
}
`;
