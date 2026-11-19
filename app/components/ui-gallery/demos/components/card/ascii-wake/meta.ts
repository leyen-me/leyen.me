import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "ASCII Wake",
  summary: "点阵立方体把指针轨迹加热成字符尾迹，再按指数冷却回圆点；渲染全在 canvas 完成。",
  tags: ["ascii", "canvas", "hover", "mouse", "typography"],
  status: "ready",
  featured: false,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/ascii-wake",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
