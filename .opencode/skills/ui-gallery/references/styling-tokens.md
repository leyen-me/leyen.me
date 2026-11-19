# Gallery theme tokens

The gallery renders demos in one long-lived page, side by side. Consistency
across items matters more than standalone portability, so demos share a small
token layer instead of hard-coding hex values per item.

Source of truth:

- `app/styles/globals.css` — `:root` and `html.dark` declarations
- `tailwind.config.js` — `surface.*` colours and `borderRadius` utilities

## Surfaces

| Token | Light | Dark | Use for |
| --- | --- | --- | --- |
| `bg-surface-0` | `#ffffff` | `#18181b` | The item itself: card, panel, popover, field |
| `bg-surface-1` | `#f2f2f3` | `#27272a` | Secondary row, raised block, pressed row |
| `bg-surface-2` | `#e9e9eb` | `#3f3f46` | Chip, hover wash, slider knob |
| `ring-surface-line` / `border-surface-line` | `rgba(24,24,27,.08)` | `rgba(255,255,255,.1)` | Hairline, only where layering needs it |

Rules:

1. **Surfaces first.** Reach for a surface tone before reaching for a border or
   shadow. A panel that is one step away from its neighbour is already legible.
2. **Ink never equals its slab.** Text/icons on `surface-0` use `#17181a` in
   light and `#ffffff` in dark. Never point an ink variable at a surface token
   (`--foo-on-slab: var(--surface-0)` makes dark text invisible, because
   `surface-0` *is* the slab in dark mode).
3. **Glass keeps literals.** Alpha overlays such as `bg-white/80` cannot take a
   `var()` colour modifier; leave them as explicit values and keep their dark
   counterpart next to them.

## Outlines

Default: **no decorative 1px outline**. Surface contrast carries the shape.

Allowed exceptions (keep them, and say why in a comment when non-obvious):

| Exception | Example |
| --- | --- |
| Focus rings | `focus-visible:ring-2` — never remove without a replacement |
| Form control edges | Inputs/pads whose only affordance is the box |
| Stacked layers | Tucked toast rows: `ring-1 ring-inset ring-surface-line` |
| Page-level block cards | Pricing/bento cards sitting on a section background |
| Illustration strokes | SVG art, gradients, icon strokes |
| Overlap cut-outs | Avatar stacks use a surface-coloured gap ring |

Hairlines appear in three syntaxes — sweep all of them when auditing:

```txt
ring-1 ring-black/[0.08] ... dark:ring-white/[0.08]
shadow-[0_0_0_1px_rgba(...)] ... dark:shadow-[0_0_0_1px_...]
box-shadow: inset 0 0 0 1px var(--edge)
```

## Radii

| Token | Value | Use for |
| --- | --- | --- |
| `rounded-shell` | `28px` | Gallery card, device-sized shells |
| `rounded-panel` | `20px` | The item's outer surface |
| `rounded-item` | `14px` | Rows, inputs, cards inside a panel |
| `rounded-control` | `10px` | Small in-row buttons, icons, knobs |

- **Concentric rule:** `inner = outer − padding`. A 20px panel with 6px inset
  uses a 14px item; a 10px track with 2px inset uses an 8px knob.
- Pills use `rounded-full`; do not hand-write `rounded-[22px]` for a 44px pill.
- JS geometry that feeds springs, widths, or SVG cannot read CSS vars. Keep the
  number in the constant and mirror the token value in a comment
  (`radius: 28; // --radius-shell`).

## Motion

- 150–300ms, transform/opacity only.
- Under `prefers-reduced-motion: reduce`, disable **movement** (translate,
  scale, width/height springs) but keep **colour/opacity** fades: those are
  feedback, not motion sickness. A hover wash that jumps in at 0.01ms reads as
  broken.

## Theme-aware painting beyond backgrounds

- SVG `fill` / `stroke` are surfaces too. Use `fill-surface-0`, or an explicit
  light/dark pair. Do not leave `dark:fill-[#262626]` behind after a surface
  migration — it will sit one shade off every other item.
- Borders and focus offsets that sit on the surface should use the surface
  tokens (`ring-offset-surface-0`) rather than a guessed hex.

## Sizing

- To make a demo read larger, change its geometry constants (cell, dot, row
  height, font size), not `transform: scale`. Scaling leaves hit areas and
  layout boxes unchanged and blurs text on some displays.
- Keep proportions: scale every related constant (gap, padding, icon) by the
  same factor.

## Showcase state

Items may open in their most communicative state (an expanded picker, an open
menu). That state belongs to the gallery, not to the page: outside-click
handlers must only activate after the visitor has interacted with the trigger
themselves, otherwise any click elsewhere on the page folds the demo.
