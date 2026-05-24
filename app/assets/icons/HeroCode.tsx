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
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="flex items-center gap-3 border-b border-zinc-200/90 px-4 py-2.5 dark:border-zinc-800">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>
        <span
          className="text-[11px] text-zinc-400 dark:text-zinc-500"
          style={{ fontFamily: "var(--gitlabmono), monospace" }}
        >
          leyen.tsx
        </span>
      </div>

      <div className="overflow-x-auto px-4 py-5 sm:px-5 sm:py-6">
        <pre
          className="table text-[12px] leading-[1.8] sm:text-[13px]"
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
