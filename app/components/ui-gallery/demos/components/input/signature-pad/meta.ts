import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Signature Pad",
  summary:
    "笔画按速度变粗细、平滑跟随，Clear 自最后一点向前反向擦除墨迹，停笔后淡出并收缩成 Signed 胶囊。",
  tags: ["signature", "pointer", "svg", "ink", "rewind"],
  status: "ready",
  featured: false,
  previewHeight: 280,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/signature",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
