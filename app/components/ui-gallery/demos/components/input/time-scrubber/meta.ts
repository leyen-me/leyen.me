import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Time Scrubber",
  summary:
    "可拖拽的分钟标尺：刻度随位置起伏淡出，松手后按甩动速度预测落点并弹到最近的 15 分钟，中央红线指示当前时间。",
  tags: ["drag", "slider", "time", "inertia", "a11y"],
  status: "ready",
  featured: false,
  previewHeight: 260,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/time-scrubber",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
