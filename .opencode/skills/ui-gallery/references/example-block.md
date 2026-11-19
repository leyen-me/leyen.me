# Example: block

Blocks render inside an isolated iframe, so they may own the full width and the
background. Do not use `min-h-screen`; the iframe height is measured from the
content.

## `app/components/ui-gallery/demos/blocks/cta/split-cta/index.tsx`

```tsx
"use client";

import { ArrowRight } from "lucide-react";

export default function Demo() {
  return (
    <section className="bg-white px-6 py-16 dark:bg-zinc-950 sm:px-10">
      <div className="mx-auto grid max-w-4xl items-center gap-8 rounded-panel border border-zinc-200 bg-surface-1 p-8 md:grid-cols-[1.2fr_1fr] md:p-10 dark:border-zinc-800">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-500">
            Ship faster
          </p>
          <h2 className="mt-3 text-balance font-semibold tracking-tight text-zinc-900 sm:text-3xl text-2xl dark:text-white">
            Copy a block, keep the details.
          </h2>
          <p className="mt-3 max-w-md text-pretty text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            每个区块都可以直接复制到你的项目里，包含完整的响应式与暗色模式处理。
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 rounded-item bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Browse blocks
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center rounded-item border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-white"
          >
            Read docs
          </a>
        </div>
      </div>
    </section>
  );
}
```

## `meta.ts`

```ts
import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Split CTA",
  summary: "左右分栏的转化区块，移动端自动堆叠，适合页面收尾。",
  tags: ["cta", "landing", "responsive", "grid"],
  status: "ready",
  featured: false,
  createdAt: "2026-11-19",
  source: { label: "Original", license: "MIT" },
  requires: ["lucide-react"],
} satisfies GalleryMeta;

export default meta;
```

Why this is gallery-worthy:

- Owns its section background and vertical rhythm (`py-16`), which is what makes
  it a block rather than a component. Page-level backgrounds stay literal
  (`bg-white dark:bg-zinc-950`); inner surfaces use `bg-surface-*`.
- `md:grid-cols-[1.2fr_1fr]` keeps the copy wider than the actions; below `md`
  the layout stacks into a single column.
- Height comes from content, so the iframe measures naturally.
- Both actions have visible focus rings and stay keyboard reachable.
- The inner card is the one place a block keeps a border: it is a page-level
  card sitting on the section background.
