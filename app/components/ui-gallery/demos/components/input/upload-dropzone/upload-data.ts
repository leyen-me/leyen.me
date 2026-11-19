/*
 * Bencho's "Upload dropzone" defaults, unchanged: a 5 MB cap, speed 50,
 * bounce 40, corner 20, and the two tray sheets with their sizes and tints.
 */
export const MAX_MB = 5;
export const MAX_BYTES = MAX_MB * 1_000_000;
export const SPEED = 50;
export const BOUNCE = 40;
export const CORNER = 20;
export const DIGITS = "0123456789".split("");
export const SAMPLE_MIME = "application/x-upload-dropzone-sample";

/** The block's retort cycle after the first refusal. */
export const REFUSALS = [
  "Still 12.6 MB. It didn't shrink.",
  "Pushing harder won't help",
  "Have you tried compressing it?",
  "The box is full of excuses now",
  "No.",
];

export type UploadFile = {
  id: string;
  name: string;
  size: number;
  ext: string;
  tint: string;
};

export const SAMPLES: readonly UploadFile[] = [
  {
    id: "sample-mood",
    name: "mood.png",
    size: 2_400_000,
    ext: "PNG",
    tint: "#079455",
  },
  {
    id: "sample-demo",
    name: "demo.mp4",
    size: 12_600_000,
    ext: "MP4",
    tint: "#155EEF",
  },
];

const TINTS: Record<string, string> = {
  PNG: "#079455",
  JPG: "#079455",
  JPEG: "#079455",
  GIF: "#079455",
  WEBP: "#079455",
  SVG: "#079455",
  MP4: "#155EEF",
  MOV: "#155EEF",
  WEBM: "#155EEF",
  MP3: "#9A5BFF",
  WAV: "#9A5BFF",
  PDF: "#E5484D",
  ZIP: "#B54708",
  RAR: "#B54708",
};

/** Source format: one decimal above 1 MB, whole KB below. */
export function formatSize(bytes: number) {
  return bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.round(bytes / 1_000)} KB`;
}

export function describeFile(name: string, size: number, id: string) {
  const extension = name.includes(".") ? (name.split(".").pop() ?? "") : "";
  const ext =
    extension
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, 4)
      .toUpperCase() || "FILE";

  return { id, name, size, ext, tint: TINTS[ext] ?? "#52525B" };
}
