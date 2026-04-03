import { createCompiler } from "@fumadocs/mdx-remote";
import type { MDXComponents } from "mdx/types";
import { getMDXComponents } from "@/mdx-components";

const mdxCompiler = createCompiler({
  rehypeCodeOptions: {
    themes: { light: "github-light", dark: "github-dark" },
    fallbackLanguage: "plaintext",
  },
  rehypeTocOptions: false,
  format: "md",
});

export type MdxMarkdownBodyProps = {
  markdown: string;
  /** 合并进默认映射，用于扩展自定义组件（与博客正文同一套 MDX） */
  components?: MDXComponents;
};

export async function MdxMarkdownBody({
  markdown,
  components,
}: MdxMarkdownBodyProps) {
  if (!markdown?.trim()) return null;
  const compiled = await mdxCompiler.compile({ source: markdown });
  const MdxContent = compiled.body;
  return <MdxContent components={getMDXComponents(components)} />;
}
