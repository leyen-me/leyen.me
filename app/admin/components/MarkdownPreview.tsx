"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { markdownPreviewComponents } from "@/app/admin/components/markdown-preview-components";

type MarkdownPreviewProps = {
  markdown: string;
  className?: string;
};

export default function MarkdownPreview({
  markdown,
  className,
}: MarkdownPreviewProps) {
  if (!markdown.trim()) {
    return (
      <div
        className={cn(
          "min-h-[320px] rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900",
          className
        )}
      >
        暂无内容
      </div>
    );
  }

  return (
    <div
      className={cn(
        "article-content min-h-[320px] overflow-x-auto rounded-md border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-700 dark:bg-zinc-950",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownPreviewComponents}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
