import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Upload Dropzone",
  summary:
    "虚线拖拽区在文件悬停时点亮、缩放并让虚线行进；拖入后原地展开文件名、尺寸、滚动百分比与进度条，可取消、重试或移除，超过 5 MB 会被晃动着拒绝。",
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
