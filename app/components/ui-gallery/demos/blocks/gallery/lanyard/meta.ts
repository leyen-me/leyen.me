import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Lanyard",
  summary: "可拖拽摆动的 3D 挂绳徽章，带真实重力与惯性。",
  tags: ["webgl", "motion", "mouse", "interaction"],
  status: "ready",
  previewHeight: 600,
  createdAt: "2026-11-20",
  source: {
    label: "React Bits",
    url: "https://www.reactbits.dev/components/lanyard",
    license: "MIT + Commons Clause (permission granted)",
  },
  requires: ["three"],
} satisfies GalleryMeta;

export default meta;
