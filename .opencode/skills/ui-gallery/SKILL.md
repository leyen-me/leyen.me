---
name: UI Gallery Contribution
description: Create or update UI Gallery components and blocks under app/components/ui-gallery/demos. Use when adding a new gallery item, changing an existing demo, adding categories, or reviewing a generated gallery entry.
---

# UI Gallery Contribution

You are adding to Leyen's personal UI gallery: a collection of real, runnable
components (`components`) and page blocks (`blocks`). Source code in this
repository is the single source of truth. There is no CMS and no admin UI for
gallery items.

Read this file fully, then read the references you need:

- `references/categories.md` — when to use which kind/category
- `references/example-component.md` — complete component example
- `references/example-block.md` — complete block example
- `references/review-checklist.md` — final acceptance checks
- `templates/` — copyable `index.tsx` / `meta.ts` starting points

## Non-negotiable rules

1. Location: `app/components/ui-gallery/demos/<kind>/<category>/<slug>/`
   - `kind` is `components` or `blocks`.
   - `<category>` must exist in `lib/ui-gallery/categories.ts`.
   - `<slug>` is lowercase kebab-case and globally unique within its category.
2. Required files: `index.tsx` (default export) and `meta.ts` (default export
   satisfying `GalleryMeta`). Do not create `notes.md`; notes belong in code
   comments.
3. Never edit generated files by hand:
   - `lib/ui-gallery/catalog.generated.ts`
   - `lib/ui-gallery/loaders.generated.ts`
   - `lib/ui-gallery/sources.generated.json`
   They are rebuilt by `npm run ui:sync`.
4. Demo code must be self-contained:
   - No imports from project aliases (`@/...`). Relative imports inside the
     item folder are allowed.
   - No reading site config, Sanity, env vars, or other demos.
5. Only use packages already in `package.json`, and declare every third-party
   package in `meta.requires` (`react`, `react-dom`, `next` are implicit).
   Adding a dependency requires explicit user approval.
6. Do not add routes, pages, or layouts. The gallery shell already exists.
7. Do not commit, push, or deploy unless the user asks.

## Component or block?

| Kind | Category examples | Rendered as | Build it as |
| --- | --- | --- | --- |
| `components` | button, input, card, tabs | directly in the page | a self-sized widget (`max-w-sm`, `max-w-md`, …) |
| `blocks` | hero, navbar, pricing, faq | isolated iframe | a full-width `<section>` with its own background and `py-16` / `py-20` |

Choose `blocks` when the item owns page-level layout, background, or typography
scale. Choose `components` when it is a reusable unit embedded inside a layout.

## Workflow

1. Decide `kind`, `category`, `slug`, and a short English `title`.
2. Scaffold and inspect the result:

   ```bash
   npm run ui:new -- \
     --kind components --category card --slug spotlight-card \
     --title "Spotlight Card" \
     --summary "指针跟随光斑卡片，基于 CSS 变量，零额外渲染。" \
     --tags hover,mouse,css-vars
   ```

3. Replace the stub in `index.tsx` with the real implementation, and complete
   `meta.ts`.
4. Test in both themes and all three preview viewports (desktop / tablet /
   mobile) on the detail page.
5. Regenerate and verify:

   ```bash
   npm run ui:sync
   npx tsc --noEmit
   npx next lint
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/ui/<kind>/<category>/<slug>
   ```

   A dev server is usually already running. Do not start a second one on port
   3000. Run `npm run build` only when the user asks or when dev is stopped;
   build and dev share `.next` and will corrupt each other.
6. Report: files created/changed, commands run, route URL, and anything you
   could not verify. Do not claim visual verification you did not perform.

## Implementation standards

### Structure

- One idea per item. Prefer a single file; split extra hooks/components into
  sibling `.ts` / `.tsx` files when the entry passes roughly 250 lines.
- Default-export the preview component. No required props.
- Add `"use client"` only when using hooks, state, refs, or event handlers.
  Keep server-renderable demos server-compatible.
- Never touch browser APIs at module scope; use `useEffect` and guard access.
- Keep everything local: no context providers, no global stores, no routing.

### Styling

- Tailwind classes only. No new global CSS and no `@apply` in demo files.
  Inline `<style>` is acceptable only for keyframes that Tailwind cannot
  express, and must respect `prefers-reduced-motion`.
- Follow the site palette: zinc neutrals plus emerald accents
  (`emerald-500`, `emerald-400/60` rings). Avoid site-specific tokens such as
  `primary-bg` so snippets stay portable.
- Every item must look intentional in both light and dark mode. Use
  `dark:` variants for backgrounds, borders, and text; never rely on
  `color-scheme` alone.
- Typical tokens: `rounded-xl` / `rounded-2xl`, `border-zinc-200
  dark:border-zinc-800`, `text-sm` UI copy, `bg-white dark:bg-zinc-950`.
- Motion: 150–300ms, transform/opacity only, and disable when
  `prefers-reduced-motion: reduce` is set.
- No external images, fonts, or network requests. Use inline SVG, CSS
  gradients, or `lucide-react` icons.

### Behavior and accessibility

- Use semantic elements (`button`, `a`, `label`, `details`, `table`).
- `button` must have `type="button"` unless it submits a form.
- Associate labels with inputs via `htmlFor` + `useId`.
- Provide `focus-visible` rings; do not remove outlines without a replacement.
- Keep interactive targets at least 32×32px and maintain readable contrast.
- Support keyboard: Enter/Space for buttons, arrow keys for tab-like controls.
- Clean up timers, `requestAnimationFrame`, `IntersectionObserver`, and event
  listeners in the effect cleanup.
- Avoid hydration hazards: do not render `Date.now()`, `Math.random()`, or
  `window`-derived values during render.

### Metadata

```ts
import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Spotlight Card",
  summary: "指针跟随光斑卡片，基于 CSS 变量，零额外渲染。",
  tags: ["hover", "mouse", "css-vars"],
  status: "ready",
  featured: false,
  createdAt: "2026-11-19",
  source: { label: "Original", license: "MIT" },
  requires: [],
} satisfies GalleryMeta;

export default meta;
```

- `title`: English, 2–4 words, Title Case.
- `summary`: one sentence, Chinese is fine, describes the technique not the
  visuals alone.
- `tags`: lowercase kebab-case, 2–5 items, reusable as filters.
- `status`: `"wip"` while incomplete; promote to `"ready"` only after both
  themes and responsive layouts are verified.
- `featured`: leave `false`; do not self-promote. Only the user marks featured.
- `source.label` is required. Use `"Original"` for original work, or
  `"Inspired by <site>"` with `url` and `license` when adapting.
- `requires`: exact package names only, e.g. `["lucide-react"]`.

## Attribution and originality

Rewrite ideas; do not paste third-party code. If a demo closely follows an
existing snippet, credit it in `meta.source` and make sure the license allows
the use. When in doubt, ask the user before adding the item.

## Common mistakes

| Mistake | Consequence |
| --- | --- |
| Importing `@/lib/utils` inside a demo | Sync fails: demos must be portable |
| Forgetting `meta.requires` | Sync fails on undeclared external imports |
| Using a category that is not registered | Sync fails with a clear error |
| Creating `notes.md` | Abandoned convention; put notes in code comments |
| `min-h-screen` inside a block | iframe grows to viewport height for no reason |
| Theme only designed for dark mode | Item looks broken in light mode |
| Editing `*.generated.*` files | Changes are overwritten on next sync |
| Running `npm run build` while dev is running | `.next` conflict, dev returns 500 |
| Leaving timers/listeners uncleaned | Leaks in the long-lived gallery session |

## Done criteria

A task is done when all of these hold:

- `npm run ui:sync` reports the new item with no errors.
- `npx tsc --noEmit` and `npx next lint` pass.
- The detail route returns 200 and the code panel shows the intended files.
- Light and dark mode both look correct at desktop, tablet, and mobile widths.
- Keyboard-only interaction works; no console warnings or hydration errors.
- Generated files were produced by the sync script, not edited manually.
