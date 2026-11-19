import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Emoji Reactions",
  summary:
    "按下消息即可展开表情面板，选中的表情沿弧线飞入下方反应胶囊，计数以滚轮进位，并合成轻量 Web Audio 音效。",
  tags: ["reactions", "emoji", "motion", "sound"],
  status: "ready",
  featured: false,
  previewHeight: 260,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/emoji-reactions",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
