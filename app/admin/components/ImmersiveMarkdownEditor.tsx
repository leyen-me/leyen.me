"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import MarkdownPreview from "@/app/admin/components/MarkdownPreview";
import {
  applyTextareaUpdate,
  wrapSelection,
  type MarkdownFormatAction,
} from "@/lib/markdown-editor-utils";

export type ImmersiveMarkdownEditorHandle = {
  applyFormat: (action: MarkdownFormatAction) => void;
};

type ImmersiveMarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const ImmersiveMarkdownEditor = forwardRef<
  ImmersiveMarkdownEditorHandle,
  ImmersiveMarkdownEditorProps
>(function ImmersiveMarkdownEditor({ value, onChange, className }, ref) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function applyFormat(action: MarkdownFormatAction) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const update = action(value, textarea.selectionStart, textarea.selectionEnd);
    onChange(update.newValue);
    requestAnimationFrame(() => applyTextareaUpdate(textarea, update));
  }

  useImperativeHandle(ref, () => ({
    applyFormat,
  }));

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.metaKey || e.ctrlKey)) return;

    let action: MarkdownFormatAction | null = null;

    switch (e.key.toLowerCase()) {
      case "b":
        action = (v, start, end) =>
          wrapSelection(v, start, end, "**", "**", "加粗文字");
        break;
      case "i":
        action = (v, start, end) =>
          wrapSelection(v, start, end, "*", "*", "倾斜文字");
        break;
      case "k":
        action = (v, start, end) =>
          wrapSelection(v, start, end, "[", "](https://)", "链接文字");
        break;
      default:
        return;
    }

    e.preventDefault();
    applyFormat(action);
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col lg:border-r lg:border-zinc-200 dark:lg:border-zinc-800">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="开始写作..."
            className="min-h-0 flex-1 resize-none rounded-none border-0 bg-transparent px-4 py-4 font-mono text-sm leading-relaxed shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="hidden min-h-0 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-900/30 lg:block">
          <MarkdownPreview
            markdown={value}
            className="min-h-full rounded-none border-0 bg-transparent"
          />
        </div>
      </div>
    </div>
  );
});

export default ImmersiveMarkdownEditor;
