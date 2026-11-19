import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Slide to Confirm",
  summary:
    "拖动滑块横穿轨道，填充随手柄生长、提示随之淡出；越过终点后手柄原地展开并自动复位。",
  tags: ["drag", "slider", "confirmation", "spring", "a11y"],
  status: "ready",
  featured: false,
  previewHeight: 240,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/slide-confirm",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
