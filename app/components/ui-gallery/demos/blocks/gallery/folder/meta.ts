import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Folder",
  summary:
    "可拖拽的文件夹：翻开后抽出页面、自由摆放；纯浏览器 API 实现，无额外依赖。",
  tags: ["interaction", "motion", "mouse", "drag"],
  status: "ready",
  previewHeight: 600,
  createdAt: "2026-11-20",
  source: {
    label: "React Bits",
    url: "https://www.reactbits.dev/components/folder",
    license: "MIT + Commons Clause (permission granted)",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
