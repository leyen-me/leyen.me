/**
 * Bencho's `.dyn-*` rules, scoped to `.dyn-stage`.
 *
 * Nothing in the source is tinted by the page palette except the "White"
 * tone, which reads `--fill-slab` / `--fill-on`; those resolve here to the
 * literal surfaces the block is staged on, so the island keeps its contrast
 * in both gallery themes. The phone wallpaper behind it is a local gradient.
 */
export const DYNAMIC_ISLAND_CSS = `
.dyn-stage {
  --dyn-amber: #e09a12;
  --dyn-green: #30d158;
  --dyn-cyan: #64d2ff;
  --dyn-red: #e5484d;
  --dyn-pink: #ff6fa0;
  --dyn-focus: #34d399;
}

.dyn-stage .dyn {
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

.dyn-stage .dyn-top {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
}

.dyn-stage .dyn-pill {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: #000;
  color: #fff;
  overflow: hidden;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  will-change: width, height, border-radius, transform;
}

.dyn-stage .dyn-pill[data-tone="white"] {
  background: #fff;
  color: #17181a;
  box-shadow: inset 0 0 0 1px rgba(23, 24, 26, 0.06);
}

.dyn-stage .dyn-toggle {
  position: absolute;
  inset: 0;
  z-index: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.dyn-stage .dyn-toggle:focus-visible {
  outline: none;
}

.dyn-stage .dyn-pill:has(.dyn-toggle:focus-visible) {
  outline: 2px solid var(--dyn-focus);
  outline-offset: 3px;
}

.dyn-stage .dyn-in {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  pointer-events: none;
  transform-origin: 50% 50%;
}

.dyn-stage .dyn-layer {
  position: absolute;
  inset: 0;
}

.dyn-stage .dyn-compact,
.dyn-stage .dyn-open {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.dyn-stage .dyn-compact {
  justify-content: space-between;
  padding: 0 12px;
}

.dyn-stage .dyn-open {
  padding: 0 16px;
}

.dyn-stage .dyn-open[data-kind="Music"] {
  align-items: stretch;
  padding: 16px 20px;
}

.dyn-stage .dyn-open[data-kind="Flight"] {
  align-items: stretch;
  padding: 16px 20px;
}

.dyn-stage .dyn-enter {
  animation: dyn-swap-in 220ms cubic-bezier(0.4, 0, 0.2, 1) 60ms both;
}

.dyn-stage .dyn-exit {
  pointer-events: none;
  animation: dyn-swap-out 220ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes dyn-swap-in {
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

@keyframes dyn-swap-out {
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

.dyn-stage .dyn-num {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
}

.dyn-stage .dyn-amber {
  color: var(--dyn-amber);
}

.dyn-stage .dyn-green {
  color: var(--dyn-green);
}

.dyn-stage .dyn-cyan {
  color: var(--dyn-cyan);
}

.dyn-stage .dyn-amber-bg {
  color: var(--dyn-amber);
  background: #ff9f0a3d;
}

.dyn-stage .dyn-red-bg {
  color: #fff;
  background: var(--dyn-red);
}

.dyn-stage .dyn-round {
  display: grid;
  place-items: center;
  flex: none;
  width: 46px;
  height: 46px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  transition: scale 160ms ease;
}

.dyn-stage .dyn-round:active {
  scale: 0.96;
}

.dyn-stage .dyn-round:focus-visible,
.dyn-stage .dyn-play:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

.dyn-stage .dyn-pill[data-tone="white"] .dyn-round:focus-visible,
.dyn-stage .dyn-pill[data-tone="white"] .dyn-play:focus-visible {
  outline-color: #17181a;
}

.dyn-stage .dyn-grow {
  flex: 1;
}

.dyn-stage .dyn-label {
  color: #ffffff8c;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0;
}

.dyn-stage .dyn-big {
  font-size: 30px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.dyn-stage .dyn-open[data-kind="Timer"] .dyn-label {
  align-self: center;
  margin-right: -4px;
}

.dyn-stage .dyn-face {
  display: grid;
  place-items: center;
  flex: none;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  overflow: hidden;
  color: #fff8f3;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0;
  background: radial-gradient(
    120% 120% at 30% 18%,
    #f7c9ab 0%,
    #e39d7d 40%,
    #a95f52 72%,
    #6b3a37 100%
  );
}

.dyn-stage .dyn-face-initial {
  transform: translateY(-0.5px);
}

.dyn-stage .dyn-who {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  text-align: left;
}

.dyn-stage .dyn-name {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.dyn-stage .dyn-open[data-kind="Call"] .dyn-label,
.dyn-stage .dyn-open[data-kind="Music"] .dyn-label,
.dyn-stage .dyn-open[data-kind="Flight"] .dyn-label {
  font-size: 14px;
  letter-spacing: -0.01em;
}

.dyn-stage .dyn-open[data-kind="Call"] .dyn-name,
.dyn-stage .dyn-open[data-kind="Music"] .dyn-name {
  font-size: 16px;
  letter-spacing: -0.01em;
}

.dyn-stage .dyn-open[data-kind="Music"] .dyn-t {
  width: 38px;
  font-size: 13px;
  letter-spacing: 0;
}

.dyn-stage .dyn-open[data-kind="Flight"] .dyn-code {
  font-size: 30px;
  letter-spacing: -0.03em;
}

.dyn-stage .dyn-open[data-kind="Flight"] .dyn-t {
  width: auto;
  font-size: 13px;
  letter-spacing: 0;
}

.dyn-stage .dyn-open[data-kind="Flight"] .dyn-eta {
  font-size: 14px;
  letter-spacing: -0.01em;
}

.dyn-stage .dyn-art {
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

.dyn-stage .dyn-art::after {
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

.dyn-stage .dyn-art-s {
  width: 22px;
  height: 22px;
  border-radius: 6px;
}

.dyn-stage .dyn-music {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
}

.dyn-stage .dyn-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dyn-stage .dyn-track {
  gap: 12px;
}

.dyn-stage .dyn-t {
  width: 34px;
  color: #ffffff80;
  font-size: 11px;
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
}

.dyn-stage .dyn-t:last-child {
  text-align: right;
}

.dyn-stage .dyn-rail {
  flex: 1;
  height: 5px;
  border-radius: 3px;
  background: #ffffff38;
  overflow: hidden;
}

.dyn-stage .dyn-rail > span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #fff;
  transition: width 1s linear;
}

.dyn-stage .dyn-ctl {
  justify-content: center;
  gap: 32px;
}

.dyn-stage .dyn-play {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  pointer-events: auto;
}

.dyn-stage .dyn-bars {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 16px;
}

.dyn-stage .dyn-bars i {
  display: block;
  width: 3px;
  height: 4px;
  border-radius: 2px;
  background: var(--dyn-pink);
  transition: height 220ms ease;
}

.dyn-stage .dyn-bars[data-on] i {
  animation: dyn-bar 0.9s ease-in-out infinite alternate;
}

.dyn-stage .dyn-bars[data-on] i:nth-child(2) {
  animation-duration: 0.7s;
  animation-delay: -0.3s;
}

.dyn-stage .dyn-bars[data-on] i:nth-child(3) {
  animation-duration: 1.1s;
  animation-delay: -0.5s;
}

.dyn-stage .dyn-bars[data-on] i:nth-child(4) {
  animation-duration: 0.8s;
  animation-delay: -0.2s;
}

@keyframes dyn-bar {
  from {
    height: 4px;
  }
  to {
    height: 16px;
  }
}

.dyn-stage .dyn-plane {
  rotate: 45deg;
}

.dyn-stage .dyn-flight {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
}

.dyn-stage .dyn-flight .dyn-ends {
  justify-content: space-between;
}

.dyn-stage .dyn-flight .dyn-t {
  width: auto;
  font-size: 11px;
  letter-spacing: 0;
}

.dyn-stage .dyn-code {
  color: #fff;
  font-size: 30px;
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.dyn-stage .dyn-fly {
  position: relative;
  flex: 1;
  height: 22px;
  margin: 0 4px;
}

.dyn-stage .dyn-fly::before,
.dyn-stage .dyn-fly > i {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  height: 6px;
  border-radius: 3px;
  translate: 0 -50%;
}

.dyn-stage .dyn-fly::before {
  right: 0;
  background: #ffffff2e;
}

.dyn-stage .dyn-fly > i {
  width: calc(var(--p) * (100% - 18px) + 9px);
  background: var(--dyn-cyan);
  transition: width 1s linear;
}

.dyn-stage .dyn-fly .dyn-plane {
  position: absolute;
  top: 50%;
  left: calc(var(--p) * (100% - 18px));
  color: #fff;
  translate: 0 -50%;
  transition: left 1s linear;
}

.dyn-stage .dyn-eta {
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0;
}

.dyn-stage .dyn-pill[data-tone="white"] .dyn-label,
.dyn-stage .dyn-pill[data-tone="white"] .dyn-t {
  color: #00000080;
}

.dyn-stage .dyn-pill[data-tone="white"] .dyn-name {
  color: #17181a;
}

.dyn-stage .dyn-pill[data-tone="white"] .dyn-green {
  color: #1f9d55;
}

.dyn-stage .dyn-pill[data-tone="white"] .dyn-cyan {
  color: #0a84ff;
}

.dyn-stage .dyn-pill[data-tone="white"] .dyn-code {
  color: #111;
}

.dyn-stage .dyn-pill[data-tone="white"] .dyn-amber-bg {
  color: var(--dyn-amber);
  background: #ff950029;
}

.dyn-stage .dyn-pill[data-tone="white"] .dyn-fly::before {
  background: #0000001a;
}

.dyn-stage .dyn-pill[data-tone="white"] .dyn-fly > i {
  background: #0a84ff;
}

.dyn-stage .dyn-pill[data-tone="white"] .dyn-fly .dyn-plane {
  color: #17181a;
}

.dyn-stage .dyn-pill[data-tone="white"] .dyn-rail {
  background: #0000001a;
}

.dyn-stage .dyn-pill[data-tone="white"] .dyn-rail > span {
  background: #111;
}

.dyn-stage .dyn[data-reduced="true"] .dyn-enter,
.dyn-stage .dyn[data-reduced="true"] .dyn-exit {
  animation: none;
}

.dyn-stage .dyn[data-reduced="true"] .dyn-round {
  transition: none;
}

.dyn-stage .dyn[data-reduced="true"] .dyn-bars[data-on] i {
  height: 10px;
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  .dyn-stage .dyn-enter,
  .dyn-stage .dyn-exit {
    animation: none;
  }

  .dyn-stage .dyn-round {
    transition: none;
  }

  .dyn-stage .dyn-bars[data-on] i {
    height: 10px;
    animation: none;
  }
}
`;
