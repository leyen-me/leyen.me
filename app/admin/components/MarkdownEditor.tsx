"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type MarkdownEditorProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
};

export default function MarkdownEditor({
  id,
  label,
  value,
  onChange,
  rows = 20,
  className,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="flex gap-2">
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-1 text-sm",
            tab === "edit"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          )}
          onClick={() => setTab("edit")}
        >
          编辑
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-1 text-sm",
            tab === "preview"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          )}
          onClick={() => setTab("preview")}
        >
          预览
        </button>
      </div>
      {tab === "edit" ? (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="font-mono text-sm"
        />
      ) : (
        <div className="article-content min-h-[320px] rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900">
          {value.trim() ? (
            <pre className="whitespace-pre-wrap font-sans">{value}</pre>
          ) : (
            <p className="text-zinc-500">暂无内容</p>
          )}
        </div>
      )}
    </div>
  );
}
