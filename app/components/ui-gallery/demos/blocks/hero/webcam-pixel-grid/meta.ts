import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Webcam Pixel Grid",
  summary: "摄像头画面实时像素化，指针可扰动像素网格；全程本地处理。",
  tags: ["webcam", "canvas", "mouse", "interaction"],
  status: "ready",
  previewHeight: 600,
  createdAt: "2026-11-20",
  source: {
    label: "Inspired by Aceternity",
    url: "https://ui.aceternity.com/components/webcam-pixel-grid",
    license: "See https://ui.aceternity.com/licence",
  },
  requires: ["lucide-react"],
} satisfies GalleryMeta;

export default meta;
