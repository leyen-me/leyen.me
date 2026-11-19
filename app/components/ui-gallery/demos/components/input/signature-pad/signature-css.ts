/**
 * Bencho's `.sig-*` layer, scoped under `.sig-demo`. Bencho feeds `--fill-slab`,
 * `--fill-on`, `--pane-edge` and `--signal` from its theme; here they are
 * resolved to the same light/dark values used elsewhere in the gallery. The
 * nib radius and inner radius stay inline custom properties because they are
 * driven by the `corner` option.
 */
export const SIGNATURE_CSS = `
.sig-demo {
  --sig-slab: #ffffff;
  --sig-ink: #17181a;
  --sig-blue: #2446d8;
  --sig-signal: #2231dd;
  --sig-edge: rgba(23, 24, 26, 0.14);
  --sig-green: #1f9d55;
}
.dark .sig-demo {
  --sig-slab: #202020;
  --sig-ink: #ffffff;
  --sig-blue: #7d95ff;
  --sig-signal: #8b96ff;
  --sig-edge: rgba(255, 255, 255, 0.1);
  --sig-green: #1f9d55;
}

.sig-demo .sig-frame {
  position: relative;
  display: grid;
  place-items: center;
  width: 300px;
  height: 180px;
}

.sig-demo .sig {
  position: relative;
  flex: none;
  width: 300px;
  height: 180px;
  overflow: hidden;
  border-radius: var(--sig-r, 20px);
  background: var(--sig-slab);
  color: var(--sig-ink);
  font-family: inherit;
  cursor: crosshair;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  box-shadow: inset 0 0 0 1px var(--sig-edge);
  transition:
    width 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    height 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    border-radius 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.sig-demo .sig[data-signed] {
  width: 112px;
  height: 40px;
  border-radius: 20px;
  cursor: default;
}
.sig-demo .sig:focus-visible {
  outline: 2px solid var(--sig-signal);
  outline-offset: 2px;
}

.sig-demo .sig-face {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 180px;
  translate: -50% -50%;
  transition:
    scale 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.42s 0.22s;
}
.sig-demo .sig[data-signed] .sig-face {
  opacity: 0;
  scale: 0.35;
  transition:
    scale 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.42s 0.16s;
}

.sig-demo .sig-ink {
  --sig-c: var(--sig-ink);
  position: absolute;
  inset: 0;
  overflow: visible;
  color: var(--sig-c);
  pointer-events: none;
  transition: color 0.26s;
}
.sig-demo .sig[data-ink="Blue"] .sig-ink {
  --sig-c: var(--sig-blue);
}
.sig-demo .sig[data-settled] .sig-ink {
  color: color-mix(in srgb, var(--sig-c) 30%, var(--sig-slab));
}

.sig-demo .sig-line {
  position: absolute;
  height: 1px;
  background: currentColor;
  opacity: 0.16;
  pointer-events: none;
}
.sig-demo .sig[data-settled] .sig-line {
  opacity: 0.08;
  transition: opacity 0.42s;
}

.sig-demo .sig-hint {
  position: absolute;
  top: 140px;
  right: 0;
  left: 0;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0;
  text-align: center;
  opacity: 0.38;
  pointer-events: none;
  transition: opacity 0.22s;
}
.sig-demo .sig[data-inked] .sig-hint,
.sig-demo .sig[data-settled] .sig-hint {
  opacity: 0;
}

.sig-demo .sig-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 6px;
  opacity: 0;
  scale: 0.9;
  pointer-events: none;
  transition:
    opacity 0.16s,
    scale 0.22s cubic-bezier(0.24, 1.34, 0.38, 1);
}
.sig-demo .sig[data-actions] .sig-actions {
  opacity: 1;
  scale: 1;
  pointer-events: auto;
}

.sig-demo .sig-btn {
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: var(--sig-inner, 10px);
  background: color-mix(in srgb, currentColor 7%, transparent);
  color: inherit;
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    background 0.16s,
    scale 0.22s cubic-bezier(0.24, 1.34, 0.38, 1);
}
.sig-demo .sig-btn:hover {
  background: color-mix(in srgb, currentColor 12%, transparent);
}
.sig-demo .sig-btn:active {
  scale: 0.96;
}
.sig-demo .sig-btn:focus-visible {
  outline: 2px solid var(--sig-signal);
  outline-offset: 2px;
}
.sig-demo .sig-btn:disabled {
  cursor: default;
}

.sig-demo .sig-said {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}
.sig-demo .sig-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0;
  white-space: nowrap;
  cursor: pointer;
  pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
  animation: sigpad-said 0.32s 0.42s both;
}
.sig-demo .sig-pill:focus-visible {
  outline: 2px solid var(--sig-signal);
  outline-offset: -2px;
  border-radius: 999px;
}
.sig-demo .sig-check {
  color: var(--sig-green);
  animation: sigpad-check 0.42s cubic-bezier(0.3, 1.6, 0.4, 1) 0.46s both;
}

@keyframes sigpad-said {
  0% {
    opacity: 0;
  }
}
@keyframes sigpad-check {
  0% {
    opacity: 0;
    rotate: -20deg;
    scale: 0.3;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sig-demo .sig,
  .sig-demo .sig-face,
  .sig-demo .sig-ink,
  .sig-demo .sig-line,
  .sig-demo .sig-hint,
  .sig-demo .sig-actions,
  .sig-demo .sig-btn {
    transition-duration: 1ms;
    transition-delay: 0s;
  }
  .sig-demo .sig-pill,
  .sig-demo .sig-check {
    animation: none;
  }
}
`;
