import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Generate",
  summary:
    "点击 Generate 后由一条五秒时钟依次驱动印刷图的位移、模糊与对比度，最后以清晰版本显影，进度沿随机单调路径跳动。",
  tags: ["ai", "progress", "svg-filter", "halftone", "loading"],
  status: "ready",
  featured: false,
  previewHeight: 440,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/generate",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
