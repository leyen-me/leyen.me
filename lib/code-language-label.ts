import { Children, isValidElement, type ReactNode } from "react";

/** Markdown 围栏语言别名 → 顶栏展示名 */
const LANGUAGE_LABELS: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JSX",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  py: "Python",
  python: "Python",
  rb: "Ruby",
  ruby: "Ruby",
  go: "Go",
  rust: "Rust",
  java: "Java",
  kotlin: "Kotlin",
  swift: "Swift",
  php: "PHP",
  sql: "SQL",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  shellscript: "Shell",
  zsh: "Zsh",
  yaml: "YAML",
  yml: "YAML",
  json: "JSON",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  less: "Less",
  markdown: "Markdown",
  md: "Markdown",
  graphql: "GraphQL",
  gql: "GraphQL",
  vue: "Vue",
  svelte: "Svelte",
  dart: "Dart",
  lua: "Lua",
  r: "R",
  cpp: "C++",
  "c++": "C++",
  c: "C",
  cs: "C#",
  csharp: "C#",
  "c#": "C#",
  zig: "Zig",
  prisma: "Prisma",
  plaintext: "Plain Text",
  text: "Plain Text",
  txt: "Plain Text",
};

export function parseLanguageFromClassName(className?: string): string | undefined {
  if (!className) return undefined;
  const match = String(className).match(/\blanguage-([\w+#.-]+)/i);
  return match?.[1]?.toLowerCase();
}

export function extractLanguageFromPreChildren(children: ReactNode): string | undefined {
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) continue;
    const props = child.props as { className?: string; children?: ReactNode };
    const fromClass = parseLanguageFromClassName(props.className);
    if (fromClass) return fromClass;
    const nested = extractLanguageFromPreChildren(props.children);
    if (nested) return nested;
  }
  return undefined;
}

export function formatCodeLanguageLabel(lang?: string | null): string {
  if (!lang?.trim()) return "Code";
  const key = lang.trim().toLowerCase().replace(/^language-/, "");
  if (LANGUAGE_LABELS[key]) return LANGUAGE_LABELS[key];
  if (/^[a-z0-9+#.-]+$/i.test(key)) {
    return key.charAt(0).toUpperCase() + key.slice(1);
  }
  return key;
}
