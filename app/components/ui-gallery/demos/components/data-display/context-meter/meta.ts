import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Context Meter",
  summary:
    "上下文窗口的分段条形图：悬停点亮某一类并显示其用量，Compact 以缓动与合成音把 Chat 压缩，再原样还原。",
  tags: ["hover", "data-viz", "sound", "motion"],
  status: "ready",
  featured: false,
  previewHeight: 340,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/context-meter",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
