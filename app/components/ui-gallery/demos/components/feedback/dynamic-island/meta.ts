import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Dynamic Island",
  summary:
    "黑色药丸按住缩小、按下展开：宽高与圆角共用一根弹簧整体生长，紧凑行与活动卡片以模糊缩放交叉换场，计时、通话、音乐与航班各自带实时状态。",
  tags: ["spring", "press", "expand", "media"],
  status: "ready",
  featured: false,
  previewHeight: 380,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/dynamic-island",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
