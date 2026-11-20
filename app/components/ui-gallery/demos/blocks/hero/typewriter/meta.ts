import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Typewriter",
  summary:
    "桌面上的可拖动纸卡与打字机控制台，键入内容后打印成纸张。",
  tags: ["typewriter", "text", "interaction", "motion"],
  status: "ready",
  previewHeight: 600,
  createdAt: "2026-11-20",
  source: { label: "Original", license: "MIT" },
  requires: ["lucide-react"],
} satisfies GalleryMeta;

export default meta;
