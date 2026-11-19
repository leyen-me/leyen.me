import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Rolling Counter",
  summary:
    "可拖拽的里程表数字：每 12px 走一格，数位按进位错峰弹簧滚动，带速度模糊与甩动惯性。",
  tags: ["drag", "odometer", "spring", "motion", "number"],
  status: "ready",
  featured: false,
  previewHeight: 220,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/rolling-counter",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
