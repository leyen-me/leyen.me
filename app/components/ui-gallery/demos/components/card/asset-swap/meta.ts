import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Asset Swap",
  summary:
    "双层资产卡片：按箭头反转支付方向，点选硬币把卡片展开成整块选择面板，两侧金额按 0.3% 价差即时重算。",
  tags: ["press", "swap", "finance", "motion", "sound"],
  status: "ready",
  featured: false,
  previewHeight: 360,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/asset-swap",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
