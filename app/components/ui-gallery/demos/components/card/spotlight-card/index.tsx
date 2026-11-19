"use client";

import { useRef, type MouseEvent } from "react";

export default function Demo() {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-surface-0 p-7 text-left transition-colors duration-300 hover:border-emerald-300/70 dark:border-zinc-800 dark:hover:border-emerald-500/40"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(240px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(51, 224, 146, 0.16), transparent 70%)",
        }}
      />
      <div className="relative">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" />
            <circle cx="12" cy="12" r="3.2" />
          </svg>
        </span>
        <h3 className="mt-5 text-base font-semibold text-zinc-900 dark:text-white">
          Spotlight Card
        </h3>
        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          光斑跟随指针移动，用 CSS 变量驱动自定义属性，避免每一帧都触发 React 重渲染。
        </p>
        <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-emerald-500">
          Learn more
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </div>
  );
}
