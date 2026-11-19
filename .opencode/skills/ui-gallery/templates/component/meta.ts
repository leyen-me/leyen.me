import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Component Title",
  summary: "一句话说明它解决什么问题、用了什么技巧。",
  tags: ["example"],
  status: "wip",
  featured: false,
  createdAt: "YYYY-MM-DD",
  source: { label: "Original", license: "MIT" },
  requires: [],
} satisfies GalleryMeta;

export default meta;
