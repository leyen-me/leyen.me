/**
 * Tag helpers shared by the admin editors.
 *
 * Tags are stored as plain strings on Sanity documents, so "reusing" an
 * existing tag is purely a matter of not creating a spelling variant of it.
 * Deduplication is therefore case-insensitive and whitespace-normalised.
 */

const TAG_SEPARATOR = /[,，\n]/;

function normalizeTag(tag: string): string {
  return tag.trim().replace(/\s+/g, " ");
}

function tagKey(tag: string): string {
  return normalizeTag(tag).toLowerCase();
}

/** Splits free-form input (comma, full-width comma or newline separated) into unique tags. */
export function splitTagInput(raw: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const chunk of raw.split(TAG_SEPARATOR)) {
    const tag = normalizeTag(chunk);
    if (!tag) continue;

    const key = tagKey(tag);
    if (seen.has(key)) continue;

    seen.add(key);
    tags.push(tag);
  }

  return tags;
}

/** Appends tags, skipping duplicates and respecting an optional cap. */
export function addTags(
  current: string[],
  incoming: string[],
  maxTags = Number.POSITIVE_INFINITY
): string[] {
  const seen = new Set(current.map(tagKey));
  const next = [...current];

  for (const chunk of incoming) {
    if (next.length >= maxTags) break;

    const tag = normalizeTag(chunk);
    if (!tag) continue;

    const key = tagKey(tag);
    if (seen.has(key)) continue;

    seen.add(key);
    next.push(tag);
  }

  return next;
}

/**
 * Replaces one tag with another, dropping the duplicate it may create
 * (e.g. a post that already carried both spellings) and preserving order.
 */
export function renameTag(current: string[], from: string, to: string): string[] {
  const seen = new Set<string>();
  const next: string[] = [];

  for (const chunk of current) {
    const tag = chunk === from ? to : chunk;
    const key = tagKey(tag);
    if (!key || seen.has(key)) continue;

    seen.add(key);
    next.push(tag);
  }

  return next;
}

export function removeTag(current: string[], tag: string): string[] {
  const key = tagKey(tag);
  return current.filter((item) => tagKey(item) !== key);
}

/**
 * Coerces CMS/legacy values into a clean tag array.
 * Older documents (or in-flight state) may hold a comma separated string.
 */
export function normalizeTags(value: unknown): string[] {
  if (typeof value === "string") return splitTagInput(value);
  if (!Array.isArray(value)) return [];

  return addTags(
    [],
    value.filter((tag): tag is string => typeof tag === "string")
  );
}

/** Existing tags that are not selected yet and match the current query. */
export function filterTagSuggestions(
  suggestions: string[],
  selected: string[],
  query: string,
  limit = 8
): string[] {
  const selectedKeys = new Set(normalizeTags(selected).map(tagKey));
  const needle = query.trim().toLowerCase();

  return normalizeTags(suggestions)
    .filter((tag) => {
      if (selectedKeys.has(tagKey(tag))) return false;
      return needle.length === 0 || tagKey(tag).includes(needle);
    })
    .slice(0, limit);
}

/** True when the typed value would create a brand new tag. */
export function isNewTag(selected: string[], query: string): boolean {
  const tag = normalizeTag(query);
  if (!tag) return false;
  return !normalizeTags(selected).some((item) => tagKey(item) === tagKey(tag));
}
