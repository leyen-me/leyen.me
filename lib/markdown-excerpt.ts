/** 从 Markdown 中粗略抽出纯文本，用于 SEO / 摘要（与 blog 正文的 strip 思路一致） */
export function markdownToPlainExcerpt(text: string, max = 160): string {
  const t = text
    .replace(/#{1,6}\s/g, "")
    .replace(/[*_`~\[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}
