import type { MDXComponents } from "mdx/types";
import { BiLinkExternal } from "react-icons/bi";
import RefLink from "@/app/components/shared/RefLink";

/**
 * 自定义 MDX 组件 - 避免 Fumadocs UI 对 React 19 的依赖
 * 使用与原有 CustomPortableText 相似的样式
 */
const defaultMdxComponents = {
  h2: ({ children, ...props }: any) => (
    <h2
      {...props}
      className="font-incognito font-bold tracking-tight dark:text-zinc-100 lg:text-4xl text-3xl text-zinc-700 my-8"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3
      {...props}
      className="font-incognito font-semibold tracking-tight lg:text-3xl text-2xl dark:text-zinc-100 text-zinc-700 my-6"
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4
      {...props}
      className="font-incognito font-semibold tracking-tight text-xl dark:text-zinc-100 text-zinc-700 mb-2 mt-4"
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }: any) => (
    <p {...props} className="mt-2 mb-6">
      {children}
    </p>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      {...props}
      className="relative overflow-hidden tracking-tight text-lg my-8 lg:py-6 lg:pl-6 pr-12 p-4 border dark:border-zinc-800 border-zinc-200 rounded-md"
    >
      {children}
    </blockquote>
  ),
  a: ({ children, href }: any) => (
    <RefLink
      href={(href as string) || "#"}
      className="dark:text-blue-400 text-blue-500 hover:underline"
    >
      {children} <BiLinkExternal className="inline" aria-hidden="true" />
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
            ? className || ""
            : `font-incognito py-[0.15rem] px-1 rounded-sm font-medium dark:bg-primary-bg bg-secondary-bg dark:text-zinc-300 text-zinc-800 ${className || ""}`
        }
      >
        {children}
      </code>
    );
  },
  pre: ({ children, className, ...props }: any) => (
    <pre
      {...props}
      className={`my-6 overflow-x-auto rounded-lg border dark:border-zinc-800 border-zinc-200 p-4 text-sm ${className || ""}`}
    >
      {children}
    </pre>
  ),
  ul: ({ children, ...props }: any) => (
    <ul {...props} className="list-[square] mt-5 ml-5">
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol {...props} className="list-decimal mt-5 ml-5">
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li {...props} className="mb-4">
      {children}
    </li>
  ),
  table: ({ children, ...props }: any) => (
    <div className="my-6 overflow-x-auto">
      <table
        {...props}
        className="border border-collapse dark:border-zinc-800 border-zinc-200 w-full text-base"
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead
      {...props}
      className="bg-zinc-50 dark:bg-[#141414] border-b dark:border-zinc-800 border-zinc-200 text-left"
    >
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: any) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }: any) => (
    <tr {...props} className="border-b dark:border-zinc-800 border-zinc-200 last:border-b-0">
      {children}
    </tr>
  ),
  th: ({ children, ...props }: any) => (
    <th
      {...props}
      className="font-medium text-lg font-incognito px-3 py-2 border-r dark:border-zinc-800 border-zinc-200 last:border-r-0"
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td
      {...props}
      className="px-3 py-2 border-r dark:border-zinc-800 border-zinc-200 last:border-r-0"
    >
      {children}
    </td>
  ),
  img: ({ src, alt, ...props }: any) => (
    <figure className="my-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || ""}
        className="rounded-sm object-contain w-full"
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
