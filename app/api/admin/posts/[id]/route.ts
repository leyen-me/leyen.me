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
import { adminPostByIdQuery } from "@/lib/admin/queries";

type RouteContext = { params: { id: string } };

function mapPostPatch(data: ReturnType<typeof postSchema.parse>) {
  return {
    title: data.title,
    slug: buildSlugField(data.slug),
    description: data.description,
    canonicalLink: data.canonicalLink || undefined,
    date: data.date,
    coverImage: buildImageField(data.coverImage),
    featured: data.featured ?? false,
    tags: data.tags,
    author: buildReference(data.authorId),
    content: data.content ?? "",
    isPublished: data.isPublished ?? false,
  };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const post = await writeClient.fetch(adminPostByIdQuery, { id: params.id });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const parsed = parseBody(postSchema, body);
    if (parsed.error) return parsed.error;

    await writeClient.patch(params.id).set(mapPostPatch(parsed.data)).commit();
    revalidateContentType("Post");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update post:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    await writeClient.delete(params.id);
    revalidateContentType("Post");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
