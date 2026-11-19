import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Action Node",
  summary:
    "自动化步骤卡的操作藏进右上角，悬停或聚焦时四个按钮沿卡片轮廓的弧线弹性展开。",
  tags: ["hover", "spring", "corner", "automation"],
  status: "ready",
  featured: false,
  previewHeight: 420,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/action-node",
    license: "See https://bencho.dev/licence",
  },
  requires: ["lucide-react"],
} satisfies GalleryMeta;

export default meta;
