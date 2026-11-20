import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Preview Slider",
  summary:
    "分档预览滑块：拖动时当前档位的图片从轨道中浮出，经 gooey 滤镜与轨道融合，填充带弹性跟随与倾斜。",
  tags: ["interaction", "drag", "image", "motion"],
  status: "ready",
  featured: false,
  previewHeight: 320,
  createdAt: "2026-11-20",
  source: {
    label: "Inspired by Aceternity",
    url: "https://ui.aceternity.com/interactions/preview-slider",
    license: "See https://ui.aceternity.com/licence",
  },
  requires: ["framer-motion"],
} satisfies GalleryMeta;

export default meta;
