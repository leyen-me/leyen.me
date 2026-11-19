# Review checklist

Run through this before reporting completion. Fix failures instead of
explaining them away.

## 1. Structure

- [ ] Folder is `demos/<kind>/<category>/<slug>/` with a registered category.
- [ ] `index.tsx` exists and default-exports the demo.
- [ ] `meta.ts` exists, default-exports the object, and uses
      `satisfies GalleryMeta`.
- [ ] No `notes.md`; implementation notes are code comments.
- [ ] Item is self-contained: no `@/` imports.
- [ ] Extra files (hooks, subcomponents) use `.ts` / `.tsx` and kebab-case.

## 2. Metadata

- [ ] `title` is short English Title Case.
- [ ] `summary` is one useful sentence.
- [ ] `tags` are 2–5 lowercase kebab-case values.
- [ ] `status` is `ready` only after full verification, otherwise `wip`.
- [ ] `featured` is `false` unless the user explicitly asked.
- [ ] `createdAt` is today in `YYYY-MM-DD`.
- [ ] `source.label` is present; adapted work includes `url` and `license`.
- [ ] `requires` lists every external package actually imported and nothing
      that is not installed.

## 3. Visual

- [ ] Light mode and dark mode both intentional; no invisible text or borders.
- [ ] Desktop, tablet (768px), and mobile (390px) viewports look correct.
- [ ] Spacing follows the site rhythm (`p-6`/`p-7`, `py-16`/`py-20`).
- [ ] No horizontal scroll, no clipped focus rings.
- [ ] Long text wraps; `line-clamp` is used instead of fixed heights.
- [ ] Motion is subtle and disabled under `prefers-reduced-motion: reduce`.

## 4. Interaction and accessibility

- [ ] Semantic elements are used (`button`, `label`, `details`, `table`).
- [ ] Every `button` has `type="button"` unless it submits a form.
- [ ] Inputs have associated labels (`htmlFor` + `useId`).
- [ ] Keyboard-only flow works; focus is always visible.
- [ ] Dynamic status changes are announced (`aria-live`) where relevant.
- [ ] Decorative visuals are `aria-hidden="true"` and `pointer-events-none`.
- [ ] Timers, observers, animation frames, and listeners are cleaned up.

## 5. Robustness

- [ ] No top-level `window`, `document`, `localStorage`, or `matchMedia`.
- [ ] No `Date.now()` / `Math.random()` rendered during render (hydration).
- [ ] No network requests, remote images, or external fonts.
- [ ] No new dependency without user approval.
- [ ] No `dangerouslySetInnerHTML` except controlled inline `<style>` blocks.

## 6. Commands

```bash
npm run ui:sync            # must list the item with no errors
npx tsc --noEmit           # must print nothing
npx next lint              # only pre-existing warnings allowed
```

Optional production check (stop the dev server first):

```bash
npm run build
```

Route smoke test (with the dev server running):

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  http://localhost:3000/ui/<kind>/<category>/<slug>
```

Expected: `200`.

## 7. Report format

State:

- Files added or changed (absolute-ish repo paths).
- Commands run and their observed result.
- Route URL to review.
- What was not verified (for example, no real browser visual check).

Never claim a visual or interaction check you could not perform.
