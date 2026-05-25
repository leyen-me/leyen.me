"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MarkdownPreview from "@/app/admin/components/MarkdownPreview";

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
        <MarkdownPreview markdown={value} />
      )}
    </div>
  );
}
