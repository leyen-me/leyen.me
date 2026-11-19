/**
 * Bencho's `.rct-*` styles, ported and scoped under `.roll-demo`.
 *
 * The palette variables resolve Bencho's `--fill-slab` / `--fill-on` /
 * `--pane-edge` for the light and dark fills. Only the structural CSS that
 * Tailwind cannot express (the masked odometer window, collapsing columns and
 * the two-stage focus ring) lives here.
 */
export const ROLLING_COUNTER_CSS = `
.roll-demo {
  --rct-slab: var(--surface-0);
  --rct-ink: #17181a;
  --rct-edge: rgba(23, 24, 26, 0.08);
  --rct-signal: #2231dd;
  /* color-mix(in srgb, #17181a 6%, #ffffff) and 10% */
  --rct-btn: #f1f1f1;
  --rct-btn-hover: #e8e8e8;
}

.dark .roll-demo {
  --rct-ink: #ffffff;
  --rct-edge: rgba(255, 255, 255, 0.08);
  /* color-mix(in srgb, #ffffff 6%, #18181b) and 10% */
  --rct-btn: #333333;
  --rct-btn-hover: #3c3c3c;
}

.roll-demo .rct {
  font-family: inherit;
  display: flex;
  position: relative;
  align-items: center;
  gap: 0;
  padding: 5px;
  border-radius: var(--rct-r);
  background: var(--rct-slab);
  color: var(--rct-ink);
  box-shadow: 0 0 0 1px var(--rct-edge);
}

.roll-demo .rct-btn {
  display: grid;
  flex: none;
  place-items: center;
  width: 40px;
  height: var(--rct-cell);
  padding: 0;
  border: 0;
  border-radius: var(--rct-in);
  background: var(--rct-btn);
  color: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    scale 0.2s cubic-bezier(0.3, 0.9, 0.4, 1),
    background-color 0.16s;
}

.roll-demo .rct-btn:hover {
  background: var(--rct-btn-hover);
}

.roll-demo .rct-btn:active {
  transition-duration: 0.11s;
  scale: 0.9;
}

.roll-demo .rct-btn:focus-visible,
.roll-demo .rct-num:focus-visible {
  box-shadow:
    0 0 0 2px var(--rct-slab),
    0 0 0 4px var(--rct-signal);
  outline: none;
}

/* Lift the number only while focused so its ring is not painted under the
   opaque More button. */
.roll-demo .rct-num:focus-visible {
  position: relative;
  z-index: 1;
}

.roll-demo .rct-num {
  display: flex;
  height: var(--rct-cell);
  justify-content: center;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 30px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: var(--rct-cell);
  cursor: ns-resize;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}

.roll-demo .rct-window {
  display: flex;
  height: var(--rct-cell);
  -webkit-mask-image: linear-gradient(#0000, #000 20% 80%, #0000);
  mask-image: linear-gradient(#0000, #000 20% 80%, #0000);
}

.roll-demo .rct-pair {
  display: flex;
}

.roll-demo .rct-col {
  opacity: 0;
  width: 0;
  height: var(--rct-cell);
  overflow: hidden;
  transition:
    width 0.32s cubic-bezier(0.3, 1.2, 0.4, 1),
    opacity 0.22s;
}

.roll-demo .rct-col[data-on] {
  opacity: 1;
  width: 0.64em;
}

.roll-demo .rct-strip {
  display: flex;
  flex-direction: column;
  align-items: center;
  will-change: transform;
}

.roll-demo .rct-strip > span {
  height: var(--rct-cell);
}

.roll-demo .rct-sep {
  opacity: 0;
  width: 0;
  overflow: hidden;
  transition:
    width 0.32s cubic-bezier(0.3, 1.2, 0.4, 1),
    opacity 0.22s;
}

.roll-demo .rct-sep[data-on] {
  opacity: 1;
  width: 0.26em;
}

@media (prefers-reduced-motion: reduce) {
  .roll-demo .rct-btn,
  .roll-demo .rct-col,
  .roll-demo .rct-sep {
    transition: none;
  }
}
`;
