export type Suggestion = {
  id: string;
  title: string;
  meta: string;
};

/**
 * Local corpus for the search demo. Keeping it in the item folder means the
 * block still works with no network and no project imports, while the list is
 * long enough to show filtering, wrapping and the scroll container.
 */
export const SUGGESTIONS: readonly Suggestion[] = [
  { id: "motion", title: "Motion", meta: "Foundations · 8 min" },
  { id: "tokens", title: "Design tokens", meta: "Foundations · 5 min" },
  { id: "dark-mode", title: "Dark mode", meta: "Guides · 4 min" },
  { id: "shortcuts", title: "Keyboard shortcuts", meta: "Guides · 3 min" },
  { id: "command-menu", title: "Command menu", meta: "Components · 6 min" },
  { id: "search-field", title: "Search field", meta: "Components · 5 min" },
  { id: "reduced-motion", title: "Reduced motion", meta: "Accessibility · 3 min" },
  { id: "focus-states", title: "Focus states", meta: "Accessibility · 4 min" },
] as const;

export function filterSuggestions(query: string): Suggestion[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...SUGGESTIONS];

  return SUGGESTIONS.filter((item) =>
    `${item.title} ${item.meta}`.toLowerCase().includes(needle),
  );
}
