import { createCompiler } from "@fumadocs/mdx-remote";

export const mdxCompiler = createCompiler({
  rehypeCodeOptions: {
    themes: { light: "github-light", dark: "github-dark" },
    fallbackLanguage: "plaintext",
    addLanguageClass: true,
  },
  rehypeTocOptions: false,
  format: "md",
});
