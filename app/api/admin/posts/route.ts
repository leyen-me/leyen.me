import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { postSchema } from "@/lib/admin/content-models";
import {
  buildImageField,
  buildReference,
  buildSlugField,
} from "@/lib/admin/sanity-helpers";
import { revalidateContentType } from "@/lib/admin/revalidate";
import { writeClient } from "@/lib/sanity.write";
import { adminPostsQuery } from "@/lib/admin/queries";

function mapPostToDocument(data: ReturnType<typeof postSchema.parse>) {
  return {
    _type: "Post" as const,
    title: data.title,
    slug: buildSlugField(data.slug),
    description: data.description,
    canonicalLink: data.canonicalLink || undefined,
    date: data.date || new Date().toISOString(),
    coverImage: buildImageField(data.coverImage),
    featured: data.featured ?? false,
    tags: data.tags,
    author: buildReference(data.authorId),
    content: data.content ?? "",
    isPublished: data.isPublished ?? false,
  };
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const posts = await writeClient.fetch(adminPostsQuery);
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const parsed = parseBody(postSchema, body);
    if (parsed.error) return parsed.error;

    const doc = await writeClient.create(mapPostToDocument(parsed.data));
    revalidateContentType("Post");
    return NextResponse.json({ success: true, _id: doc._id });
  } catch (error) {
    console.error("Failed to create post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
