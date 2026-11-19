import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Music Island",
  summary:
    "动态岛风格的音乐卡：黑色药丸从专辑封面与跳动声浪，按同一根弹簧长成封面、曲目、可拖动进度条与控制键。",
  tags: ["spring", "expand", "player", "media"],
  status: "ready",
  featured: false,
  previewHeight: 320,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/music-island",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
