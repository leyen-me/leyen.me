import type { ReactNode } from "react";

function Line({
  n,
  children,
}: {
  n: number;
  children: ReactNode;
}) {
  return (
    <div className="table-row">
      <span className="table-cell select-none pr-4 text-right text-zinc-300 dark:text-zinc-700">
        {n}
      </span>
      <span className="table-cell whitespace-pre">{children}</span>
    </div>
  );
}

export default function HeroCode() {
  return (
    <div className="relative w-full rounded-xl border border-zinc-200/90 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="flex items-center border-b border-zinc-200/90 px-4 py-2.5 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full bg-[#FF5F57] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]"
            aria-hidden
          />
          <span
            className="h-3 w-3 rounded-full bg-[#FEBC2E] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]"
            aria-hidden
          />
          <span
            className="h-3 w-3 rounded-full bg-[#28C840] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]"
            aria-hidden
          />
        </div>
        <span
          className="flex-1 text-center text-[11px] text-zinc-400 dark:text-zinc-500"
          style={{ fontFamily: "var(--gitlabmono), monospace" }}
        >
          leyen.tsx
        </span>
        <div className="w-[52px]" aria-hidden />
      </div>

      <div className="overflow-x-auto px-3 py-4 sm:px-5 sm:py-6">
        <pre
          className="table text-[11px] leading-[1.75] sm:text-[13px] sm:leading-[1.8]"
          style={{ fontFamily: "var(--gitlabmono), monospace" }}
        >
          <code className="table-row-group">
            <Line n={1}>
              <span className="text-violet-600 dark:text-violet-400">export default</span>
              <span className="text-zinc-500"> </span>
              <span className="text-primary-color">function</span>
              <span className="text-zinc-500"> </span>
              <span className="text-amber-600 dark:text-amber-400">Leyen</span>
              <span className="text-zinc-500">() {"{"}</span>
            </Line>
            <Line n={2}>
              <span className="text-zinc-500">{"  "}</span>
              <span className="text-violet-600 dark:text-violet-400">return</span>
              <span className="text-zinc-500"> (</span>
            </Line>
            <Line n={3}>
              <span className="text-zinc-500">{"    "}&lt;</span>
              <span className="text-sky-600 dark:text-sky-400">Builder</span>
            </Line>
            <Line n={4}>
              <span className="text-zinc-500">{"      "}</span>
              <span className="text-primary-color">speaks</span>
              <span className="text-zinc-500">=</span>
              <span className="text-zinc-500">{"{["}</span>
              <span className="text-emerald-600 dark:text-emerald-400">&quot;Think&quot;</span>
              <span className="text-zinc-500">, </span>
              <span className="text-emerald-600 dark:text-emerald-400">&quot;Design&quot;</span>
              <span className="text-zinc-500">, </span>
              <span className="text-emerald-600 dark:text-emerald-400">&quot;Build&quot;</span>
              <span className="text-zinc-500">{"]}"}</span>
            </Line>
            <Line n={5}>
              <span className="text-zinc-500">{"      "}</span>
              <span className="text-primary-color">role</span>
              <span className="text-zinc-500">=</span>
              <span className="text-emerald-600 dark:text-emerald-400">&quot;Full-stack&quot;</span>
            </Line>
            <Line n={6}>
              <span className="text-zinc-500">{"      "}</span>
              <span className="text-primary-color">stack</span>
              <span className="text-zinc-500">=</span>
              <span className="text-zinc-500">{"{["}</span>
              <span className="text-emerald-600 dark:text-emerald-400">&quot;Vue&quot;</span>
              <span className="text-zinc-500">, </span>
              <span className="text-emerald-600 dark:text-emerald-400">&quot;React&quot;</span>
              <span className="text-zinc-500">{"]}"}</span>
            </Line>
            <Line n={7}>
              <span className="text-zinc-500">{"    "}/&gt;</span>
            </Line>
            <Line n={8}>
              <span className="text-zinc-500">{"  "});</span>
            </Line>
            <Line n={9}>
              <span className="text-zinc-500">{"}"}</span>
            </Line>
            <Line n={10}>
              <span className="inline-block h-[1.1em] w-[7px] translate-y-[2px] animate-pulse bg-primary-color/70" />
            </Line>
          </code>
        </pre>
      </div>
    </div>
  );
}
