import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Assignees",
  summary:
    "多人指派选择器：胶囊里的渐变头像随选择逐格增宽，下拉卡按 48px 行距列出成员并显示勾选状态。",
  tags: ["multi-select", "listbox", "avatars", "keyboard"],
  status: "ready",
  featured: false,
  previewHeight: 420,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/picker",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
