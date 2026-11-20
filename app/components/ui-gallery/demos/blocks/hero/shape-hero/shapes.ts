/**
 * Shape Hero 的形状清单与常量，取值对齐 KokonutUI 原作（MIT · © 2025 kokonutUI）。
 * 尺寸沿用 px，定位交给物理求解器，不参与页面流。
 */

import type { ReactNode } from "react";

export interface HeroShape {
  id: string;
  /** Text or an icon inside the shape. Leave empty for a plain shape. */
  content?: ReactNode;
  /** 尺寸、配色与圆角；每块形状都按胶囊处理，正方形即圆点。 */
  className?: string;
}

/** 原作使用 `@/lib/utils` 的 cn，这里只做条件拼接，保持 demo 自包含。 */
export function cn(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

const PILL = "h-14 px-7 font-medium text-lg tracking-tight";
const OUTLINE =
  "border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100";
const SOLID = "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900";
const ACCENT = "bg-orange-500 text-white";

/** 原作 DEFAULT_SHAPES：屏幕上的标签就是形状本身，因此保留。 */
export const SHAPES: HeroShape[] = [
  { id: "pull-cord", content: "Pull Cord", className: cn(PILL, SOLID) },
  { id: "detent-dial", content: "Detent Dial", className: cn(PILL, OUTLINE) },
  { id: "dot-1", className: cn("h-16 w-16", ACCENT) },
  { id: "wheel-picker", content: "Wheel Picker", className: cn(PILL, OUTLINE) },
  { id: "topo", content: "Topo", className: cn(PILL, ACCENT) },
  { id: "split-flap", content: "Split Flap", className: cn(PILL, OUTLINE) },
  { id: "dot-2", className: cn("h-12 w-12", SOLID) },
  {
    id: "notification-stack",
    content: "Notification Stack",
    className: cn(PILL, OUTLINE),
  },
  { id: "paper-fold", content: "Paper Fold", className: cn(PILL, SOLID) },
  { id: "dot-3", className: cn("h-20 w-20", OUTLINE) },
  { id: "toss-board", content: "Toss Board", className: cn(PILL, OUTLINE) },
  { id: "react", content: "React", className: cn(PILL, OUTLINE) },
  { id: "motion", content: "Motion", className: cn(PILL, SOLID) },
  { id: "dot-4", className: cn("h-14 w-14", OUTLINE) },
  { id: "tailwind", content: "Tailwind CSS", className: cn(PILL, OUTLINE) },
  { id: "shadcn", content: "shadcn/ui", className: cn(PILL, OUTLINE) },
  { id: "peel-sticker", content: "Peel Sticker", className: cn(PILL, SOLID) },
  { id: "dot-5", className: cn("h-12 w-12", ACCENT) },
  {
    id: "background-paths",
    content: "Background Paths",
    className: cn(PILL, OUTLINE),
  },
  { id: "flow-field", content: "Flow Field", className: cn(PILL, OUTLINE) },
  { id: "dot-6", className: cn("h-16 w-16", SOLID) },
  { id: "typescript", content: "TypeScript", className: cn(PILL, OUTLINE) },
];

/** 堆最多占区块面积的 30%，其余形状留在 DOM 里但不显示（原作行为）。 */
export const FILL = 0.3;
