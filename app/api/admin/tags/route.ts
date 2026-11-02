import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { adminPostTagsQuery, adminQuoteTagsQuery } from "@/lib/admin/queries";
import { writeClient } from "@/lib/sanity.write";

/** Only these content types expose a shared tag vocabulary. */
const TAGS_BY_TYPE = {
  post: adminPostTagsQuery,
  quote: adminQuoteTagsQuery,
} as const;

type TagKind = keyof typeof TAGS_BY_TYPE;

function parseKind(value: string | null): TagKind | null {
  if (!value) return "post";
  return value in TAGS_BY_TYPE ? (value as TagKind) : null;
}

export async function GET(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const kind = parseKind(req.nextUrl.searchParams.get("type"));
  if (!kind) {
    return NextResponse.json({ error: "Unsupported tag type" }, { status: 400 });
  }

  try {
    const tags = await writeClient.fetch<string[] | null>(TAGS_BY_TYPE[kind]);
    const list = Array.isArray(tags) ? tags.filter(Boolean) : [];

    return NextResponse.json({
      tags: list.sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })),
    });
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}
