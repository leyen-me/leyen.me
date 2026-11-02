import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { adminPostTagsQuery } from "@/lib/admin/queries";
import { writeClient } from "@/lib/sanity.write";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const tags = await writeClient.fetch<string[] | null>(adminPostTagsQuery);
    const list = Array.isArray(tags) ? tags.filter(Boolean) : [];

    return NextResponse.json({
      tags: list.sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })),
    });
  } catch (error) {
    console.error("Failed to fetch post tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch post tags" },
      { status: 500 }
    );
  }
}
