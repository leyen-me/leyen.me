import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Particles",
  summary:
    "720 个点按形状采样落位，指针把它们推开、弹簧再拉回；按压先发出冲击波，再按中心角度重排成下一个形状。",
  tags: ["canvas", "hover", "particles", "spring", "pointer"],
  status: "ready",
  featured: false,
  previewHeight: 540,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/particles",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
