import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Image Compare",
  summary:
    "可拖拽的前后对比滑块：分割点平滑跟随指针，分割线两端由弹簧驱动而轻微滞后，甩动后自动滑向边缘。",
  tags: ["drag", "comparison", "slider", "spring"],
  status: "ready",
  featured: false,
  previewHeight: 460,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/image-compare",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
