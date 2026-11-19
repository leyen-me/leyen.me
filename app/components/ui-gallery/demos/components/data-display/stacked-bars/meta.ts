import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Stacked Bars",
  summary:
    "可横向扫过的堆叠柱状图：悬停环与提示卡以弹簧跟随，其余柱子向卡片底色退让，Day / Week 切换时按列错峰重绘。",
  tags: ["hover", "data-viz", "spring", "tooltip", "chart"],
  status: "ready",
  featured: false,
  previewHeight: 340,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/stacked-bars",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
