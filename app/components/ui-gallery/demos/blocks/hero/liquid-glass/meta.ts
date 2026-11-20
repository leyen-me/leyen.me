import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Liquid Glass",
  summary:
    "用 SVG 位移滤镜折射背景照片的液态玻璃镜片，带边缘色散、内侧高光，可拖拽移动。",
  tags: ["glass", "svg-filter", "interaction", "mouse"],
  status: "ready",
  previewHeight: 600,
  createdAt: "2026-11-20",
  source: {
    label: "Inspired by Aceternity",
    url: "https://ui.aceternity.com/components/liquid-glass",
    license: "See https://ui.aceternity.com/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
