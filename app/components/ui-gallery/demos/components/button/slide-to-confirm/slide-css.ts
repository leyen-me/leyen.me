/**
 * Bencho's `.sld-*` layer, scoped under `.slide-demo` and resolved for the
 * gallery. The source reads `--fill-on` / `--fill-slab` / `--pane-edge` from
 * its stage; here the slab comes from the shared `--surface-0` token and the
 * remaining values are fixed light/dark pairs.
 * Only the press pulse and the done-label fade live in CSS; the rest of the
 * motion is driven frame by frame by the springs in `motion.ts`.
 */
export const SLIDE_CSS = `
.slide-demo {
  --sld-slab: var(--surface-0);
  --sld-on: #17181a;
  --sld-signal: #2231dd;
}
.dark .slide-demo {
  --sld-on: #ffffff;
  --sld-signal: #8b96ff;
}

.slide-demo .sld {
  position: relative;
  margin: 0 auto;
  font-family: inherit;
  color: var(--sld-on);
}
.slide-demo .sld-track {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  background: var(--sld-slab);
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.slide-demo .sld-track[data-done] {
  animation: sld-press 0.42s cubic-bezier(0.33, 0.55, 0.2, 1) 0.1s both;
}
@keyframes sld-press {
  0% {
    scale: 1;
  }
  62% {
    scale: 0.974;
  }
  100% {
    scale: 1;
  }
}

.slide-demo .sld-wash {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  z-index: 1;
  background: var(--sld-on);
  pointer-events: none;
}

.slide-demo .sld-say {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: color-mix(in srgb, var(--sld-on) 52%, var(--sld-slab));
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.01em;
  white-space: nowrap;
  pointer-events: none;
}

.slide-demo .sld-grip {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 2;
  display: block;
  box-sizing: border-box;
  height: 48px;
  padding: 0;
  overflow: hidden;
  border: 0;
  background: var(--sld-on);
  color: var(--sld-slab);
  transform-origin: 0% 50%;
  cursor: grab;
  touch-action: none;
  outline: none;
}
.slide-demo .sld-track[data-held] .sld-grip {
  cursor: grabbing;
}
.slide-demo .sld-track[data-done] .sld-grip {
  cursor: default;
}
.slide-demo .sld-grip:focus-visible {
  box-shadow:
    0 0 0 2px var(--sld-slab),
    0 0 0 4px var(--sld-signal);
}

.slide-demo .sld-arrow,
.slide-demo .sld-done {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.01em;
  white-space: nowrap;
  pointer-events: none;
}
.slide-demo .sld-done {
  opacity: 0;
  transform: scale(0.7);
  transition:
    opacity 0.16s cubic-bezier(0.33, 0.55, 0.2, 1),
    transform 0.16s cubic-bezier(0.33, 0.55, 0.2, 1);
}
.slide-demo .sld-track[data-done] .sld-done {
  opacity: 1;
  transform: scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .slide-demo .sld-track[data-done] {
    animation: none;
  }
  .slide-demo .sld-done {
    transition: none;
  }
}
`;
