import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Search",
  summary:
    "单个胶囊的宽度就是状态：镜头固定不动，输入框在它周围弹簧展开；按下先压缩 90ms，附带本地建议筛选、命中高亮、清空按钮与 combobox 键盘流。",
  tags: ["search", "combobox", "spring", "filter", "keyboard"],
  status: "ready",
  featured: false,
  previewHeight: 460,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/seek",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
