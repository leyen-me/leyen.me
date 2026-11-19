/**
 * Bencho's `.upl-*` layer, scoped under `.upl-demo`. The source resolves
 * `--fill-slab` / `--fill-on` / `--signal` / `--ok` from its theme; here they
 * are fixed light and dark values so the block stays self-contained.
 *
 * The source draws its box edge with a 1 px stroke and hands the "dashed edge"
 * over to the catalog snippet (`stroke-dashoffset: -22` while a file is held).
 * This port keeps that dashed SVG edge permanently and lights it in the signal
 * colour on drag-over, which is the state the block is known for.
 */
export const UPLOAD_CSS = `
.upl-demo {
  --upl-slab: var(--surface-0);
  --upl-ink: #17181a;
  --upl-ink-3: #5c5b56;
  --upl-signal: #2231dd;
  --upl-ok: #15803d;
  --upl-red: #e5484d;
  --upl-r: 20px;
  --upl-spring: cubic-bezier(0.3, 1.36, 0.4, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 300px;
  max-width: 100%;
  color: var(--upl-ink);
  font-family: inherit;
  -webkit-user-select: none;
  user-select: none;
}
.dark .upl-demo {
  --upl-ink: #f4f3f1;
  --upl-ink-3: #9a9a9a;
  --upl-signal: #8b96ff;
  --upl-ok: #3fb950;
  --upl-red: #ff6369;
}

.upl-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.upl-zone-wrap {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  height: 176px;
}

.upl-zone {
  position: relative;
  flex: none;
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 176px;
  padding: 0 16px;
  border-radius: var(--upl-r);
  border: 1px solid color-mix(in srgb, var(--upl-ink) 10%, transparent);
  background: var(--upl-slab);
  overflow: hidden;
  transition:
    scale 0.42s cubic-bezier(0.24, 1.34, 0.38, 1),
    width 0.42s cubic-bezier(0.24, 1.34, 0.38, 1),
    height 0.42s cubic-bezier(0.24, 1.34, 0.38, 1),
    background-color 0.22s ease;
}
.upl-zone[data-over] {
  scale: 1.02;
  background: color-mix(in srgb, var(--upl-signal) 5%, var(--upl-slab));
}
.upl-zone[data-gulp] {
  animation: upl-gulp 0.46s cubic-bezier(0.3, 1.2, 0.4, 1);
}
.upl-zone[data-gulp] .upl-icon {
  animation: upl-open 0.46s cubic-bezier(0.3, 1.4, 0.4, 1);
}
.upl-zone[data-shake] {
  animation: upl-shake 0.42s ease;
}

.upl-pick {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.upl-pick:focus-visible {
  outline: 2px solid var(--upl-signal);
  outline-offset: -5px;
  border-radius: calc(var(--upl-r) - 5px);
}

.upl-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--upl-ink) 6%, var(--upl-slab));
  color: color-mix(in srgb, var(--upl-ink) 72%, var(--upl-slab));
  transition:
    translate 0.42s cubic-bezier(0.24, 1.34, 0.38, 1),
    background-color 0.22s ease,
    color 0.22s ease;
}
.upl-zone[data-over] .upl-icon {
  color: var(--upl-ink);
  translate: 0 -4px;
  background: color-mix(in srgb, var(--upl-signal) 12%, var(--upl-slab));
}

.upl-say {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  line-height: 1.2;
  text-align: center;
  letter-spacing: 0;
}
.upl-say b {
  font-weight: 500;
}
.upl-say span {
  font-size: 12px;
  color: var(--upl-ink-3);
}
.upl-zone[data-refuse] .upl-say b {
  color: var(--upl-red);
}

.upl-now {
  display: flex;
  align-items: center;
  gap: 12px;
  width: max-content;
  max-width: 100%;
  min-height: 49.5px;
  flex: none;
  animation: upl-land 0.42s var(--upl-spring) both;
}
.upl-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 150px;
  min-width: 0;
}
.upl-name {
  overflow: hidden;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.upl-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 14px;
  overflow: hidden;
  color: var(--upl-ink-3);
  font-size: 12px;
  line-height: 14px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.upl-track {
  position: relative;
  display: block;
  width: 100%;
  height: 4px;
  margin-top: 4px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--upl-ink) 6%, var(--upl-slab));
  overflow: hidden;
}
.upl-bar {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--upl-signal);
  transform-origin: 0 50%;
}
.upl-roll {
  display: inline-flex;
  height: 1em;
  overflow: hidden;
  line-height: 1em;
  font-variant-numeric: tabular-nums;
  vertical-align: baseline;
}
.upl-roll-col {
  display: inline-block;
  height: 1em;
  overflow: hidden;
}
.upl-roll-strip {
  display: flex;
  flex-direction: column;
  transition: transform 0.22s cubic-bezier(0.24, 1.34, 0.38, 1);
}
.upl-roll-strip > span {
  display: block;
  height: 1em;
  line-height: 1em;
}
.upl-pct {
  margin-left: 1px;
}

.upl-end {
  display: flex;
  flex: none;
  align-items: center;
  gap: 4px;
  min-width: 22px;
  min-height: 32px;
}
.upl-tick {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  margin-right: 2px;
  border-radius: 50%;
  background: var(--upl-ok);
  color: #ffffff;
  animation: upl-pop 0.38s cubic-bezier(0.3, 1.6, 0.4, 1) both;
}
.upl-act {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--upl-ink-3);
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}
.upl-act:hover {
  background: color-mix(in srgb, var(--upl-ink) 7%, transparent);
  color: var(--upl-ink);
}
.upl-act:focus-visible {
  outline: 2px solid var(--upl-signal);
  outline-offset: 1px;
}

.upl-error {
  margin: -4px 0 0;
  color: var(--upl-red);
  font-size: 12px;
  line-height: 1.4;
}

.upl-tray {
  display: flex;
  justify-content: center;
  gap: 20px;
}
.upl-slot {
  position: relative;
  width: 76px;
  height: 75px;
  transition: opacity 0.22s ease;
}
.upl-slot[data-empty] {
  opacity: 0;
  pointer-events: none;
}
.upl-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 76px;
  padding: 4px 0 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: color-mix(in srgb, var(--upl-ink) 72%, var(--upl-slab));
  font: inherit;
  font-size: 11px;
  cursor: grab;
  touch-action: none;
  transition: color 0.18s ease;
}
.upl-file:hover {
  color: var(--upl-ink);
}
.upl-file:active {
  cursor: grabbing;
}
.upl-file:focus-visible {
  outline: 2px solid var(--upl-signal);
  outline-offset: 2px;
}
.upl-file .upl-page {
  flex: none;
  overflow: visible;
}
.upl-label {
  max-width: 76px;
  overflow: hidden;
  font-size: 11px;
  line-height: 1.2;
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.upl-page-line {
  fill: none;
  stroke: color-mix(in srgb, var(--upl-ink) 32%, var(--upl-slab));
  stroke-width: 1.5px;
}
.upl-page-ext {
  fill: #ffffff;
  font-family: inherit;
  font-weight: 500;
  letter-spacing: 0;
}

@keyframes upl-march {
  to {
    stroke-dashoffset: -22;
  }
}
@keyframes upl-gulp {
  0% {
    scale: 1.02;
  }
  35% {
    scale: 0.985;
  }
  70% {
    scale: 1.006;
  }
  to {
    scale: 1;
  }
}
@keyframes upl-open {
  40% {
    scale: 1.08;
  }
}
@keyframes upl-land {
  0% {
    opacity: 0;
    translate: 0 10px;
    scale: 0.85;
  }
}
@keyframes upl-pop {
  0% {
    scale: 0;
  }
}
@keyframes upl-shake {
  0%,
  100% {
    translate: 0;
  }
  20% {
    translate: -7px;
  }
  40% {
    translate: 6px;
  }
  60% {
    translate: -4px;
  }
  80% {
    translate: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .upl-zone,
  .upl-icon,
  .upl-slot,
  .upl-file,
  .upl-act,
  .upl-dash rect,
  .upl-roll-strip {
    transition: none;
  }
  .upl-zone[data-over] {
    scale: 1;
  }
  .upl-zone[data-gulp],
  .upl-zone[data-gulp] .upl-icon,
  .upl-zone[data-shake],
  .upl-zone[data-over] .upl-dash rect,
  .upl-now,
  .upl-tick {
    animation: none;
  }
  .upl-dash rect {
    stroke-dashoffset: 0;
  }
}
`;
