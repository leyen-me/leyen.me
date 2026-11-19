/**
 * Bencho's `.swp-*` rules, scoped to `.swp-stage`.
 *
 * The source reads `--fill-slab`, `--fill-on` and `--pane-edge` from the page
 * fill; those resolve here to the gallery's light and dark zinc surfaces.
 * Structural CSS that Tailwind cannot express (the stacked slabs, the clipped
 * picker and the two press states) lives in this block.
 */
export const ASSET_SWAP_CSS = `
.swp-stage {
  --swp-slab: var(--surface-0);
  --swp-on: #17181a;
  --swp-edge: rgba(23, 24, 26, 0.08);
  --swp-pick: #0d99ff;
  --swp-muted: #868789;
  --swp-hover: rgba(23, 24, 26, 0.06);
  --swp-hover-strong: rgba(23, 24, 26, 0.2);
  --swp-flip: #f1f1f1;
  --swp-r: 20px;
}

.dark .swp-stage {
  --swp-on: #ffffff;
  --swp-edge: rgba(255, 255, 255, 0.08);
  --swp-pick: #3aa9ff;
  --swp-muted: #929292;
  --swp-hover: rgba(255, 255, 255, 0.06);
  --swp-hover-strong: rgba(255, 255, 255, 0.2);
  --swp-flip: #2a2a2c;
}

.swp-stage .swp {
  position: relative;
  width: 300px;
  height: 235px;
  border-radius: var(--swp-r);
  overflow: hidden;
  color: var(--swp-on);
  font-family: inherit;
  letter-spacing: 0;
}

.swp-stage .swp-card {
  position: absolute;
  top: var(--swp-top, 0px);
  left: 0;
  right: 0;
  height: 116px;
  z-index: 1;
  overflow: hidden;
  border-radius: var(--swp-r);
  background: var(--swp-slab);
  box-shadow: inset 0 0 0 1px var(--swp-edge);
  opacity: 1;
  transition:
    top 500ms cubic-bezier(0.22, 1.12, 0.36, 1),
    height 500ms cubic-bezier(0.22, 1.12, 0.36, 1),
    transform 600ms cubic-bezier(0.25, 0.8, 0.3, 1),
    opacity 220ms 60ms;
}

.swp-stage .swp-card[data-lifted] {
  z-index: 3;
}

.swp-stage .swp-card[data-open] {
  top: 0;
  height: 235px;
}

.swp-stage .swp-card[data-collapsed] {
  transform: scaleY(0.02);
  opacity: 0;
  pointer-events: none;
  transition:
    top 500ms cubic-bezier(0.22, 1.12, 0.36, 1),
    height 500ms cubic-bezier(0.22, 1.12, 0.36, 1),
    transform 600ms cubic-bezier(0.25, 0.8, 0.3, 1),
    opacity 160ms 100ms;
}

.swp-stage .swp-face {
  position: absolute;
  left: 0;
  right: 0;
  height: 116px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 16px 16px;
  transition: opacity 220ms 140ms;
}

.swp-stage .swp-face[data-hidden] {
  opacity: 0;
  pointer-events: none;
  transition: opacity 160ms;
}

.swp-stage .swp-label {
  position: absolute;
  top: 16px;
  left: 16px;
  color: var(--swp-muted);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0;
}

.swp-stage .swp-amount {
  margin-bottom: 2px;
  font-size: 26px;
  font-weight: 500;
  line-height: 30px;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.swp-stage .swp-fiat {
  color: var(--swp-muted);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
}

.swp-stage .swp-coin {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  margin: 0;
  padding: 0 12px 0 4px;
  border: 0;
  border-radius: 999px;
  background: var(--swp-hover);
  color: inherit;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    background-color 160ms,
    scale 160ms;
}

.swp-stage .swp-coin:hover {
  background: var(--swp-hover-strong);
}

.swp-stage .swp-coin:active {
  scale: 0.96;
}

.swp-stage .swp-coin:focus-visible {
  outline: 2px solid var(--swp-pick);
  outline-offset: 2px;
}

.swp-stage .swp-logo {
  display: block;
  flex: none;
}

.swp-stage .swp-flag {
  display: block;
  flex: none;
  overflow: hidden;
  border-radius: 50%;
}

.swp-stage .swp-flag > svg {
  display: block;
}

.swp-stage .swp-mono {
  display: inline-grid;
  flex: none;
  place-items: center;
  border-radius: 50%;
  background: var(--swp-hover-strong);
  color: var(--swp-on);
  font-weight: 600;
  line-height: 1;
}

.swp-stage .swp-flip {
  position: absolute;
  top: 117.5px;
  left: 50%;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  margin: -20px 0 0 -20px;
  padding: 0;
  border: 0;
  border-radius: 20px;
  background: var(--swp-flip);
  color: var(--swp-on);
  box-shadow: inset 0 0 0 1px var(--swp-edge);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 280ms cubic-bezier(0.3, 1.4, 0.4, 1),
    opacity 180ms;
}

.swp-stage .swp-flip[data-dimmed] {
  transform: scale(0.5);
  opacity: 0;
  pointer-events: none;
  transition:
    transform 160ms,
    opacity 100ms;
}

.swp-stage .swp-flip:not([data-dimmed]):active {
  transform: scale(0.9);
}

.swp-stage .swp-flip:focus-visible {
  outline: 2px solid var(--swp-pick);
  outline-offset: 2px;
}

.swp-stage .swp-flip-arrow {
  display: grid;
  place-items: center;
  transition: transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.swp-stage .swp-pick {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px 12px;
  animation: swp-pick-in 220ms 100ms both;
}

.swp-stage .swp-pick[data-leaving] {
  animation: swp-pick-out 160ms both;
  pointer-events: none;
}

.swp-stage .swp-pick-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  margin-bottom: 2px;
  padding-left: 12px;
  color: var(--swp-muted);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0;
}

.swp-stage .swp-pick-x {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--swp-muted);
  cursor: pointer;
}

.swp-stage .swp-pick-x:hover {
  background: var(--swp-hover);
  color: var(--swp-on);
}

.swp-stage .swp-pick-x:focus-visible {
  outline: 2px solid var(--swp-pick);
  outline-offset: -2px;
}

.swp-stage .swp-pick-row {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 12px;
  min-height: 0;
  padding: 0 12px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.swp-stage .swp-pick-row:hover {
  background: var(--swp-hover);
}

.swp-stage .swp-pick-row:focus-visible {
  outline: 2px solid var(--swp-pick);
  outline-offset: -2px;
}

.swp-stage .swp-pick-sym {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.swp-stage .swp-pick-name {
  color: var(--swp-muted);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0;
}

.swp-stage .swp-pick-on {
  margin-left: auto;
}

@keyframes swp-pick-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes swp-pick-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.swp-stage .swp[data-reduced="true"] .swp-card,
.swp-stage .swp[data-reduced="true"] .swp-face,
.swp-stage .swp[data-reduced="true"] .swp-flip,
.swp-stage .swp[data-reduced="true"] .swp-flip-arrow,
.swp-stage .swp[data-reduced="true"] .swp-coin {
  transition-duration: 1ms;
  transition-delay: 0ms;
}

.swp-stage .swp[data-reduced="true"] .swp-pick {
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  .swp-stage .swp-card,
  .swp-stage .swp-face,
  .swp-stage .swp-flip,
  .swp-stage .swp-flip-arrow,
  .swp-stage .swp-coin {
    transition-duration: 1ms;
    transition-delay: 0ms;
  }

  .swp-stage .swp-pick {
    animation: none;
  }
}
`;
