"use client";

import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";
import {
  getMarkdownComponents,
  markdownComponents,
} from "@/app/components/shared/markdown-components";

export type MarkdownBodyProps = {
  markdown: string;
  className?: string;
  components?: Partial<Components>;
  emptyPlaceholder?: ReactNode;
};

export function MarkdownBody({
  markdown,
  className,
  components,
  emptyPlaceholder,
}: MarkdownBodyProps) {
  if (!markdown?.trim()) {
    if (emptyPlaceholder !== undefined) {
      return <>{emptyPlaceholder}</>;
    }
    return null;
  }

  return (
    <div className={cn("article-content min-w-0", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={
          components
            ? getMarkdownComponents(components)
            : markdownComponents
        }
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
