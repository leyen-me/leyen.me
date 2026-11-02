import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth-guard";
import {
  ImageOptimizationError,
  optimizeImage,
} from "@/lib/admin/image-optimizer";
import { RemoteImageError, downloadRemoteImage } from "@/lib/admin/remote-image";
import { writeClient } from "@/lib/sanity.write";

const remoteImageSchema = z.object({
  url: z.string().trim().min(1, "缺少图片链接"),
});

type IncomingImage = {
  buffer: Buffer;
  filename: string;
  contentType: string;
  /** "file" bypasses image optimisation (raw PDFs and similar). */
  kind: "image" | "file";
};

async function readImage(req: NextRequest): Promise<IncomingImage | NextResponse> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => null);
    const parsed = remoteImageSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "参数不正确";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const remote = await downloadRemoteImage(parsed.data.url);
    return {
      buffer: remote.buffer,
      filename: remote.filename,
      contentType: remote.contentType,
      kind: "image",
    };
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const kind = (formData.get("kind") as string) || "image";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "缺少上传文件" }, { status: 400 });
  }

  if (kind === "file") {
    return {
      buffer: Buffer.from(await file.arrayBuffer()),
      filename: file.name || "file",
      contentType: file.type || "application/octet-stream",
      kind: "file",
    };
  }

  if (file.type && !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "只支持图片文件" }, { status: 415 });
  }

  return {
    buffer: Buffer.from(await file.arrayBuffer()),
    filename: file.name || "image",
    contentType: file.type || "application/octet-stream",
    kind: "image",
  };
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const incoming = await readImage(req);
    if (incoming instanceof NextResponse) return incoming;

    if (incoming.kind === "file") {
      const asset = await writeClient.assets.upload("file", incoming.buffer, {
        filename: incoming.filename,
        contentType: incoming.contentType,
      });
      return NextResponse.json({ assetId: asset._id, url: asset.url, optimized: false });
    }

    const optimized = await optimizeImage(incoming);

    const asset = await writeClient.assets.upload("image", optimized.buffer, {
      filename: optimized.filename,
      contentType: optimized.contentType,
    });

    return NextResponse.json({
      assetId: asset._id,
      url: asset.url,
      width: optimized.width,
      height: optimized.height,
      format: optimized.format,
      bytes: optimized.bytes,
      originalBytes: optimized.originalBytes,
      originalWidth: optimized.originalWidth,
      originalHeight: optimized.originalHeight,
      optimized: optimized.optimized,
    });
  } catch (error) {
    if (error instanceof ImageOptimizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof RemoteImageError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Upload failed:", error);
    return NextResponse.json({ error: "上传失败，请重试" }, { status: 500 });
  }
}
