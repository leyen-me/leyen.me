/** Sanity `quote.contentType` values — keep in sync with schemas/quote.ts */
export const QUOTE_CONTENT_TYPE_OPTIONS = [
  { value: "quote", label: "短句" },
  { value: "essay", label: "短文" },
] as const;

export type QuoteContentTypeValue =
  (typeof QUOTE_CONTENT_TYPE_OPTIONS)[number]["value"];

export function getQuoteContentTypeLabel(
  value: QuoteContentTypeValue | string
): string {
  const found = QUOTE_CONTENT_TYPE_OPTIONS.find((c) => c.value === value);
  return found?.label ?? value;
}
