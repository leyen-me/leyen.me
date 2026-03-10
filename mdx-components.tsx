import type { MDXComponents } from "mdx/types";
import { BiLinkExternal } from "react-icons/bi";
import RefLink from "@/app/components/shared/RefLink";
import CodeBlock from "@/app/components/shared/CodeBlock";
import { slugifyHeading } from "@/lib/markdown-headings";

/**
 * 自定义 MDX 组件 - 避免 Fumadocs UI 对 React 19 的依赖
 * 使用与原有 CustomPortableText 相似的样式
 */
function flattenText(node: any): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }

  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(flattenText).join("");
  }

  if (typeof node === "object" && "props" in node) {
    return flattenText(node.props?.children);
  }

  return "";
}

function createHeading(
  Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
  className: string,
  hashOffsetClass = "lg:-left-8"
) {
  const HeadingComponent = ({ children, ...props }: any) => {
    const headingText = flattenText(children).trim();
    const id = props.id || slugifyHeading(headingText);

    return (
      <Tag
        {...props}
        id={id}
        className={`group scroll-mt-28 font-incognito tracking-tight dark:text-zinc-50 text-zinc-900 ${className}`}
      >
        <a
          href={`#${id}`}
          className={`absolute ${hashOffsetClass} left-0 top-1/2 hidden -translate-y-1/2 text-zinc-300 opacity-0 transition group-hover:opacity-100 dark:text-zinc-600 lg:inline-block`}
          aria-label={`跳转到 ${headingText}`}
        >
          #
        </a>
        {children}
      </Tag>
    );
  };

  HeadingComponent.displayName = `Markdown${Tag.toUpperCase()}`;

  return HeadingComponent;
}

const defaultMdxComponents = {
  h1: createHeading(
    "h1",
    "relative mb-4 mt-12 border-t-0 border-zinc-200 pt-10 text-[1.95rem] font-semibold dark:border-zinc-800 sm:text-[2.1rem]",
    "lg:-left-10"
  ),
  h2: createHeading(
    "h2",
    "relative mb-4 mt-10 border-t-0 border-zinc-200 pt-8 text-[1.7rem] font-semibold dark:border-zinc-800 sm:text-[1.8rem]"
  ),
  h3: createHeading(
    "h3",
    "relative mb-3 mt-8 text-[1.45rem] font-semibold sm:text-[1.55rem]"
  ),
  h4: createHeading(
    "h4",
    "relative mb-3 mt-7 text-[1.25rem] font-semibold text-zinc-800 dark:text-zinc-100"
  ),
  h5: createHeading(
    "h5",
    "relative mb-2 mt-6 text-[1.1rem] font-semibold text-zinc-800 dark:text-zinc-100"
  ),
  h6: createHeading(
    "h6",
    "relative mb-2 mt-6 text-base font-semibold text-zinc-700 dark:text-zinc-200"
  ),
  p: ({ children, ...props }: any) => (
    <p
      {...props}
      className="my-4 text-[0.98rem] leading-8 text-zinc-700 dark:text-zinc-300"
    >
      {children}
    </p>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      {...props}
      className="my-7 rounded-2xl border border-zinc-200 bg-zinc-50/70 px-6 py-5 text-[0.98rem] leading-7 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 [&>*]:px-1"
    >
      {children}
    </blockquote>
  ),
  a: ({ children, href }: any) => (
    <RefLink
      href={(href as string) || "#"}
      className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-700 dark:hover:decoration-zinc-400"
    >
      {children} <BiLinkExternal className="mb-0.5 ml-0.5 inline" aria-hidden="true" />
    </RefLink>
  ),
  code: ({ children, className, ...props }: any) => {
    // Shiki 代码块的 code 无 language- 类，但 children 是 span 等 React 元素；行内代码 children 是纯文本
    const isCodeBlock =
      className?.includes?.("language-") ||
      (Array.isArray(children)
        ? children.some((c: unknown) => typeof c === "object" && c !== null)
        : typeof children === "object" && children !== null);
    return (
      <code
        {...props}
        className={
          isCodeBlock
            ? `block min-w-max ${className || ""}`
            : `rounded-md border border-zinc-200 bg-zinc-100 px-2 py-1 font-mono text-[0.9em] font-medium text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 ${className || ""}`
        }
      >
        {children}
      </code>
    );
  },
  pre: ({ children, className, ...props }: any) => (
    <CodeBlock {...props} className={className || ""}>
      {children}
    </CodeBlock>
  ),
  ul: ({ children, ...props }: any) => (
    <ul
      {...props}
      className="my-4 px-6 ml-6 list-disc space-y-2 marker:text-zinc-400 dark:marker:text-zinc-600"
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol
      {...props}
      className="my-4 px-6 ml-6 list-decimal space-y-2 marker:text-zinc-400 dark:marker:text-zinc-600"
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li
      {...props}
      className="pl-1 text-[0.98rem] leading-8 text-zinc-700 dark:text-zinc-300"
    >
      {children}
    </li>
  ),
  table: ({ children, ...props }: any) => (
    <div className="my-8 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <table
        {...props}
        className="w-full border-collapse text-left text-sm"
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead
      {...props}
      className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/80"
    >
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: any) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }: any) => (
    <tr
      {...props}
      className="border-b border-zinc-200 last:border-b-0 dark:border-zinc-800"
    >
      {children}
    </tr>
  ),
  th: ({ children, ...props }: any) => (
    <th
      {...props}
      className="border-r border-zinc-200 px-4 py-3 font-incognito text-base font-semibold text-zinc-900 last:border-r-0 dark:border-zinc-800 dark:text-zinc-100"
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td
      {...props}
      className="border-r border-zinc-200 px-4 py-3 align-top text-zinc-700 last:border-r-0 dark:border-zinc-800 dark:text-zinc-300"
    >
      {children}
    </td>
  ),
  strong: ({ children, ...props }: any) => (
    <strong {...props} className="font-semibold text-zinc-900 dark:text-zinc-100">
      {children}
    </strong>
  ),
  em: ({ children, ...props }: any) => (
    <em {...props} className="italic text-zinc-800 dark:text-zinc-200">
      {children}
    </em>
  ),
  details: ({ children, ...props }: any) => (
    <details
      {...props}
      className="my-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white/70 dark:border-zinc-800 dark:bg-zinc-950/70"
    >
      {children}
    </details>
  ),
  summary: ({ children, ...props }: any) => (
    <summary
      {...props}
      className="cursor-pointer list-none px-5 py-4 font-medium text-zinc-900 marker:hidden dark:text-zinc-100"
    >
      {children}
    </summary>
  ),
  img: ({ src, alt, ...props }: any) => (
    <figure className="my-10 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || ""}
        className="w-full object-contain"
        loading="lazy"
        {...props}
      />
    </figure>
  ),
};

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
  } as MDXComponents;
}

export const useMDXComponents = getMDXComponents;
