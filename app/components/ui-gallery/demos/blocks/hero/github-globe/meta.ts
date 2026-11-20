import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "GitHub Globe",
  summary:
    "Three.js 与 three-globe 构建的可交互地球，包含弧线、点位与自动旋转。",
  tags: ["globe", "webgl", "three", "hero"],
  status: "ready",
  previewHeight: 600,
  createdAt: "2026-11-20",
  source: {
    label: "Inspired by Aceternity",
    url: "https://ui.aceternity.com/components/github-globe",
    license: "See https://ui.aceternity.com/licence",
  },
  requires: ["three", "three-globe", "@react-three/fiber", "@react-three/drei"],
} satisfies GalleryMeta;

export default meta;
