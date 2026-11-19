import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Create Menu",
  summary:
    "液体胶囊按下后整体收缩再弹性展开为创建菜单，行列以 22ms 级联浮现，并用 SVG goo 滤镜与 Web Audio 音效完成一次连续形变。",
  tags: ["liquid", "menu", "spring", "gooey", "sound"],
  status: "ready",
  featured: false,
  previewHeight: 320,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/liq-create",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
