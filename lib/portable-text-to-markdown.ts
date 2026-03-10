import { portableTextToMarkdown } from "@portabletext/markdown";
import { urlFor } from "@/lib/sanity.image";
import getYoutubeId from "@/app/utils/get-youtubeId";
import type { PortableTextBlock } from "sanity";
import type { TableValueProps, QuizValueProps } from "@/types";

/** Shiki 支持的语言白名单，避免路径等非法值导致报错 */
const VALID_LANGUAGES = new Set([
  "bash", "js", "ts", "tsx", "jsx", "css", "graphql", "html", "json", "md",
  "py", "scss", "sql", "yaml", "java", "typescript", "javascript", "text",
  "xml", "markdown", "jsonc", "sh", "shell", "zsh",
]);

function normalizeCodeLanguage(lang: string | undefined): string {
  if (!lang || typeof lang !== "string") return "text";
  const trimmed = lang.trim().toLowerCase();
  // 路径、URL 等非法值回退为 text
  if (trimmed.includes("/") || trimmed.includes(".") || trimmed.includes(" ")) {
    return "text";
  }
  return VALID_LANGUAGES.has(trimmed) ? trimmed : "text";
}

/** 生成不会被代码内容破坏的栅栏（避免 ``` 导致 import/export 泄露被 MDX 解析） */
function getCodeFence(code: string): string {
  const matches = code.match(/`+/g);
  if (!matches) return "```";
  const maxLen = Math.max(...matches.map((m) => m.length));
  return "`".repeat(Math.max(3, maxLen + 1));
}

/**
 * 将 Sanity Portable Text 转换为 Markdown，供 Fumadocs 渲染
 */
export function convertPortableTextToMarkdown(body: PortableTextBlock[]): string {
  return portableTextToMarkdown(body, {
    types: {
      // Sanity 标准 code 块
      code: ({ value }) => {
        const lang = normalizeCodeLanguage(value?.language);
        const code = value?.code || "";
        const fence = getCodeFence(code);
        return `\n${fence}${lang}\n${code}\n${fence}\n`;
      },
      // Sanity 图片块 - 需要解析 asset 获取 URL
      image: ({ value }) => {
        if (!value?.asset) return "";
        const src = urlFor(value).url();
        const alt = value?.alt || "";
        const title = value?.caption || "";
        return title
          ? `![${alt}](${src} "${title}")\n\n`
          : `![${alt}](${src})\n\n`;
      },
      // YouTube 嵌入 - 输出 HTML iframe
      youtube: ({ value }: { value: { url?: string } }) => {
        const id = getYoutubeId(value?.url);
        if (!id) return "";
        return `
<div class="aspect-video w-full my-6 rounded-lg overflow-hidden">
  <iframe
    width="100%"
    height="100%"
    src="https://www.youtube.com/embed/${id}"
    title="YouTube video player"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
  ></iframe>
</div>
`.trim();
      },
      // 自定义表格 - 转为 Markdown 表格
      customTable: ({ value }: { value: TableValueProps }) => {
        const { caption, table } = value;
        const rows = table?.rows;
        if (!rows || rows.length < 1) return "";

        const cellsMatrix = rows.map((r) => r.cells);
        const [headerRow, ...bodyRows] = cellsMatrix;
        if (!headerRow || bodyRows.length < 1) return "";

        const header = `| ${headerRow.join(" | ")} |`;
        const separator = `| ${headerRow.map(() => "---").join(" | ")} |`;
        const body = bodyRows
          .map((row) => `| ${row.join(" | ")} |`)
          .join("\n");
        const tableMd = [header, separator, body].join("\n");
        return caption ? `${tableMd}\n\n*${caption}*` : tableMd;
      },
      // Quiz - 输出 HTML details/summary
      quiz: ({ value }: { value: QuizValueProps }) => {
        const { question, answer } = value;
        if (!question) return "";
        return `
<details class="my-4 border dark:border-zinc-800 border-zinc-200 rounded-md overflow-hidden">
  <summary class="px-4 py-3 cursor-pointer font-semibold dark:text-zinc-100 text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
    ${escapeHtml(question)}
  </summary>
  <div class="px-4 py-3 border-t dark:border-zinc-800 border-zinc-200 dark:text-zinc-400 text-zinc-600">
    ${escapeHtml(answer || "").replace(/\n/g, "<br />")}
  </div>
</details>
`.trim();
      },
    },
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
