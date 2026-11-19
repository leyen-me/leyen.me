# Categories

The source of truth is `lib/ui-gallery/categories.ts`. Never invent a category
in a folder name; the sync script rejects unknown categories.

## components

Use these for self-contained widgets that live inside a layout.

| Category | Use for | Avoid |
| --- | --- | --- |
| `button` | actions, CTAs, loading/idle states | page-level navigation bars |
| `input` | text fields, selects, toggles, validation states | full forms |
| `form` | multi-field forms, submit/validation flows | a single input |
| `card` | content containers, hover effects, media cards | full page sections |
| `tabs` | segmented controls, tab panels | site navigation |
| `modal` | dialogs, drawers, command palettes | inline expandable panels |
| `toast` | transient notifications, inline status feedback | persistent banners |
| `tooltip` | hover/focus hints, popovers | primary content |
| `table` | data tables, sortable lists | marketing layouts |
| `navigation` | pagination, breadcrumbs, menus | full navigation blocks |
| `feedback` | loaders, skeletons, empty states, progress | static badges |
| `data-display` | numbers, counters, stat tiles, charts | form controls |
| `typography` | text effects, headings, prose treatments | long article content |

## blocks

Use these for page-level regions. They render full width inside an iframe.

| Category | Use for |
| --- | --- |
| `hero` | first viewport, headline + CTA composition |
| `navbar` | floating or sticky top navigation |
| `footer` | site footer, link groups |
| `feature-grid` | feature sections, bento grids |
| `pricing` | pricing tables, plan comparison, billing toggle |
| `testimonial` | quotes, logos, social proof |
| `faq` | accordions, question lists |
| `cta` | conversion banners and closing sections |
| `auth` | sign-in / sign-up screens |
| `dashboard` | dashboard shells, stat overviews |
| `gallery` | image walls, portfolio grids |

## Choosing between two plausible categories

Ask: what does the user interact with?

- The whole region, including its background and heading scale → `blocks`
- A single reusable control or container → `components`

Examples:

- "A pricing card" → `components/card`
- "A pricing section with a billing toggle" → `blocks/pricing`
- "A copy button" → `components/feedback`
- "A navigation bar" → `blocks/navbar`

## Adding a category

Only do this when the user asks. Adding categories means:

1. Edit `lib/ui-gallery/categories.ts` (id, label, description).
2. Run `npm run ui:sync`.
3. Verify `/ui/<kind>` shows the new category chip with a zero count.

Do not add a category for a single demo; pick the closest existing one.

## Tags

Tags are cross-category filters. Keep them lowercase kebab-case and reuse
existing vocabulary when possible:

`animation`, `a11y`, `bento`, `card`, `clipboard`, `css-only`, `css-vars`,
`cta`, `dark-mode`, `feedback`, `focus`, `form`, `glass`, `gradient`, `grid`,
`hero`, `hover`, `intersection-observer`, `landing`, `mouse`, `motion`,
`number`, `performance`, `pricing`, `responsive`, `scroll`, `segmented`,
`state`, `tabs`, `toggle`, `typography`.
