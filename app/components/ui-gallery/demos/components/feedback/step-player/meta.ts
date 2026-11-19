import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Step Player",
  summary:
    "播放后进度沿圆点逐格填充，换步时两端边沿缓出，身后一串 scaleY 余波依次起伏。",
  tags: ["progress", "steps", "easing", "playback", "motion"],
  status: "ready",
  featured: false,
  previewHeight: 320,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/step-player",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
