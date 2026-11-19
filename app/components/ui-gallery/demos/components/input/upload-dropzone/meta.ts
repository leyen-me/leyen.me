import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Upload Dropzone",
  summary:
    "拖入文件后白卡收缩成文件行，滚动百分比推进，完成后显示勾选并在 1.5 秒后回到拖拽状态；超过 5 MB 会被晃动着拒绝。",
  tags: ["upload", "drag", "progress", "file-input", "a11y"],
  status: "ready",
  featured: false,
  previewHeight: 360,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/upload-dropzone",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
