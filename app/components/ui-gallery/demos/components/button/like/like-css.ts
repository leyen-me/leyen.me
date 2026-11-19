/**
 * Bencho's `.lk-*` animation layer, ported verbatim and scoped under
 * `.like-demo`. Static layout and colour live in Tailwind classes; what is
 * left here is the keyframe work and the per-particle custom properties that
 * Tailwind cannot express. Keyframe names are prefixed to stay unique in the
 * gallery's global page.
 */
export const LIKE_CSS = `
.like-demo .like-bloom {
  box-sizing: border-box;
  position: absolute;
  top: -17px;
  left: -17px;
  width: 34px;
  height: 34px;
  border: 17px solid #cc8ef5;
  border-radius: 50%;
  animation: like-bloom 0.56s cubic-bezier(0.25, 0.8, 0.35, 1) both;
}
@keyframes like-bloom {
  0% {
    border-width: 17px;
    border-color: #e5484d;
    scale: 0.15;
  }
  40% {
    border-width: 17px;
    border-color: #cc8ef5;
    scale: 1;
  }
  75% {
    opacity: 1;
    border-width: 2px;
  }
  to {
    opacity: 0;
    border-width: 0;
    border-color: #cc8ef5;
    scale: 1.12;
  }
}

.like-demo .like-spoke {
  position: absolute;
  top: 0;
  left: 0;
  rotate: var(--a);
}
.like-demo .like-spoke i {
  position: absolute;
  width: 5px;
  height: 5px;
  margin: -2.5px 0 0 -2.5px;
  border-radius: 50%;
  background: var(--c);
  animation: like-dot 0.62s cubic-bezier(0.2, 0.8, 0.3, 1) 0.2s both;
}
.like-demo .like-spoke i:first-child {
  --side: -4px;
  --far: 0px;
}
.like-demo .like-spoke i:last-child {
  --side: 4px;
  --far: -5px;
  width: 4px;
  height: 4px;
  margin: -2px 0 0 -2px;
}
@keyframes like-dot {
  0% {
    translate: 12px var(--side);
    opacity: 0;
    scale: 1;
  }
  12% {
    opacity: 1;
  }
  to {
    translate: calc(18px + var(--fly) * 14px + var(--far))
      calc(var(--side) * 1.6);
    opacity: 1;
    scale: 0;
  }
}

.like-demo .like-fw {
  position: absolute;
  top: 0;
  left: 0;
  animation: like-fw-x 1s cubic-bezier(0.2, 0.7, 0.4, 1) var(--d) both;
}
.like-demo .like-fw i {
  position: absolute;
  top: -2px;
  left: -2px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  animation: like-fw-y 1s linear var(--d) both;
}
@keyframes like-fw-x {
  0% {
    translate: 0;
  }
  to {
    translate: var(--x) 0;
  }
}
@keyframes like-fw-y {
  0% {
    opacity: 1;
    animation-timing-function: cubic-bezier(0.2, 0.7, 0.4, 1);
    translate: 0;
  }
  45% {
    translate: 0 var(--y);
    opacity: 1;
    animation-timing-function: cubic-bezier(0.5, 0, 0.8, 0.5);
  }
  to {
    translate: 0 calc(var(--y) + 30px);
    opacity: 0;
  }
}

.like-demo .like-digit {
  display: block;
  line-height: 1.25em;
}
.like-demo .like-digit-in-up,
.like-demo .like-digit-in-down,
.like-demo .like-digit-out-up,
.like-demo .like-digit-out-down {
  animation-duration: 0.42s;
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  animation-fill-mode: both;
}
.like-demo .like-digit-in-up {
  animation-name: like-roll-in-up;
}
.like-demo .like-digit-in-down {
  animation-name: like-roll-in-down;
}
.like-demo .like-digit-out-up,
.like-demo .like-digit-out-down {
  position: absolute;
  top: 0;
  left: 0;
}
.like-demo .like-digit-out-up {
  animation-name: like-roll-out-up;
}
.like-demo .like-digit-out-down {
  animation-name: like-roll-out-down;
}
@keyframes like-roll-in-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes like-roll-in-down {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes like-roll-out-up {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
}
@keyframes like-roll-out-down {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}

.like-demo .like-glyph-on {
  animation: like-heart 0.76s cubic-bezier(0.3, 1.6, 0.4, 1) both;
}
@keyframes like-heart {
  0%,
  28% {
    scale: 0;
  }
  62% {
    scale: 1.25;
  }
  to {
    scale: 1;
  }
}
.like-demo .like-glyph-pop {
  animation: like-pop 0.52s cubic-bezier(0.3, 1.5, 0.4, 1) both;
}
@keyframes like-pop {
  0% {
    scale: 0.6;
  }
  45% {
    scale: 1.28;
  }
  to {
    scale: 1;
  }
}

/* Two-ring focus, as on Bencho; the dark ring hue is lifted for contrast. */
.like-demo .like-button:focus-visible {
  outline: none;
  box-shadow:
    inset 0 0 0 1px rgba(23, 24, 26, 0.08),
    0 0 0 2px #f7f7f6,
    0 0 0 4px #2231dd;
}
.dark .like-demo .like-button:focus-visible {
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.14),
    0 0 0 2px #18181b,
    0 0 0 4px #8b96ff;
}

@media (prefers-reduced-motion: reduce) {
  .like-demo .like-digit-in-up,
  .like-demo .like-digit-in-down,
  .like-demo .like-digit-out-up,
  .like-demo .like-digit-out-down,
  .like-demo .like-glyph-on,
  .like-demo .like-glyph-pop,
  .like-demo .like-bloom,
  .like-demo .like-spoke i,
  .like-demo .like-fw,
  .like-demo .like-fw i {
    animation: none;
  }
  .like-demo .like-burst {
    display: none;
  }
}
`;
