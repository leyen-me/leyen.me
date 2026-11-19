import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Card Swap",
  summary: "三维透视的卡片堆叠：点按或甩动顶卡即送到队尾，其余卡片沿固定槽位弹入前排。",
  tags: ["drag", "stack", "perspective", "motion"],
  status: "ready",
  featured: false,
  previewHeight: 460,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/card-swap",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
