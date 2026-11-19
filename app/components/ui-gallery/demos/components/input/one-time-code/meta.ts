import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "One-time Code",
  summary:
    "单个隐形输入承载 4 或 6 位验证码，光标逐格弹性滑动；填满后正确则细胞融合成 Verified 胶囊，错误则整行抖动并自右向左坠落。",
  tags: ["otp", "verification", "spring", "paste", "a11y"],
  status: "ready",
  featured: false,
  previewHeight: 300,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/one-time-code",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
