"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import MarkdownPreview from "@/app/admin/components/MarkdownPreview";
import {
  applyTextareaUpdate,
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

  useImperativeHandle(ref, () => ({
    applyFormat(action) {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const update = action(
        value,
        textarea.selectionStart,
        textarea.selectionEnd
      );
      onChange(update.newValue);
      requestAnimationFrame(() => applyTextareaUpdate(textarea, update));
    },
  }));

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col border-b border-zinc-200 dark:border-zinc-800 lg:border-b-0 lg:border-r">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="开始写作..."
            className="min-h-[280px] flex-1 resize-none rounded-none border-0 bg-transparent px-4 py-4 font-mono text-sm leading-relaxed shadow-none focus-visible:ring-0 lg:min-h-0"
          />
        </div>
        <div className="min-h-0 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-900/30">
          <MarkdownPreview
            markdown={value}
            className="min-h-[280px] rounded-none border-0 bg-transparent lg:min-h-full"
          />
        </div>
      </div>
    </div>
  );
});

export default ImmersiveMarkdownEditor;
