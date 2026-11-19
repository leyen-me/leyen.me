import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Block Title",
  summary: "一句话说明这个区块适合放在页面的什么位置。",
  tags: ["example"],
  status: "wip",
  featured: false,
  createdAt: "YYYY-MM-DD",
  source: { label: "Original", license: "MIT" },
  requires: [],
} satisfies GalleryMeta;

export default meta;
