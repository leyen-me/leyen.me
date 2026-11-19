/**
 * Bencho's `.dyn-*` music rules, scoped to `.mi-stage` and renamed `mi-*`
 * so several island demos can share a page without leaking styles.
 *
 * Geometry, colours and timings are copied from the source; only the parts
 * that referenced framer-motion or a photo are replaced (shape spring lives in
 * React, artwork is local CSS). White tone resolves the site vars to literals.
 */
export const MUSIC_ISLAND_CSS = `
.mi-stage {
  --mi-pink: #ff6fa0;
  --mi-focus: #34d399;
}

.mi-stage .mi {
  box-sizing: border-box;
  width: 300px;
  height: 182px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 16px 0;
  font-family: inherit;
  user-select: none;
  -webkit-user-select: none;
}

.mi-stage .mi-top {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
}

.mi-stage .mi-pill {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: #000;
  color: #fff;
  overflow: hidden;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  will-change: width, height, border-radius, transform;
}

.mi-stage .mi-pill[data-tone="white"] {
  background: #fff;
  color: #17181a;
  box-shadow: inset 0 0 0 1px rgba(23, 24, 26, 0.06);
}

.mi-stage .mi-toggle {
  position: absolute;
  inset: 0;
  z-index: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.mi-stage .mi-toggle:focus-visible {
  outline: none;
}

.mi-stage .mi-pill:has(.mi-toggle:focus-visible) {
  outline: 2px solid var(--mi-focus);
  outline-offset: 3px;
}

.mi-stage .mi-in {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  pointer-events: none;
}

.mi-stage .mi-layer {
  position: absolute;
  inset: 0;
}

.mi-stage .mi-compact,
.mi-stage .mi-open {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.mi-stage .mi-compact {
  justify-content: space-between;
  padding: 0 12px;
}

.mi-stage .mi-open {
  align-items: stretch;
  padding: 16px 20px;
}

.mi-stage .mi-enter {
  animation: mi-swap-in 220ms cubic-bezier(0.4, 0, 0.2, 1) 60ms both;
}

.mi-stage .mi-exit {
  pointer-events: none;
  animation: mi-swap-out 220ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

.mi-stage .mi-exit .mi-play,
.mi-stage .mi-exit .mi-skip,
.mi-stage .mi-exit .mi-seek {
  pointer-events: none;
}

@keyframes mi-swap-in {
  from {
    opacity: 0;
    transform: scale(0.92);
    filter: blur(6px);
  }
  to {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

@keyframes mi-swap-out {
  from {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
  to {
    opacity: 0;
    transform: scale(0.92);
    filter: blur(6px);
  }
}

.mi-stage .mi-music {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
}

.mi-stage .mi-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mi-stage .mi-who {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  text-align: left;
}

.mi-stage .mi-name {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mi-stage .mi-label {
  color: #ffffff8c;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.01em;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mi-stage .mi-grow {
  flex: 1;
}

.mi-stage .mi-track {
  position: relative;
  gap: 12px;
}

.mi-stage .mi-t {
  width: 38px;
  color: #ffffff80;
  font-size: 13px;
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
  text-align: left;
}

.mi-stage .mi-t:last-child {
  text-align: right;
}

.mi-stage .mi-rail {
  position: relative;
  flex: 1;
  height: 5px;
  border-radius: 3px;
  background: #ffffff38;
}

.mi-stage .mi-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #fff;
  transition: width 1s linear;
}

.mi-stage .mi-seek {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 32px;
  margin: 0;
  translate: 0 -50%;
  padding: 0;
  border: 0;
  opacity: 0;
  cursor: pointer;
  pointer-events: auto;
  background: transparent;
  -webkit-appearance: none;
  appearance: none;
}

.mi-stage .mi-seek::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
}

.mi-stage .mi-seek::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: 0;
}

.mi-stage .mi-rail:has(.mi-seek:focus-visible) {
  outline: 2px solid var(--mi-focus);
  outline-offset: 5px;
}

.mi-stage .mi-ctl {
  justify-content: center;
  gap: 20px;
}

.mi-stage .mi-play,
.mi-stage .mi-skip {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
  pointer-events: auto;
  transition: opacity 160ms ease;
}

.mi-stage .mi-skip {
  opacity: 0.9;
}

.mi-stage .mi-skip:hover,
.mi-stage .mi-play:hover {
  opacity: 1;
}

.mi-stage .mi-play:active,
.mi-stage .mi-skip:active {
  scale: 0.94;
}

.mi-stage .mi-play:focus-visible,
.mi-stage .mi-skip:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

.mi-stage .mi-pill[data-tone="white"] .mi-play:focus-visible,
.mi-stage .mi-pill[data-tone="white"] .mi-skip:focus-visible {
  outline-color: #17181a;
}

.mi-stage .mi-art {
  position: relative;
  display: block;
  flex: none;
  width: 46px;
  height: 46px;
  border-radius: 10px;
  overflow: hidden;
  background:
    radial-gradient(38% 34% at 68% 30%, #ffe6c7 0%, #ffd9b4 55%, transparent 60%),
    linear-gradient(
      178deg,
      #f9d3b4 0%,
      #f3b39d 32%,
      #cc8f98 56%,
      #7d5d6f 78%,
      #40344a 100%
    );
}

.mi-stage .mi-art::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 58%;
  background: #4b3a4d;
  opacity: 0.92;
  clip-path: polygon(
    0 100%,
    0 62%,
    18% 30%,
    34% 58%,
    52% 22%,
    70% 60%,
    84% 42%,
    100% 66%,
    100% 100%
  );
}

.mi-stage .mi-art[data-art="1"] {
  background:
    radial-gradient(36% 32% at 30% 26%, #e9f1ff 0%, #cfe0ff 52%, transparent 60%),
    linear-gradient(
      178deg,
      #bcd0ee 0%,
      #9db6df 30%,
      #7d8fbd 56%,
      #4d5980 78%,
      #29304a 100%
    );
}

.mi-stage .mi-art[data-art="1"]::after {
  background: #313a5c;
}

.mi-stage .mi-art[data-art="2"] {
  background:
    radial-gradient(34% 30% at 66% 24%, #ffe7d6 0%, #ffc7a8 50%, transparent 58%),
    linear-gradient(
      178deg,
      #f0b98f 0%,
      #d98f74 30%,
      #a96663 56%,
      #6b4453 78%,
      #352a3c 100%
    );
}

.mi-stage .mi-art[data-art="2"]::after {
  background: #402f3d;
}

.mi-stage .mi-art-s {
  width: 22px;
  height: 22px;
  border-radius: 6px;
}

.mi-stage .mi-bars {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 16px;
}

.mi-stage .mi-bars i {
  display: block;
  width: 3px;
  height: 4px;
  border-radius: 2px;
  background: var(--mi-pink);
  transition: height 220ms ease;
}

.mi-stage .mi-bars[data-on] i {
  animation: mi-bar 0.9s ease-in-out infinite alternate;
}

.mi-stage .mi-bars[data-on] i:nth-child(2) {
  animation-duration: 0.7s;
  animation-delay: -0.3s;
}

.mi-stage .mi-bars[data-on] i:nth-child(3) {
  animation-duration: 1.1s;
  animation-delay: -0.5s;
}

.mi-stage .mi-bars[data-on] i:nth-child(4) {
  animation-duration: 0.8s;
  animation-delay: -0.2s;
}

@keyframes mi-bar {
  from {
    height: 4px;
  }
  to {
    height: 16px;
  }
}

.mi-stage .mi-pill[data-tone="white"] .mi-label {
  color: #00000080;
}

.mi-stage .mi-pill[data-tone="white"] .mi-name {
  color: #17181a;
}

.mi-stage .mi-pill[data-tone="white"] .mi-t {
  color: #00000080;
}

.mi-stage .mi-pill[data-tone="white"] .mi-rail {
  background: #0000001a;
}

.mi-stage .mi-pill[data-tone="white"] .mi-fill {
  background: #111;
}

.mi-stage .mi[data-reduced="true"] .mi-enter,
.mi-stage .mi[data-reduced="true"] .mi-exit {
  animation: none;
}

.mi-stage .mi[data-reduced="true"] .mi-play,
.mi-stage .mi[data-reduced="true"] .mi-skip,
.mi-stage .mi[data-reduced="true"] .mi-bars i {
  transition: none;
}

.mi-stage .mi[data-reduced="true"] .mi-play:active,
.mi-stage .mi[data-reduced="true"] .mi-skip:active {
  scale: 1;
}

.mi-stage .mi[data-reduced="true"] .mi-fill {
  transition: none;
}

.mi-stage .mi[data-reduced="true"] .mi-bars[data-on] i {
  height: 10px;
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  .mi-stage .mi-enter,
  .mi-stage .mi-exit {
    animation: none;
  }

  .mi-stage .mi-play,
  .mi-stage .mi-skip,
  .mi-stage .mi-bars i {
    transition: none;
  }

  .mi-stage .mi-fill {
    transition: none;
  }

  .mi-stage .mi-bars[data-on] i {
    height: 10px;
    animation: none;
  }
}
`;
