/**
 * Bencho's context budget, verbatim. Values are thousands of tokens; the bar's
 * `flex-grow` is the raw number, so proportions come straight from this table.
 */
export type KindId = "sys" | "tools" | "files" | "chat" | "mem";

export type Kind = {
  id: KindId;
  name: string;
  /** Token count in thousands, at rest. */
  k: number;
};

export const KINDS: readonly Kind[] = [
  { id: "sys", name: "System", k: 4.2 },
  { id: "tools", name: "Tools", k: 12.8 },
  { id: "files", name: "Files", k: 46.1 },
  { id: "chat", name: "Chat", k: 108.6 },
  { id: "mem", name: "Memory", k: 3.9 },
];

/** The window is 200K tokens. */
export const LIMIT = 200;

/** Compact squeezes chat, and only chat, down to this. */
export const COMPACT_CHAT = 30.4;

/**
 * The bar's order is fixed by the resting sizes (largest first) and does not
 * re-sort when chat shrinks, so compacting reads as one segment giving way.
 */
export const BAR_ORDER: readonly Kind[] = [...KINDS].sort((a, b) => b.k - a.k);

/** Chip order follows the bar. */
export const CHIP_ORDER = BAR_ORDER;

export function valuesFor(compacted: boolean): Record<KindId, number> {
  return {
    sys: 4.2,
    tools: 12.8,
    files: 46.1,
    chat: compacted ? COMPACT_CHAT : 108.6,
    mem: 3.9,
  };
}

export function totalFor(values: Record<KindId, number>): number {
  return KINDS.reduce((sum, kind) => sum + values[kind.id], 0);
}

/** One decimal, e.g. 108.6 → "108.6K". */
export function formatTokens(value: number): string {
  return `${value.toFixed(1)}K`;
}

export function kindById(id: KindId): Kind {
  return KINDS.find((kind) => kind.id === id) ?? KINDS[0];
}
