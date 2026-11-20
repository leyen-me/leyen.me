import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Swarm Cursor",
  summary:
    "WebGL 流体粒子跟随指针，绕过按钮时自动分流，点击向外炸开；纯浏览器 API，无额外依赖。",
  tags: ["animation", "hover", "mouse", "webgl"],
  status: "ready",
  previewHeight: 600,
  createdAt: "2026-11-20",
  source: {
    label: "React Bits",
    url: "https://www.reactbits.dev/animations/swarm-cursor",
    license: "MIT + Commons Clause (permission granted)",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
