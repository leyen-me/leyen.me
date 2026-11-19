/**
 * Bencho's `.vn-*` layer, scoped under `.voice-note-demo`. The source feeds
 * `--fill-slab` / `--fill-on` / `--ink-3` / `--signal` from its theme; here
 * those are resolved to fixed light and dark values so the block stays
 * self-contained in the gallery. Static width, corner and pull are inline
 * custom properties written by the component.
 */
export const VOICE_NOTE_CSS = `
.voice-note-demo {
  --vn-slab: #ffffff;
  --vn-ink: #17181a;
  --vn-ink-3: #5c5b56;
  --vn-signal: #2231dd;
  --vn-edge: rgba(23, 24, 26, 0.08);
  --vn-red: #e5484d;
}
.dark .voice-note-demo {
  --vn-slab: #202020;
  --vn-ink: #ffffff;
  --vn-ink-3: #9a9a9a;
  --vn-signal: #8b96ff;
  --vn-edge: rgba(255, 255, 255, 0.1);
}

.voice-note-demo .vn-frame {
  position: relative;
  display: grid;
  place-items: center;
  width: 300px;
  height: 156px;
}

.voice-note-demo .vn {
  --red: var(--vn-red);
  position: relative;
  display: block;
  width: var(--w);
  height: 56px;
  padding: 0;
  border: 0;
  border-radius: var(--r);
  background: var(--vn-slab);
  color: var(--vn-ink);
  font-family: inherit;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.01em;
  text-align: left;
  overflow: hidden;
  cursor: pointer;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    width 0.42s cubic-bezier(0.3, var(--ov), 0.4, 1),
    scale 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}
.voice-note-demo .vn[data-stroke="on"] {
  box-shadow: inset 0 0 0 1px var(--vn-edge);
}
.voice-note-demo .vn[data-phase="clip"] {
  cursor: default;
}
.voice-note-demo .vn:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--vn-slab),
    0 0 0 4px var(--vn-signal);
}

.voice-note-demo .vn-in {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  white-space: nowrap;
  animation: vn-in 0.24s 80ms both;
}
@keyframes vn-in {
  0% {
    opacity: 0;
  }
}
.voice-note-demo .vn-idle {
  justify-content: center;
  gap: 12px;
}
.voice-note-demo .vn-rec {
  gap: 12px;
  padding: 0 24px;
}
.voice-note-demo .vn-clip {
  gap: 12px;
  padding: 0 12px 0 8px;
}

.voice-note-demo .vn-time {
  min-width: 38px;
  font-variant-numeric: tabular-nums;
  opacity: 0.6;
}
.voice-note-demo .vn-rec .vn-time {
  opacity: 1;
}

.voice-note-demo .vn-dot {
  flex: none;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--red);
  animation: vn-blink 1s ease-in-out infinite;
}
@keyframes vn-blink {
  50% {
    opacity: 0.25;
  }
}

.voice-note-demo .vn-wave {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  opacity: calc(1 - var(--pull) * 0.7);
}
.voice-note-demo .vn-bar {
  flex: none;
  width: 3px;
  height: calc(4px + var(--l) * 28px);
  border-radius: 2px;
  background: currentColor;
  transition: height 0.16s linear;
}
.voice-note-demo .vn-rec .vn-bar {
  animation: vn-grow 0.2s cubic-bezier(0.3, 1.5, 0.4, 1) both;
}
@keyframes vn-grow {
  0% {
    scale: 1 0.2;
  }
}

.voice-note-demo .vn-scrub {
  cursor: ew-resize;
}
.voice-note-demo .vn-scrub .vn-bar {
  opacity: clamp(0.3, calc((var(--prog) * var(--n) - var(--i)) * 99), 1);
  transition: none;
}
.voice-note-demo .vn-scrub:focus-visible {
  outline: 2px solid var(--vn-signal);
  outline-offset: 2px;
  border-radius: 6px;
}

.voice-note-demo .vn[data-phase="cancel"] .vn-in {
  animation: none;
}
.voice-note-demo .vn[data-phase="cancel"] .vn-bar {
  opacity: 0;
  scale: 1 0;
  transition:
    scale 0.22s,
    opacity 0.22s;
}
.voice-note-demo .vn[data-phase="cancel"] .vn-dot,
.voice-note-demo .vn[data-phase="cancel"] .vn-time,
.voice-note-demo .vn[data-phase="cancel"] button {
  opacity: 0;
  transition: opacity 0.16s;
}

.voice-note-demo .vn-play,
.voice-note-demo .vn-x {
  display: grid;
  flex: none;
  place-items: center;
  padding: 0;
  border: 0;
  font: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    scale 0.16s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.16s;
}
.voice-note-demo .vn-play {
  width: 44px;
  height: 44px;
  border-radius: var(--inner);
  background: var(--vn-ink);
  color: var(--vn-slab);
}
.voice-note-demo .vn-x {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  color: color-mix(in srgb, var(--vn-ink) 50%, var(--vn-slab));
}
.voice-note-demo .vn-x:hover {
  color: var(--vn-ink);
}
.voice-note-demo .vn-play:active,
.voice-note-demo .vn-x:active {
  scale: 0.96;
}
.voice-note-demo .vn-play:focus-visible,
.voice-note-demo .vn-x:focus-visible {
  outline: 2px solid var(--vn-signal);
  outline-offset: 2px;
}

.voice-note-demo .vn-hint {
  position: absolute;
  top: calc(50% + 42px);
  right: 0;
  left: 0;
  color: var(--vn-ink-3);
  font-size: 13px;
  letter-spacing: 0;
  text-align: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.22s;
}
.voice-note-demo .vn-hint[data-on] {
  opacity: calc(1 - var(--pull, 0));
}
.voice-note-demo .vn-hint[data-armed] {
  opacity: 1;
  color: var(--vn-red);
}

.voice-note-demo .vn-rec {
  opacity: calc(1 - var(--pull) * 0.55);
}
.voice-note-demo .vn-rec .vn-dot,
.voice-note-demo .vn-rec .vn-time {
  opacity: max(0, 1 - var(--pull) * 1.6);
}

.voice-note-demo .vn-cancel {
  position: absolute;
  top: 50%;
  left: 14px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  margin-top: -14px;
  border-radius: 50%;
  background: #e5484d;
  color: #ffffff;
  opacity: 0;
  scale: 0.4;
  pointer-events: none;
  transition:
    opacity 0.16s,
    scale 0.16s;
}
.voice-note-demo .vn-cancel[data-on] {
  opacity: 1;
  scale: 1;
  transition:
    opacity 0.16s,
    scale 0.42s cubic-bezier(0.24, 1.34, 0.38, 1);
}
.voice-note-demo .vn[data-phase="cancel"] .vn-cancel {
  opacity: 0;
  scale: 0.6;
  transition:
    opacity 0.22s,
    scale 0.22s;
}

@media (prefers-reduced-motion: reduce) {
  .voice-note-demo .vn,
  .voice-note-demo .vn-in,
  .voice-note-demo .vn-bar,
  .voice-note-demo .vn-dot,
  .voice-note-demo .vn-cancel,
  .voice-note-demo .vn-hint,
  .voice-note-demo .vn-play,
  .voice-note-demo .vn-x {
    transition-duration: 1ms;
    animation: none;
  }
}
`;
