import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { writeClient } from "@/lib/sanity.write";

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const kind = (formData.get("kind") as string) || "image";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await writeClient.assets.upload(
      kind === "file" ? "file" : "image",
      buffer,
      { filename: file.name }
    );

    return NextResponse.json({
      assetId: asset._id,
      url: asset.url,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
