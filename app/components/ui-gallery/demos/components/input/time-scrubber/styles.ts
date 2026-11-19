/**
 * Bencho's `.tms-*` styles, scoped under `.tms-demo`.
 *
 * The variables resolve Bencho's `--fill-slab` / `--fill-on` / `--pane-edge`
 * / `--signal` for the light and dark fills. Structural CSS that Tailwind
 * cannot express (the masked digit strips, the fading dial ruler and the
 * inset focus ring) lives here.
 */
export const TIME_SCRUBBER_CSS = `
.tms-demo {
  --tms-slab: #ffffff;
  --tms-ink: #17181a;
  /* color-mix(in srgb, #17181a 52%, #ffffff) */
  --tms-muted: #868788;
  --tms-edge: rgba(23, 24, 26, 0.08);
  --tms-signal: #2231dd;
}

.dark .tms-demo {
  --tms-slab: #262626;
  --tms-ink: #ffffff;
  /* color-mix(in srgb, #ffffff 52%, #262626) */
  --tms-muted: #979797;
  --tms-edge: rgba(255, 255, 255, 0.08);
  --tms-signal: #8b96ff;
}

.tms-demo .tms {
  box-sizing: border-box;
  width: 300px;
  max-width: 100%;
  padding: 20px 20px 16px;
  border-radius: var(--tms-r);
  background: var(--tms-slab);
  color: var(--tms-ink);
  font-family: inherit;
  box-shadow: 0 0 0 1px var(--tms-edge);
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* ---- readout ---- */

.tms-demo .tms-read {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
}

.tms-demo .tms-time {
  display: inline-flex;
  font-size: 30px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.tms-demo .tms-col {
  display: inline-block;
  height: 1.5em;
  margin: -0.25em 0;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(#0000, #000 30% 70%, #0000);
  mask-image: linear-gradient(#0000, #000 30% 70%, #0000);
}

.tms-demo .tms-strip {
  display: flex;
  flex-direction: column;
  transition: transform 0.22s cubic-bezier(0.24, 1.34, 0.38, 1);
}

.tms-demo .tms-strip > span {
  height: 1.5em;
  line-height: 1.5em;
}

.tms-demo .tms-strip[data-flip="a"] {
  animation: tms-digit-a 0.26s ease-out;
}

.tms-demo .tms-strip[data-flip="b"] {
  animation: tms-digit-b 0.26s ease-out;
}

@keyframes tms-digit-a {
  from {
    filter: blur(2px);
  }
  to {
    filter: blur(0);
  }
}

@keyframes tms-digit-b {
  from {
    filter: blur(2px);
  }
  to {
    filter: blur(0);
  }
}

.tms-demo .tms-colon {
  padding: 0 0.02em;
}

.tms-demo .tms-mer {
  color: var(--tms-muted);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

/* ---- dial ---- */

.tms-demo .tms-ruler {
  position: relative;
  height: 58px;
  margin-top: 16px;
  cursor: grab;
  touch-action: pan-y;
  outline: none;
  -webkit-mask-image: linear-gradient(90deg, #0000, #000 22% 78%, #0000);
  mask-image: linear-gradient(90deg, #0000, #000 22% 78%, #0000);
}

.tms-demo .tms-ruler:active {
  cursor: grabbing;
}

.tms-demo .tms-ruler:focus-visible {
  border-radius: 10px;
  box-shadow: inset 0 0 0 2px var(--tms-signal);
}

.tms-demo .tms-track {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
}

.tms-demo .tms-tick {
  position: absolute;
  top: 8px;
  left: -1px;
  width: 2px;
  height: 10px;
  border-radius: 1px;
  background: var(--tms-ink);
  transform-origin: 50% 0;
  pointer-events: none;
}

.tms-demo .tms-tick[data-kind="quarter"] {
  height: 17px;
}

.tms-demo .tms-tick[data-kind="hour"] {
  height: 25px;
}

.tms-demo .tms-hour {
  position: absolute;
  top: 38px;
  left: 0;
  color: var(--tms-muted);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0;
  white-space: nowrap;
  pointer-events: none;
}

.tms-demo .tms-mark {
  position: absolute;
  top: 2px;
  left: 50%;
  width: 3px;
  height: 32px;
  margin-left: -1.5px;
  border-radius: 2px;
  background: #e5484d;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .tms-demo .tms-strip {
    transition: none;
  }
  .tms-demo .tms-strip[data-flip] {
    animation: none;
  }
}
`;
