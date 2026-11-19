import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: "Voice Note",
  summary:
    "按住胶囊开始录音，计时与波形每 70ms 生长，松开保留、左滑丢弃；播放时同一段波形按一个 CSS 变量点亮进度。",
  tags: ["voice", "press", "waveform", "timer", "sound"],
  status: "ready",
  featured: false,
  previewHeight: 240,
  createdAt: "2026-11-19",
  source: {
    label: "Inspired by Bencho",
    url: "https://bencho.dev/blocks/voice-note",
    license: "See https://bencho.dev/licence",
  },
  requires: [],
} satisfies GalleryMeta;

export default meta;
