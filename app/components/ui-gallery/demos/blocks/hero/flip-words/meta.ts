import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Flip Words",
  summary: "按节奏逐字翻转的标题词，保留原文案与字符级模糊入场。",
  tags: ["text", "motion", "hero", "typography"],
  status: "ready",
  previewHeight: 600,
  createdAt: "2026-11-20",
  source: {
    label: "Inspired by Aceternity",
    url: "https://ui.aceternity.com/components/flip-words",
    license: "See https://ui.aceternity.com/licence",
  },
  requires: ["framer-motion"],
} satisfies GalleryMeta;

export default meta;
