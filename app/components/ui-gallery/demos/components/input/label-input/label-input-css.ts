/**
 * Bencho's `.lbi-*` layer (block `label-input`), scoped under `.lbi-demo`.
 * Bencho reads `--fill-slab`, `--fill-on`, `--ink`, `--ink-3` and `--ink-4`
 * from its theme; here they are resolved to the same values the rest of the
 * gallery uses. The field is 280 x 52, the label lifts 26 px at 0.78 scale,
 * and the top edge parts from its middle with a 420 ms cubic-bezier.
 *
 * Two additions belong to the gallery shell, not the block: a keyboard
 * focus-visible ring on the field and eye button, because the source removes
 * the native outline; and a reduced-motion branch that keeps the short
 * crossfade but cancels the per-letter hop.
 */
export const LABEL_INPUT_CSS = `
.lbi-demo {
  --lbi-fill-on: #17181a;
  --lbi-fill-slab: var(--surface-1);
  --lbi-ink: #17181a;
  --lbi-ink-3: #5c5b56;
  --lbi-ink-4: #6f6e68;
  --lbi-ok: #047857;
  --lbi-err: #be123c;
}
.dark .lbi-demo {
  --lbi-fill-on: #ffffff;
  --lbi-ink: #ffffff;
  --lbi-ink-3: #9a9a9a;
  --lbi-ink-4: #828282;
  --lbi-ok: #34d399;
  --lbi-err: #fb7185;
}

/* room above the field for the lifted label */
.lbi-demo .lbi {
  position: relative;
  display: grid;
  place-items: center;
  padding-top: 12px;
  font-family: inherit;
}

/* no fill: the field is only its outline */
.lbi-demo .lbi-box {
  position: relative;
  background: transparent;
  cursor: text;
}

.lbi-demo .lbi-ring {
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
}

.lbi-demo .lbi-ring path {
  fill: none;
  stroke: color-mix(in srgb, var(--lbi-fill-on) 32%, var(--lbi-fill-slab));
  stroke-width: 1px;
  stroke-linecap: butt;
  transition:
    stroke 220ms ease,
    stroke-width 220ms ease;
}

.lbi-demo .lbi[data-focus="true"] .lbi-ring path {
  stroke: var(--lbi-ink);
  stroke-width: 1.5px;
}

.lbi-demo .lbi[data-filled="true"]:not([data-focus="true"]) .lbi-ring path {
  stroke: color-mix(in srgb, var(--lbi-fill-on) 32%, var(--lbi-fill-slab));
}

/* whole at rest; parted from its middle when the label lifts */
.lbi-demo .lbi-gap {
  stroke-dasharray: 1 2;
  stroke-dashoffset: 0;
  transition:
    stroke 220ms ease,
    stroke-width 220ms ease,
    stroke-dashoffset 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.lbi-demo .lbi[data-up="true"] .lbi-gap {
  stroke-dashoffset: -1px;
}

/* label: placeholder self, then centred on the top edge */
.lbi-demo .lbi-label {
  position: absolute;
  top: 50%;
  left: var(--lbi-x);
  font-size: 16px;
  line-height: 1;
  letter-spacing: -0.01em;
  white-space: pre;
  color: var(--lbi-ink-4);
  transform-origin: left center;
  transform: translateY(-50%);
  transition:
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
    color 220ms ease;
  cursor: text;
  -webkit-user-select: none;
  user-select: none;
}

.lbi-demo .lbi[data-up="true"] .lbi-label {
  transform: translateY(-50%) translateY(-26px) scale(0.78);
  color: var(--lbi-ink-3);
}

.lbi-demo .lbi[data-focus="true"] .lbi-label {
  color: var(--lbi-fill-on);
}

.lbi-demo .lbi-label span {
  display: inline-block;
}

/* the hop runs along the letters as the word rises */
.lbi-demo .lbi[data-focus="true"] .lbi-label span {
  animation: lbi-hop 460ms cubic-bezier(0.3, 0.7, 0.3, 1) both;
  animation-delay: calc(var(--i) * 24ms);
}

.lbi-demo .lbi-field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0 0 0 var(--lbi-x);
  border: 0;
  border-radius: inherit;
  background: transparent;
  font: inherit;
  font-size: 16px;
  letter-spacing: -0.01em;
  color: var(--lbi-fill-on);
  outline: none;
}

/* the reveal blurs between dots and letters; two names restart it */
.lbi-demo .lbi-field[data-flip="1"] {
  animation: lbi-flip-a 260ms ease-out;
}

.lbi-demo .lbi-field[data-flip="0"] {
  animation: lbi-flip-b 260ms ease-out;
}

.lbi-demo .lbi-eye {
  position: absolute;
  top: 50%;
  right: 9px;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-top: -16px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--lbi-ink-4);
  cursor: pointer;
  transition:
    color 160ms ease,
    scale 160ms cubic-bezier(0.22, 1, 0.36, 1);
}

.lbi-demo .lbi-eye:hover {
  color: var(--lbi-fill-on);
}

.lbi-demo .lbi-eye:active {
  scale: 0.96;
}

.lbi-demo .lbi-eye:focus-visible {
  outline: 2px solid rgba(52, 211, 153, 0.7);
  outline-offset: 1px;
}

.lbi-demo .lbi-eye svg {
  grid-area: 1 / 1;
  transition:
    opacity 220ms ease,
    scale 220ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 220ms ease;
}

.lbi-demo .lbi-eye svg:last-child {
  opacity: 0;
  scale: 0.7;
  filter: blur(2px);
}

.lbi-demo .lbi-eye[data-show="true"] svg:first-child {
  opacity: 0;
  scale: 0.7;
  filter: blur(2px);
}

.lbi-demo .lbi-eye[data-show="true"] svg:last-child {
  opacity: 1;
  scale: 1;
  filter: none;
}

.lbi-demo .lbi-hint[data-state="error"] {
  color: var(--lbi-err);
}

.lbi-demo .lbi-hint[data-state="success"] {
  color: var(--lbi-ok);
}

.lbi-demo .lbi-count[data-state="error"] {
  color: var(--lbi-err);
}

@keyframes lbi-hop {
  0% {
    transform: translateY(0);
  }
  38% {
    transform: translateY(-3px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes lbi-flip-a {
  from {
    filter: blur(3px);
    opacity: 0.5;
  }
}

@keyframes lbi-flip-b {
  from {
    filter: blur(3px);
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lbi-demo .lbi-ring path,
  .lbi-demo .lbi-gap,
  .lbi-demo .lbi-label {
    transition-duration: 160ms;
  }

  .lbi-demo .lbi[data-focus="true"] .lbi-label span,
  .lbi-demo .lbi-field {
    animation: none;
  }
}
`;
