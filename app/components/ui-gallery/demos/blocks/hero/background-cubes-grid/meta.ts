import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Cubes Grid",
  summary: "立体方块阵列随指针涌动、点击扩散涟漪的 WebGL 背景效果。",
  tags: ["webgl", "motion", "mouse", "background"],
  status: "ready",
  previewHeight: 600,
  createdAt: "2026-11-20",
  source: {
    label: "Inspired by Aceternity",
    url: "https://ui.aceternity.com/components/background-cubes-grid",
    license: "See https://ui.aceternity.com/licence",
  },
  requires: ["three"],
} satisfies GalleryMeta;

export default meta;
