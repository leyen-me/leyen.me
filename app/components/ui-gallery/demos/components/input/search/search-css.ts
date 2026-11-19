/**
 * Bencho's `.sek-*` layer, ported from `index-0e0OZHzj.css` and scoped under
 * `.seek-demo`. The resolved `--pane` / `--ink-*` tokens live here so the
 * component keeps working in both gallery themes; width, say and magnet values
 * arrive as inline custom properties from the JS spring.
 */
export const SEARCH_CSS = `
.seek-demo {
  --seek-shut: 48px;
  --seek-inset: 14px;
  --seek-lens-size: 20px;
  --seek-corner: 24px;
  --seek-w: 48px;
  --seek-say: 0;
  --seek-lx: 0px;
  --seek-ly: 0px;
  --seek-sk: 1;
  --seek-ink: #17181a;
  --seek-ink-3: #5c5b56;
  --seek-ink-4: #6f6e68;
  --seek-ink-5: #85847e;
  --seek-pane: rgba(255, 255, 255, 0.35);
  --seek-edge: rgba(23, 24, 26, 0.08);
  --seek-focus: rgba(52, 211, 153, 0.6);
  color: var(--seek-ink);
  -webkit-tap-highlight-color: transparent;
}

.dark .seek-demo {
  --seek-ink: #ffffff;
  --seek-ink-3: #9a9a9a;
  --seek-ink-4: #828282;
  --seek-ink-5: #6b6b6b;
  --seek-pane: rgba(255, 255, 255, 0.16);
  --seek-edge: rgba(255, 255, 255, 0.2);
  --seek-focus: rgba(52, 211, 153, 0.65);
}

.seek-demo .sek {
  position: relative;
  display: grid;
  place-items: center;
  width: var(--seek-frame, 266px);
  height: var(--seek-frameh, 88px);
  font-family: inherit;
}

/* One box whose width is the state: the lens stays at a fixed inset and the
   field has been inside it the whole time. Radius is constant, so the circle
   and the pill are the same shape rule at two widths. */
.seek-demo .sek-skin {
  position: relative;
  width: var(--seek-w);
  height: var(--seek-shut);
  border-radius: var(--seek-corner);
  background: var(--seek-pane);
  -webkit-backdrop-filter: blur(25px) saturate(150%) brightness(100%);
  backdrop-filter: blur(25px) saturate(150%) brightness(100%);
  isolation: isolate;
  overflow: hidden;
  transform: translate(var(--seek-lx), var(--seek-ly)) scale(var(--seek-sk));
  transition:
    transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.22s;
}

.seek-demo .sek-skin::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  border: 1px solid var(--seek-edge);
  border-radius: inherit;
  pointer-events: none;
}

.seek-demo .sek:not([data-open="true"]) .sek-skin:hover {
  --seek-sk: 1.045;
}

.seek-demo .sek:not([data-open="true"]) .sek-skin:active,
.seek-demo .sek:not([data-open="true"])[data-press="true"] .sek-skin {
  --seek-sk: 0.93;
  transition: transform 0.16s cubic-bezier(0.22, 1, 0.36, 1);
}

.seek-demo .sek[data-open="true"] .sek-skin {
  cursor: text;
}

.seek-demo .sek:focus-within .sek-skin {
  box-shadow: inset 0 0 0 2px var(--seek-focus);
}

/* (48 - 20) / 2 = 14, which is also the field's left padding. */
.seek-demo .sek-lens {
  position: absolute;
  top: 50%;
  left: var(--seek-inset);
  width: var(--seek-lens-size);
  height: var(--seek-lens-size);
  margin-top: calc(var(--seek-lens-size) / -2);
  fill: none;
  stroke: var(--seek-ink-3);
  stroke-width: 1.5px;
  stroke-linecap: round;
  pointer-events: none;
  transition:
    stroke 0.22s,
    stroke-width 0.22s;
}

.seek-demo .sek-skin:hover .sek-lens {
  stroke: var(--seek-ink);
}

.seek-demo .sek[data-open="true"] .sek-lens {
  stroke: var(--seek-ink-4);
}

.seek-demo .sek[data-busy="true"] .sek-lens {
  stroke: var(--seek-ink);
  stroke-width: 1.8px;
}

.seek-demo .sek-field {
  position: absolute;
  top: 0;
  right: 14px;
  left: calc(var(--seek-inset) + var(--seek-lens-size) + 11px);
  height: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  outline: none;
  background: none;
  color: var(--seek-ink);
  font: inherit;
  font-size: 16px;
  letter-spacing: -0.01em;
  opacity: var(--seek-say);
  transform: translateX(calc((1 - var(--seek-say)) * -6px));
  pointer-events: none;
}

.seek-demo .sek[data-open="true"] .sek-field {
  pointer-events: auto;
}

.seek-demo .sek-field::placeholder {
  color: var(--seek-ink-5);
  opacity: 1;
}

.seek-demo .sek-hit {
  position: absolute;
  inset: 0;
  z-index: 3;
  border: 0;
  border-radius: inherit;
  background: none;
  cursor: pointer;
}

.seek-demo .sek-hit:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--seek-focus);
}

@keyframes seek-panel-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.seek-demo .seek-panel {
  animation: seek-panel-in 0.18s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .seek-demo .sek-skin,
  .seek-demo .sek-lens,
  .seek-demo .sek-field {
    transition-duration: 0.16s;
  }

  .seek-demo .seek-panel {
    animation: none;
  }

  .seek-demo .sek:not([data-open="true"]) .sek-skin:hover {
    --seek-sk: 1;
  }
}
`;
