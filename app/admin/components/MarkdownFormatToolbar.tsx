"use client";

import {
  Bold,
  Code,
  Heading2,
  Image,
  Italic,
  Link,
  List,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  insertAtCursor,
  prefixLines,
  wrapSelection,
  type MarkdownFormatAction,
} from "@/lib/markdown-editor-utils";

const toolbarActions: Array<{
  label: string;
  icon: typeof Bold;
  action: MarkdownFormatAction;
}> = [
  {
    label: "加粗",
    icon: Bold,
    action: (value, start, end) => wrapSelection(value, start, end, "**", "**", "加粗文字"),
  },
  {
    label: "倾斜",
    icon: Italic,
    action: (value, start, end) => wrapSelection(value, start, end, "*", "*", "倾斜文字"),
  },
  {
    label: "标题",
    icon: Heading2,
    action: (value, start, end) => prefixLines(value, start, end, "## "),
  },
  {
    label: "引用",
    icon: Quote,
    action: (value, start, end) => prefixLines(value, start, end, "> "),
  },
  {
    label: "列表",
    icon: List,
    action: (value, start, end) => prefixLines(value, start, end, "- "),
  },
  {
    label: "链接",
    icon: Link,
    action: (value, start, end) =>
      wrapSelection(value, start, end, "[", "](https://)", "链接文字"),
  },
  {
    label: "行内代码",
    icon: Code,
    action: (value, start, end) => wrapSelection(value, start, end, "`", "`", "code"),
  },
  {
    label: "图片",
    icon: Image,
    action: (value, start, end) =>
      insertAtCursor(value, start, end, "![描述](https://)"),
  },
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
    <div className={className}>
      {toolbarActions.map(({ label, icon: Icon, action }) => (
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
  );
}
