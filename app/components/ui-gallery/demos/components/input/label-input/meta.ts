import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Label Input",
  summary:
    "标签上浮时逐字跳动，顶部描边从中间裂开；保留 Bencho 的 280×52 几何、420ms 曲线与圆角参数，并补充邮箱校验与字数统计。",
  tags: ["floating-label", "input", "svg", "validation", "focus"],
  status: "ready",
  featured: false,
  previewHeight: 320,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/label-input",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
