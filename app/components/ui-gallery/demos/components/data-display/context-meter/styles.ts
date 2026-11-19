/**
 * The only rules Tailwind cannot express: the per-digit wheel entrance and
 * its reduced-motion off switch. Everything else lives on the component.
 */
export const CONTEXT_METER_CSS = `
@keyframes ctx-digit-roll {
  from {
    transform: translateY(var(--ctx-from, 0.18em));
    opacity: 0;
    filter: blur(2px);
  }
  to {
    transform: translateY(0);
    opacity: 1;
    filter: blur(0);
  }
}

.ctx-meter .ctx-digit-roll {
  animation: ctx-digit-roll 500ms cubic-bezier(0.34, 1.45, 0.64, 1) both;
}

/* Segment width and dimming run on different clocks; Tailwind's shorthand
   would collapse both. */
.ctx-meter .ctx-seg {
  transition:
    flex-grow 820ms cubic-bezier(0.65, 0, 0.2, 1),
    opacity 220ms ease;
}

.ctx-meter .ctx-act {
  transition:
    scale 240ms cubic-bezier(0.22, 1, 0.36, 1),
    background-color 220ms ease,
    color 220ms ease;
}

.ctx-meter .ctx-chip {
  transition:
    background-color 160ms ease,
    scale 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@media (prefers-reduced-motion: reduce) {
  .ctx-meter .ctx-digit-roll {
    animation: none;
  }

  .ctx-meter .ctx-seg,
  .ctx-meter .ctx-act,
  .ctx-meter .ctx-chip {
    transition-duration: 1ms;
  }
}
`;

/** Stagger between bar segments when the compact pressure wave rolls through. */
export const WAVE_STAGGER = 55;
export const WAVE_DURATION = 760;
export const GIVE_CHAT = 0.78;
export const GIVE_DEFAULT = 0.93;
