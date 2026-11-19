import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Eye Tracker",
  summary:
    "一颗长着两只眼睛的软立方体：眼睛沿球面投影跟随指针，定时眨眼，按下后逐字说出短句。",
  tags: ["hover", "pointer", "eyes", "svg", "motion"],
  status: "ready",
  featured: false,
  previewHeight: 320,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/eye-tracker",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
