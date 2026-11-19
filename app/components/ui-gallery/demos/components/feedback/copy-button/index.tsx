"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, TriangleAlert } from "lucide-react";

const CODE = "npx create-next-app@latest";

export default function Demo() {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(CODE);
      setState("copied");
    } catch {
      setState("error");
    }

    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setState("idle"), 1800);
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2 rounded-panel border border-zinc-200 bg-surface-1 p-1.5 pl-4 dark:border-zinc-800">
        <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-zinc-700 dark:text-zinc-200">
          {CODE}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          aria-live="polite"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-item bg-surface-0 px-3 text-xs font-medium text-zinc-700 transition hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:text-white"
        >
          {state === "copied" ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
              Copied
            </>
          ) : state === "error" ? (
            <>
              <TriangleAlert className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
              Retry
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        复制失败时保留可重试状态，而不是静默失败。
      </p>
    </div>
  );
}
