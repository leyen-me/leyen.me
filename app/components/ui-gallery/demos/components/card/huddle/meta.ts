import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Huddle",
  summary:
    "四人语音房：加入时自己的头像球弹出、其他人弹开让位，发言者的呼吸圆环与波形标记轮换，并附 Web Audio 合成提示音。",
  tags: ["voice", "presence", "spring", "web-audio", "a11y"],
  status: "ready",
  featured: false,
  previewHeight: 300,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/huddle",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
