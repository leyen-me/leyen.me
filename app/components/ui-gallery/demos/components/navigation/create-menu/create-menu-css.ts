/**
 * Bencho's `.crt-*` layer, ported from `index-0e0OZHzj.css` and scoped under
 * `.crt-demo`. Geometry, easing and stagger live here; size and corner values
 * arrive as inline custom properties so the JS spring can drive them.
 */
export const CREATE_MENU_CSS = `
.crt-demo {
  --crt-slab: var(--surface-0);
  --crt-on-slab: #17181a;
  --crt-on-slab-rgb: 23 24 26;
  --crt-edge: rgba(23, 24, 26, 0.14);
  --pill-w: 120px;
  --pill-h: 38px;
  --panel-w: 212px;
  --panel-h: 166px;
  --crt-r: var(--radius-panel);
  --crt-shut-r: 19px;
  --crt-row-r: var(--radius-control);
  color: var(--crt-on-slab);
  -webkit-tap-highlight-color: transparent;
}

.dark .crt-demo {
  --crt-on-slab: var(--surface-0);
  --crt-on-slab-rgb: 255 255 255;
  --crt-edge: rgba(255, 255, 255, 0.16);
}

.crt-demo .crt-defs {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}

.crt-demo .crt-stage {
  position: relative;
  width: 244px;
  height: 244px;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
}

.crt-demo .crt-blobs {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.crt-demo .crt-body {
  position: absolute;
  inset: 0;
  margin: auto;
  background: var(--crt-slab);
  transition: scale 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}

.crt-demo .crt-pill {
  position: absolute;
  inset: 0;
  display: flex;
  width: var(--pill-w);
  height: var(--pill-h);
  margin: auto;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: none;
  color: var(--crt-on-slab);
  font: inherit;
  font-size: 13px;
  letter-spacing: 0;
  cursor: pointer;
  transition:
    width 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.16s,
    scale 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}

.crt-demo .crt-pill:focus-visible {
  outline: 2px solid rgba(52, 211, 153, 0.7);
  outline-offset: 3px;
}

.crt-demo .crt-glyph {
  display: grid;
  place-items: center;
}

.crt-demo .crt-say {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-align: left;
  transition: width 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}

.crt-demo .crt-say > span {
  display: inline-block;
}

.crt-demo .crt-stage[data-open="true"] .crt-pill {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.16s;
}

.crt-demo .crt-stage[data-sink="true"] .crt-pill {
  opacity: 1;
  scale: 0.94;
  transition:
    opacity 0.16s,
    scale 0.16s cubic-bezier(0.22, 1, 0.36, 1);
}

.crt-demo .crt-stage[data-sink="true"] .crt-body {
  scale: 0.94;
  transition: scale 0.16s cubic-bezier(0.22, 1, 0.36, 1);
}

.crt-demo .crt-panel {
  position: absolute;
  inset: 0;
  width: var(--panel-w);
  height: var(--panel-h);
  margin: auto;
  padding: 12px;
  pointer-events: none;
  color: var(--crt-on-slab);
}

.crt-demo .crt-stage[data-open="true"] .crt-panel {
  pointer-events: auto;
}

.crt-demo .crt-menu {
  display: grid;
  align-content: start;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.crt-demo .crt-item {
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 0.16s,
    transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}

.crt-demo .crt-stage[data-open="true"] .crt-item {
  opacity: 1;
  transform: none;
}

.crt-demo .crt-item button {
  position: relative;
  display: flex;
  width: 100%;
  height: 34px;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  border: 0;
  border-radius: var(--crt-row-r);
  background: none;
  color: rgba(var(--crt-on-slab-rgb), 0.78);
  font: inherit;
  font-size: 13px;
  letter-spacing: 0;
  text-align: left;
  cursor: pointer;
  isolation: isolate;
  transition: color 0.22s;
}

.crt-demo .crt-item button:hover {
  color: var(--crt-on-slab);
}

.crt-demo .crt-item button::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background: rgba(var(--crt-on-slab-rgb), 0.08);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.22s;
}

.crt-demo .crt-item button:hover::before,
.crt-demo .crt-item button:focus-visible::before {
  opacity: 1;
  transition-duration: 0.16s;
}

.crt-demo .crt-item button:focus-visible {
  outline: 2px solid rgba(52, 211, 153, 0.7);
  outline-offset: -2px;
  color: var(--crt-on-slab);
}

@media (prefers-reduced-motion: reduce) {
  .crt-demo .crt-body,
  .crt-demo .crt-pill,
  .crt-demo .crt-say,
  .crt-demo .crt-item,
  .crt-demo .crt-item button,
  .crt-demo .crt-item button::before {
    transition-duration: 0.01ms !important;
    transition-delay: 0ms !important;
  }
}
`;
