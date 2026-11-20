"use client";

import { useState, type CSSProperties } from "react";
import { logoPaths, logoViewBox } from "./logo-paths";

/**
 * 字标描边：悬停 / 聚焦后实心层淡出，描边层从第一笔开始逐字画完。
 *
 * 原 demo 依赖 anime.js 计算 dashoffset；这里把路径长度归一到 1，
 * 用 CSS keyframes + animation-delay 完成同样的错峰，无第三方依赖。
 * 点击可重播，键盘聚焦同样触发。
 */
const DRAW_MS = 1200;
const STAGGER_MS = 200;

const CSS = `
.logo-draw .logo-layer { transition: none; }
.logo-draw[data-active="true"] .logo-solid {
  opacity: 0;
  transition: opacity 180ms ease-out;
}
.logo-draw[data-active="true"] .logo-stroke {
  opacity: 1;
  transition: opacity 180ms ease-out;
}
.logo-draw .logo-stroke { opacity: 0; }
.logo-draw .logo-stroke path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
}
.logo-draw[data-active="true"] .logo-stroke path {
  animation: logo-draw ${DRAW_MS}ms cubic-bezier(0.37, 0, 0.63, 1) both;
  animation-delay: calc(var(--glyph) * ${STAGGER_MS}ms);
}
@keyframes logo-draw {
  to { stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .logo-draw[data-active="true"] .logo-stroke path {
    animation: none;
    stroke-dashoffset: 0;
  }
}
`;

export default function Demo() {
  const [active, setActive] = useState(false);
  const [run, setRun] = useState(0);

  return (
    <div className="flex w-full items-center justify-center">
      <style>{CSS}</style>

      <button
        type="button"
        aria-label="播放 Logo 描边动画"
        className="logo-draw group block w-full max-w-[170px] cursor-pointer rounded-item px-2 py-1 text-[#17181a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 dark:text-white"
        data-active={active}
        onBlur={() => setActive(false)}
        onClick={() => {
          setActive(true);
          setRun((value) => value + 1);
        }}
        onFocus={() => setActive(true)}
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => setActive(false)}
      >
        <span className="relative block" aria-hidden="true">
          <svg
            className="logo-layer logo-solid block h-auto w-full"
            fill="currentColor"
            focusable="false"
            viewBox={logoViewBox}
          >
            {logoPaths.map((d) => (
              <path d={d} key={d} />
            ))}
          </svg>

          <svg
            className="logo-layer logo-stroke pointer-events-none absolute inset-0 h-full w-full"
            fill="none"
            focusable="false"
            key={run}
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="0.5"
            viewBox={logoViewBox}
          >
            {logoPaths.map((d, index) => (
              <path
                d={d}
                key={d}
                pathLength={1}
                style={{ "--glyph": index } as CSSProperties}
              />
            ))}
          </svg>
        </span>
      </button>
    </div>
  );
}
