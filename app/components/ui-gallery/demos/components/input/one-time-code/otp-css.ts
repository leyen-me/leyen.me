/**
 * Bencho's `.otp-*` layer, scoped under `.otp-demo`. Only the pieces Tailwind
 * cannot express live here: the goo filter hooks, the digit entrance, the
 * breathing caret and the focus ring on the invisible field. Colours are the
 * resolved `--fill-slab` / `--fill-on` values from `index-0e0OZHzj.css`:
 * light #fff on #f7f7f6, dark #262626 on #0a0a0a.
 */
export const OTP_CSS = `
.otp-demo .otp {
  position: relative;
  display: grid;
  place-items: center;
}

.otp-demo .otp-row {
  position: relative;
}

.otp-demo .otp-goo {
  position: absolute;
  inset: 0;
}

.otp-demo .otp-cell {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #f7f7f6;
  box-shadow: inset 0 0 0 1px rgba(23, 24, 26, 0.12);
}

.dark .otp-demo .otp-cell {
  background: #262626;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.otp-demo .otp-slot {
  position: absolute;
  top: 0;
  left: 0;
  display: grid;
  height: 100%;
  place-items: center;
  pointer-events: none;
}

.otp-demo .otp-digit {
  color: #17181a;
  font-size: 20px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  transition: color 0.16s;
  /* Bencho uses \`both\`; \`backwards\` ends on the same frame but stops pinning
     opacity, so the rejection fall can fade each digit out again. */
  animation: otp-digit-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

.dark .otp-demo .otp-digit {
  color: #fff;
}

.otp-demo .otp[data-phase="no"] .otp-digit {
  color: #e5484d;
}

@keyframes otp-digit-in {
  0% {
    opacity: 0;
    filter: blur(3px);
    transform: translateY(45%) scale(0.86);
  }
  to {
    opacity: 1;
    filter: none;
    transform: none;
  }
}

.otp-demo .otp-caret {
  position: absolute;
  top: 50%;
  left: 0;
  width: 2px;
  height: 18px;
  margin-top: -9px;
  border-radius: 2px;
  background: #17181a;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.16s;
}

.dark .otp-demo .otp-caret {
  background: #fff;
}

.otp-demo .otp-caret[data-on="true"] {
  opacity: 1;
  animation: otp-caret-breathe 1.1s ease-in-out infinite alternate;
}

@keyframes otp-caret-breathe {
  0% {
    opacity: 1;
  }
  to {
    opacity: 0.25;
  }
}

.otp-demo .otp-ok {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #17181a;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.01em;
  pointer-events: none;
}

.dark .otp-demo .otp-ok {
  color: #fff;
}

.otp-demo .otp-field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: transparent;
  caret-color: transparent;
  font-size: 16px;
  letter-spacing: -0.01em;
  opacity: 0;
  outline: none;
  cursor: text;
}

.otp-demo .otp[data-phase="ok"] .otp-field {
  cursor: pointer;
}

/* The real input is invisible, so the focus ring wraps the whole row. */
.otp-demo .otp-row:has(.otp-field:focus-visible) {
  box-shadow:
    0 0 0 2px #f7f7f6,
    0 0 0 4px #2231dd;
}

.dark .otp-demo .otp-row:has(.otp-field:focus-visible) {
  box-shadow:
    0 0 0 2px #0a0a0a,
    0 0 0 4px #8b96ff;
}

@media (prefers-reduced-motion: reduce) {
  .otp-demo .otp-digit,
  .otp-demo .otp-caret[data-on="true"] {
    animation: none;
  }
}
`;
