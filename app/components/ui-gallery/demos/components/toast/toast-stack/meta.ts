import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Toast Stack",
  summary:
    "三条通知叠成一摞，悬停或聚焦时以弹簧展开为列表；逐条关闭后新通知从上方弹入顶部，失败项可原地重试。",
  tags: ["toast", "spring", "hover", "notification"],
  status: "ready",
  featured: false,
  previewHeight: 280,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/toast-stack",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
