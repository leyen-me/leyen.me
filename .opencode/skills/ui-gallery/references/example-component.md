# Example: component

A complete, minimal component item. Copy the shape, not the exact styling.

Token rules behind the classes below live in `styling-tokens.md`: surfaces carry
the shape, there is no decorative outline, and corners come from the radius
tokens.

## `app/components/ui-gallery/demos/components/feedback/status-pill/index.tsx`

```tsx
"use client";

import { useState } from "react";

const STATES = ["idle", "syncing", "error"] as const;

type State = (typeof STATES)[number];

const LABELS: Record<State, string> = {
  idle: "Idle",
  syncing: "Syncing",
  error: "Retry",
};

export default function Demo() {
  const [state, setState] = useState<State>("idle");

  return (
    <div className="w-full max-w-xs">
      <div className="flex items-center gap-3 rounded-panel bg-surface-0 p-4">
        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            state === "error"
              ? "bg-amber-500"
              : state === "syncing"
                ? "animate-pulse bg-emerald-500 motion-reduce:animate-none"
                : "bg-zinc-400 dark:bg-zinc-600"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#17181a] dark:text-white">
            {LABELS[state]}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {state === "error" ? "连接失败，请重试。" : "状态切换演示。"}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setState((current) =>
              current === "idle" ? "syncing" : current === "syncing" ? "error" : "idle"
            )
          }
          className="rounded-item bg-surface-1 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-surface-2 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 dark:text-zinc-200 dark:hover:text-white"
        >
          Advance
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        aria-hidden 的装饰元素不进入读屏树。
      </p>
    </div>
  );
}
```

## `meta.ts`

```ts
import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Status Pill",
  summary: "三态状态标签，颜色 + 文案双通道表达，按钮推进状态。",
  tags: ["state", "feedback", "a11y"],
  status: "ready",
  featured: false,
  createdAt: "2026-11-19",
  source: { label: "Original", license: "MIT" },
  requires: [],
} satisfies GalleryMeta;

export default meta;
```

Why this is gallery-worthy:

- One idea: state expressed by both colour and text.
- Uses the shared surface tokens, so it stays paired in light and dark mode.
- No decorative outline; the panel and the inner button are separated by their
  surface steps (`surface-0` → `surface-1` → `surface-2`).
- Keyboard reachable, focus-visible ring present, no timers or listeners.
- Self-contained apart from the gallery's global tokens, no new dependency.
