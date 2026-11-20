import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Shape Hero",
  summary: "可抓取抛掷的胶囊刚体堆，形状落下后堆叠、休眠，再次拖动即唤醒。",
  tags: ["physics", "drag", "shapes", "background"],
  status: "ready",
  previewHeight: 600,
  createdAt: "2026-11-20",
  source: {
    label: "Inspired by KokonutUI",
    url: "https://kokonutui.com/docs/backgrounds/shape-hero",
    license: "MIT",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
