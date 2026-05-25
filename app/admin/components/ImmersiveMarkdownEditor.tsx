"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import MarkdownPreview from "@/app/admin/components/MarkdownPreview";
import {
  applyTextareaUpdate,
  insertAtCursor,
  wrapSelection,
  type MarkdownFormatAction,
} from "@/lib/markdown-editor-utils";

export type EditorSelection = {
  start: number;
  end: number;
  text: string;
};

export type ImmersiveMarkdownEditorHandle = {
  applyFormat: (action: MarkdownFormatAction) => void;
  getSelection: () => EditorSelection | null;
  getTextarea: () => HTMLTextAreaElement | null;
  replaceRange: (start: number, end: number, text: string) => void;
  insertAtCursor: (text: string) => void;
};

type ImmersiveMarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onSelectionChange?: (selection: EditorSelection | null) => void;
  onContentScroll?: (scrolled: boolean) => void;
  className?: string;
};

const ImmersiveMarkdownEditor = forwardRef<
  ImmersiveMarkdownEditorHandle,
  ImmersiveMarkdownEditorProps
>(function ImmersiveMarkdownEditor(
  { value, onChange, onSelectionChange, onContentScroll, className },
  ref
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const onContentScrollRef = useRef(onContentScroll);
  onContentScrollRef.current = onContentScroll;

  const notifyContentScroll = useCallback(() => {
    const textareaScrollTop = textareaRef.current?.scrollTop ?? 0;
    const previewScrollTop = previewRef.current?.scrollTop ?? 0;
    onContentScrollRef.current?.(
      textareaScrollTop > 4 || previewScrollTop > 4
    );
  }, []);

  const readSelection = useCallback((): EditorSelection | null => {
    const textarea = textareaRef.current;
    if (!textarea) return null;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return null;

    return {
      start,
      end,
      text: value.slice(start, end),
    };
  }, [value]);

  const onSelectionChangeRef = useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;

  const notifySelectionChange = useCallback(() => {
    onSelectionChangeRef.current?.(readSelection());
  }, [readSelection]);

  function applyFormat(action: MarkdownFormatAction) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const update = action(value, textarea.selectionStart, textarea.selectionEnd);
    onChange(update.newValue);
    requestAnimationFrame(() => {
      applyTextareaUpdate(textarea, update);
      notifySelectionChange();
    });
  }

  function replaceRange(start: number, end: number, text: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const newValue = value.slice(0, start) + text + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      applyTextareaUpdate(textarea, {
        newValue,
        selectionStart: start,
        selectionEnd: start + text.length,
      });
      notifySelectionChange();
    });
  }

  function insertAtCursorText(text: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const update = insertAtCursor(
      value,
      textarea.selectionStart,
      textarea.selectionEnd,
      text
    );
    onChange(update.newValue);
    requestAnimationFrame(() => {
      applyTextareaUpdate(textarea, update);
      notifySelectionChange();
    });
  }

  useImperativeHandle(ref, () => ({
    applyFormat,
    getSelection: readSelection,
    getTextarea: () => textareaRef.current,
    replaceRange,
    insertAtCursor: insertAtCursorText,
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
        <div className="relative flex min-h-0 flex-col lg:border-r lg:border-zinc-200 dark:lg:border-zinc-800">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyUp={notifySelectionChange}
            onMouseUp={notifySelectionChange}
            onSelect={notifySelectionChange}
            onScroll={notifyContentScroll}
            placeholder="开始写作..."
            className="min-h-0 flex-1 resize-none rounded-none border-0 bg-transparent px-4 py-4 font-mono text-sm leading-relaxed shadow-none focus-visible:ring-0"
          />
        </div>
        <div
          ref={previewRef}
          onScroll={notifyContentScroll}
          className="hidden min-h-0 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-900/30 lg:block"
        >
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
