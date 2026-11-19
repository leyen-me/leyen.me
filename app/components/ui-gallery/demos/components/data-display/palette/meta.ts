import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Palette",
  summary:
    "在 OKLCH 空间按五种情绪生成四色配色，按下后色块先收成圆、在顶点换色再展开，缝隙由随动画渐隐的 goo 滤镜连成液体。",
  tags: ["color", "oklch", "morph", "gooey"],
  status: "ready",
  featured: false,
  previewHeight: 220,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/palette",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
