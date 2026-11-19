/**
 * Keyframes and state styles Tailwind cannot express. Kept beside the demo
 * instead of global CSS, and every animation is switched off under
 * `prefers-reduced-motion: reduce`.
 */
export const HUDDLE_CSS = `
.huddle-person {
  left: 50%;
  transform: translateX(var(--huddle-x));
  animation: huddle-pop 420ms cubic-bezier(.24, 1.34, .38, 1) backwards;
  transition: transform 420ms cubic-bezier(.24, 1.34, .38, 1);
}
.huddle-person.huddle-exit {
  animation: huddle-exit 160ms ease-out both;
}
@keyframes huddle-pop {
  from { opacity: 0; transform: translateX(var(--huddle-x)) scale(.4); }
  to { opacity: 1; transform: translateX(var(--huddle-x)) scale(1); }
}
@keyframes huddle-exit {
  from { opacity: 1; transform: translateX(var(--huddle-x)) scale(1); }
  to { opacity: 0; transform: translateX(var(--huddle-x)) scale(.4); }
}
.huddle-orb {
  transition: opacity 200ms ease;
}
.huddle-person[data-muted] .huddle-orb {
  opacity: .45;
}
.huddle-ring {
  transition: opacity 200ms ease;
}
.huddle-meta-in {
  animation: huddle-meta 220ms cubic-bezier(.22, 1, .36, 1) both;
}
@keyframes huddle-meta {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: none; }
}
.huddle-breathe {
  animation: huddle-breathe 2.4s ease-in-out infinite;
}
@keyframes huddle-breathe {
  0%, 100% { opacity: .45; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.12); }
}
.huddle-wave.is-live .huddle-bar {
  animation: huddle-wave 1.3s cubic-bezier(.45, 0, .55, 1) infinite alternate;
}
.huddle-wave.is-live .huddle-bar:nth-child(2),
.huddle-wave.is-live .huddle-bar:nth-child(3) {
  animation-delay: -650ms;
}
@keyframes huddle-wave {
  0% { transform: scaleY(.62); }
  to { transform: scaleY(1); }
}
@media (prefers-reduced-motion: reduce) {
  .huddle-person,
  .huddle-person.huddle-exit,
  .huddle-ring,
  .huddle-wave,
  .huddle-meta-in,
  .huddle-orb {
    animation: none !important;
    transition: none !important;
  }
  .huddle-person.huddle-exit { display: none; }
  .huddle-breathe,
  .huddle-wave.is-live .huddle-bar {
    animation: none !important;
  }
}
`;
