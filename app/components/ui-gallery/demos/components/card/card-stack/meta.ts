import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Card Stack",
  summary: "悬停时五张卡片沿同一圆心弹簧展开，点按一张翻到中央放大并跟随指针倾斜，点击外部回落后置于顶部。",
  tags: ["hover", "spring", "flip", "stack", "pointer"],
  status: "ready",
  featured: false,
  previewHeight: 420,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/card-stack",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
