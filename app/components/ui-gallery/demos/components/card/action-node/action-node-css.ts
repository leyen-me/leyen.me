/**
 * Bencho's `.nod-*` layer, scoped to this demo and resolved from the wall's
 * design tokens to concrete light/dark values.
 *
 * Light:  card #ffffff, ink #17181a, wash .06, edge rgba(23,24,26,.08)
 * Dark:   card #262626, ink #ffffff, wash .053, edge rgba(255,255,255,.08)
 *
 * `.an-act`'s `--pop` is written every animation frame by the spring, so it is
 * deliberately not transitioned; only `--zoom` (hover) is eased. `--zoom` needs
 * `@property` to be interpolatable at all, exactly like Bencho's global
 * registration.
 */
export const ACTION_NODE_CSS = `
@property --zoom {
  syntax: "<number>";
  inherits: false;
  initial-value: 1;
}

.action-node-demo {
  --an-card: #ffffff;
  --an-ink: #17181a;
  --an-ink-rgb: 23, 24, 26;
  --an-ink-3: #5c5b56;
  --an-ink-4: #6f6e68;
  --an-wash: 0.06;
  --an-edge: rgba(23, 24, 26, 0.08);
  --an-focus: 52, 211, 153;
  color: var(--an-ink);
}

.dark .action-node-demo {
  --an-card: #262626;
  --an-ink: #ffffff;
  --an-ink-rgb: 255, 255, 255;
  --an-ink-3: #9a9a9a;
  --an-ink-4: #828282;
  --an-wash: 0.053;
  --an-edge: rgba(255, 255, 255, 0.08);
}

/* Below the width the fan needs (card 272 + 48 of fan), shrink the whole
   composition rather than clipping the buttons against the preview box. */
@container (max-width: 329px) {
  .an-scaler {
    scale: 0.84;
  }
}

.an-nod {
  position: relative;
  width: max-content;
}

.an-card {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  width: 272px;
  padding: 20px;
  border-radius: var(--an-r, 20px);
  background: var(--an-card);
  color: var(--an-ink);
  box-shadow: 0 0 0 1px var(--an-edge);
  transition: translate 220ms cubic-bezier(0.24, 1.34, 0.38, 1);
}

.an-card[data-on] {
  translate: 0 -1px;
}

.an-card:focus-visible {
  outline: 2px solid rgba(var(--an-focus), 0.65);
  outline-offset: 3px;
}

.an-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.an-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--an-mark-r, 14px);
  background: rgba(var(--an-ink-rgb), var(--an-wash));
  color: var(--an-ink);
}

.an-name {
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.an-say {
  margin: 13px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--an-ink-3);
  letter-spacing: 0em;
}

.an-chain {
  display: flex;
  align-items: center;
  margin-top: 16px;
}

.an-link {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  overflow: hidden;
  background: color-mix(in srgb, var(--an-ink) 12%, transparent);
  box-shadow: 0 0 0 2px var(--an-card);
  font-size: 11px;
  font-weight: 500;
  color: var(--an-ink-4);
  letter-spacing: 0em;
  /* The next disc overlaps this one by 6px. With photographs that reads as a
     stack; with the initials fallback it would bite the second letter, so the
     text keeps clear of the overlap. */
  padding-right: 6px;
}

.an-link + .an-link {
  margin-left: -6px;
}

.an-more {
  margin-left: 8px;
  font-size: 11px;
  font-weight: 500;
  color: var(--an-ink-4);
  letter-spacing: 0em;
}

.an-fan {
  position: absolute;
  z-index: 0;
  width: 0;
  height: 0;
}

.an-reach {
  position: absolute;
  pointer-events: none;
}

.an-reach[data-on] {
  pointer-events: auto;
}

.an-act {
  position: absolute;
  top: 0;
  left: 0;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--an-card);
  color: var(--an-ink);
  box-shadow: 0 0 0 1px var(--an-edge);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  scale: calc(var(--pop, 1) * var(--zoom, 1));
  transition: --zoom 160ms cubic-bezier(0.24, 1.34, 0.38, 1);
}

.an-act:hover {
  --zoom: 1.12;
}

.an-act:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--an-card),
    0 0 0 4px rgba(var(--an-focus), 0.7);
}

@media (prefers-reduced-motion: reduce) {
  .an-card {
    transition: none;
  }

  .an-act {
    transition: none;
  }
}
`;
