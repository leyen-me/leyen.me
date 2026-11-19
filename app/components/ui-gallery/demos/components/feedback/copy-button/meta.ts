import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Copy Button",
  summary: "带成功、失败与重试状态的复制按钮，定时器安全清理。",
  tags: ["clipboard", "feedback", "state", "a11y"],
  status: "ready",
  createdAt: "2026-11-19",
  source: { label: "Original", license: "MIT" },
  requires: ["lucide-react"],
} satisfies GalleryMeta;

export default meta;
