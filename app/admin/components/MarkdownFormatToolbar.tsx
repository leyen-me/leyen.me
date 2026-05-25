"use client";

import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  SquareCode,
  Strikethrough,
  Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  insertAtCursor,
  insertCodeBlock,
  insertHorizontalRule,
  insertTable,
  prefixLines,
  prefixOrderedLines,
  wrapSelection,
  type MarkdownFormatAction,
} from "@/lib/markdown-editor-utils";

type ToolbarAction = {
  label: string;
  icon: typeof Bold;
  action: MarkdownFormatAction;
};

const toolbarGroups: ToolbarAction[][] = [
  [
    {
      label: "加粗",
      icon: Bold,
      action: (value, start, end) =>
        wrapSelection(value, start, end, "**", "**", "加粗文字"),
    },
    {
      label: "倾斜",
      icon: Italic,
      action: (value, start, end) =>
        wrapSelection(value, start, end, "*", "*", "倾斜文字"),
    },
    {
      label: "删除线",
      icon: Strikethrough,
      action: (value, start, end) =>
        wrapSelection(value, start, end, "~~", "~~", "删除线"),
    },
    {
      label: "行内代码",
      icon: Code,
      action: (value, start, end) =>
        wrapSelection(value, start, end, "`", "`", "code"),
    },
  ],
  [
    {
      label: "一级标题",
      icon: Heading1,
      action: (value, start, end) => prefixLines(value, start, end, "# "),
    },
    {
      label: "二级标题",
      icon: Heading2,
      action: (value, start, end) => prefixLines(value, start, end, "## "),
    },
    {
      label: "三级标题",
      icon: Heading3,
      action: (value, start, end) => prefixLines(value, start, end, "### "),
    },
    {
      label: "引用",
      icon: Quote,
      action: (value, start, end) => prefixLines(value, start, end, "> "),
    },
    {
      label: "分割线",
      icon: Minus,
      action: insertHorizontalRule,
    },
  ],
  [
    {
      label: "无序列表",
      icon: List,
      action: (value, start, end) => prefixLines(value, start, end, "- "),
    },
    {
      label: "有序列表",
      icon: ListOrdered,
      action: prefixOrderedLines,
    },
    {
      label: "任务列表",
      icon: ListChecks,
      action: (value, start, end) => prefixLines(value, start, end, "- [ ] "),
    },
  ],
  [
    {
      label: "链接",
      icon: Link,
      action: (value, start, end) =>
        wrapSelection(value, start, end, "[", "](https://)", "链接文字"),
    },
    {
      label: "图片",
      icon: Image,
      action: (value, start, end) =>
        insertAtCursor(value, start, end, "![描述](https://)"),
    },
  ],
  [
    {
      label: "代码块",
      icon: SquareCode,
      action: insertCodeBlock,
    },
    {
      label: "表格",
      icon: Table,
      action: insertTable,
    },
  ],
];

type MarkdownFormatToolbarProps = {
  onAction: (action: MarkdownFormatAction) => void;
  className?: string;
};

export default function MarkdownFormatToolbar({
  onAction,
  className,
}: MarkdownFormatToolbarProps) {
  return (
    <div className={cn("flex items-center gap-1 overflow-x-auto", className)}>
      {toolbarGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="flex shrink-0 items-center gap-1">
          {groupIndex > 0 ? (
            <div
              aria-hidden="true"
              className="mx-1 hidden h-6 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700 sm:block"
            />
          ) : null}
          {group.map(({ label, icon: Icon, action }) => (
            <Button
              key={label}
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onAction(action)}
              title={label}
              aria-label={label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}
