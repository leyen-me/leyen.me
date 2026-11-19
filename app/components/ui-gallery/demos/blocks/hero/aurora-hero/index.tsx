"use client";

import { ArrowRight, Sparkles } from "lucide-react";

const AURORA_KEYFRAMES = `
@keyframes ui-aurora-drift {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  35% { transform: translate3d(42px, -28px, 0) scale(1.08); }
  70% { transform: translate3d(-24px, 22px, 0) scale(1.04); }
}
.ui-aurora-blob {
  animation: ui-aurora-drift 16s ease-in-out infinite;
  will-change: transform;
}
@media (prefers-reduced-motion: reduce) {
  .ui-aurora-blob { animation: none; }
}
`;

export default function Demo() {
  return (
    <section className="relative isolate overflow-hidden bg-white px-6 py-20 dark:bg-zinc-950 sm:px-10">
      <style>{AURORA_KEYFRAMES}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="ui-aurora-blob absolute -left-24 top-0 h-72 w-72 rounded-full bg-emerald-400/30 blur-3xl dark:bg-emerald-500/20" />
        <div
          className="ui-aurora-blob absolute -right-16 top-12 h-80 w-80 rounded-full bg-cyan-400/25 blur-3xl dark:bg-cyan-500/15"
          style={{ animationDelay: "-5s", animationDuration: "19s" }}
        />
        <div
          className="ui-aurora-blob absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/15"
          style={{ animationDelay: "-9s", animationDuration: "22s" }}
        />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-600 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
          Now in public beta
        </span>

        <h1 className="mt-6 text-balance font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-5xl text-4xl">
          Build interfaces that feel{" "}
          <span className="bg-[linear-gradient(90deg,#33E092,#22d3ee,#a855f7)] bg-clip-text text-transparent">
            alive
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
          一个可复用的首屏区块：极光光斑、清晰的信息层级，以及不依赖图片的主视觉。
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Start building
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href="#"
            className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-white"
          >
            View docs
          </a>
        </div>

        <dl className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          {[
            ["99.9%", "Uptime"],
            ["12ms", "p50 latency"],
            ["40+", "Components"],
          ].map(([value, label]) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd className="font-mono text-lg font-semibold text-zinc-900 dark:text-white">
                {value}
              </dd>
              <dd className="mt-1 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
