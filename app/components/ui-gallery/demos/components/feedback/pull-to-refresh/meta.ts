import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Pull to Refresh",
  summary:
    "下拉时以饱和阻尼拉伸卡片，越过阈值后六颗水滴聚成旋转圆环，松手刷新数据并回弹。",
  tags: ["pull", "gesture", "spring", "chart", "refresh"],
  status: "ready",
  featured: false,
  previewHeight: 420,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/pull",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
