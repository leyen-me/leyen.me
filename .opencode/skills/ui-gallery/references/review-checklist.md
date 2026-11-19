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
- [ ] `hidden` is not set on work the user asked to publish; it is only for
      reference examples kept in the repository.
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
- [ ] Motion is subtle. Under `prefers-reduced-motion: reduce` movement is off
      but colour/opacity fades still run.

## 3.5 Theming and surfaces

- [ ] Backgrounds use `bg-surface-0/1/2`; no `bg-white dark:bg-zinc-950` pairs.
- [ ] The ink on each surface is readable in both modes; no ink token points at
      a surface token.
- [ ] No decorative 1px outlines (`ring-1`, `0 0 0 1px`, `inset 0 0 0 1px`)
      unless it is a focus ring, form-control edge, stacked-layer hairline
      (`ring-surface-line`), block card border, or illustration stroke.
- [ ] Corners use `rounded-shell/panel/item/control`; nested corners follow
      `inner = outer − padding`; pills use `rounded-full`.
- [ ] SVG `fill`/`stroke`, ring offsets and borders follow the theme too.
- [ ] Enlarged demos scale their geometry constants, not `transform: scale`.
- [ ] Demos that open by default are not dismissed by unrelated page clicks.

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
npm run ui:sync -- --check # generated files are current
npx tsc --noEmit           # must print nothing
npx next lint              # only pre-existing warnings allowed
```

Optional production check (stop the dev server first, restart it afterwards):

```bash
npm run build
```

Route smoke test (with the dev server running). On Windows use
`Invoke-WebRequest`; `npm.ps1` may be blocked, so start dev with
`cmd /c npm run dev`.

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  http://localhost:3000/ui/<kind>/<category>/<slug>
```

Expected: `200`. Then confirm the edit is actually served — grep the response or
its CSS for the new class/token name. A 200 alone can still be a stale HMR
build.

## 6.5 Scripted edits

When a change touches many demos (renaming a token, sweeping a utility):

- Prefer a small Node script with explicit UTF-8 writes. PowerShell 5.1
  `Get-Content` / `Set-Content` round-trips as ANSI and corrupts non-ASCII
  copy.
- Anchor regexes to the exact property. `--[a-z-]+-slab` also matches
  `--foo-on-slab`; use `(?:slab|card|fill-slab):` and review the diff.
- Run `git diff` (or `git diff --stat`) over the full result and read it before
  committing; scripted sweeps fail silently.

## 7. Report format

State:

- Files added or changed (absolute-ish repo paths).
- Commands run and their observed result.
- Route URL to review.
- What was not verified (for example, no real browser visual check).

Never claim a visual or interaction check you could not perform.
