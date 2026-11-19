"use client";

import { useEffect, useRef, useState } from "react";

const TARGET = 12480;
const DURATION = 1400;

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

export default function Demo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(TARGET);
      return;
    }

    let frame = 0;
    let started = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (started || !entries.some((entry) => entry.isIntersecting)) return;
        started = true;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - start) / DURATION, 1);
          setValue(Math.round(easeOutCubic(progress) * TARGET));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-sm rounded-panel border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-7 text-center dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-900"
    >
      <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
        Monthly downloads
      </p>
      <p className="mt-3 font-mono text-4xl font-semibold tabular-nums text-zinc-900 dark:text-white">
        {value.toLocaleString("en-US")}
        <span className="text-emerald-500">+</span>
      </p>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        进入视口后开始计数，只播放一次。
      </p>
    </div>
  );
}
