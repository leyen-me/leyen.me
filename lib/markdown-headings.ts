export type MarkdownHeading = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

function stripInlineMarkdown(value: string) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugifyHeading(value: string) {
  return stripInlineMarkdown(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function extractMarkdownHeadings(markdown: string): MarkdownHeading[] {
  const headings: MarkdownHeading[] = [];
  const slugCount = new Map<string, number>();
  const lines = markdown.split(/\r?\n/);
  let inCodeFence = false;

  for (const line of lines) {
    if (/^(```|~~~)/.test(line.trim())) {
      inCodeFence = !inCodeFence;
      continue;
    }

    if (inCodeFence) continue;

    const match = /^(#{2,4})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    const rawText = match[2]
      .replace(/\s+\{#([^}]+)\}\s*$/, "")
      .replace(/\s+\[#([^\]]+)\]\s*$/, "")
      .trim();
    const text = stripInlineMarkdown(rawText);
    const baseId = slugifyHeading(rawText);

    if (!text || !baseId) continue;

    const count = slugCount.get(baseId) ?? 0;
    slugCount.set(baseId, count + 1);

    headings.push({
      id: count === 0 ? baseId : `${baseId}-${count + 1}`,
      text,
      level: match[1].length as 2 | 3 | 4,
    });
  }

  return headings;
}
