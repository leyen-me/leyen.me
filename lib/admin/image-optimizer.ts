import "server-only";
import sharp from "sharp";

/**
 * Covers are generated as WebP with the long edge capped at 2400px: enough for
 * a 2x retina hero on a 1200px column, while keeping Unsplash-sized sources
 * (often 6000px / 10-20MB) from bloating the CMS and page payloads.
 */
export const IMAGE_MAX_DIMENSION = 2400;
export const IMAGE_WEBP_QUALITY = 82;
export const IMAGE_MAX_INPUT_BYTES = 25 * 1024 * 1024;

/**
 * Already-light assets skip re-encoding: another lossy pass on a 200KB JPEG
 * only loses quality.
 */
const PASSTHROUGH_MAX_BYTES = 400 * 1024;
const RECOMPRESSIBLE_FORMATS = new Set([
  "jpeg",
  "jpg",
  "png",
  "webp",
  "avif",
  "tiff",
  "heic",
  "heif",
]);
const PRESERVED_FORMATS = new Set(["gif", "svg"]);

export type OptimizedImage = {
  buffer: Buffer;
  filename: string;
  contentType: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  originalBytes: number;
  originalWidth?: number;
  originalHeight?: number;
  /** False when the original bytes were kept as-is. */
  optimized: boolean;
};

export class ImageOptimizationError extends Error {
  status: number;

  constructor(message: string, status = 415) {
    super(message);
    this.name = "ImageOptimizationError";
    this.status = status;
  }
}

function baseName(filename: string): string {
  const withoutPath = filename.split(/[\\/]/).pop() ?? "image";
  const withoutExt = withoutPath.replace(/\.[^.]+$/, "");
  const safe = withoutExt.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").slice(0, 60);
  return safe || "image";
}

function isSvg(buffer: Buffer): boolean {
  const head = buffer.subarray(0, 512).toString("utf8").trimStart().toLowerCase();
  return head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"));
}

export async function optimizeImage(input: {
  buffer: Buffer;
  filename: string;
  contentType?: string;
}): Promise<OptimizedImage> {
  const { buffer } = input;

  if (buffer.byteLength === 0) {
    throw new ImageOptimizationError("图片内容为空", 400);
  }

  if (buffer.byteLength > IMAGE_MAX_INPUT_BYTES) {
    throw new ImageOptimizationError(
      `图片超过 ${Math.round(IMAGE_MAX_INPUT_BYTES / 1024 / 1024)}MB 上限`,
      413
    );
  }

  const name = baseName(input.filename);

  if (isSvg(buffer)) {
    // Vector art must not be rasterised; it is also tiny by nature.
    return {
      buffer,
      filename: `${name}.svg`,
      contentType: "image/svg+xml",
      format: "svg",
      bytes: buffer.byteLength,
      originalBytes: buffer.byteLength,
      optimized: false,
    };
  }

  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(buffer).metadata();
  } catch {
    throw new ImageOptimizationError("无法识别的图片格式", 415);
  }

  const format = (metadata.format ?? "").toLowerCase();
  const originalWidth = metadata.width;
  const originalHeight = metadata.height;
  const base = {
    originalBytes: buffer.byteLength,
    originalWidth,
    originalHeight,
  };

  if (PRESERVED_FORMATS.has(format)) {
    // Animated GIFs lose their animation when re-encoded, so keep them whole.
    return {
      ...base,
      buffer,
      filename: `${name}.${format}`,
      contentType: format === "gif" ? "image/gif" : "image/svg+xml",
      format,
      width: originalWidth,
      height: originalHeight,
      bytes: buffer.byteLength,
      optimized: false,
    };
  }

  if (!RECOMPRESSIBLE_FORMATS.has(format)) {
    throw new ImageOptimizationError(`暂不支持 ${format || "该"} 格式`, 415);
  }

  const withinBudget =
    buffer.byteLength <= PASSTHROUGH_MAX_BYTES &&
    (originalWidth ?? 0) <= IMAGE_MAX_DIMENSION &&
    (originalHeight ?? 0) <= IMAGE_MAX_DIMENSION;

  if (withinBudget) {
    const contentType = format === "jpg" ? "image/jpeg" : `image/${format}`;
    return {
      ...base,
      buffer,
      filename: `${name}.${format}`,
      contentType,
      format,
      width: originalWidth,
      height: originalHeight,
      bytes: buffer.byteLength,
      optimized: false,
    };
  }

  const output = await sharp(buffer)
    .rotate() // honour EXIF orientation before stripping metadata
    .resize({
      width: IMAGE_MAX_DIMENSION,
      height: IMAGE_MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: IMAGE_WEBP_QUALITY, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  return {
    ...base,
    buffer: output.data,
    filename: `${name}.webp`,
    contentType: "image/webp",
    format: "webp",
    width: output.info.width,
    height: output.info.height,
    bytes: output.info.size,
    optimized: true,
  };
}
