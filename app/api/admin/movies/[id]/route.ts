import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { movieSchema } from "@/lib/admin/content-models";
import { buildImageField, buildSlugField } from "@/lib/admin/sanity-helpers";
import { revalidateContentType } from "@/lib/admin/revalidate";
import { writeClient } from "@/lib/sanity.write";
import { adminMovieByIdQuery } from "@/lib/admin/queries";

type RouteContext = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const item = await writeClient.fetch(adminMovieByIdQuery, { id: params.id });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = parseBody(movieSchema, await req.json());
  if (parsed.error) return parsed.error;
  const data = parsed.data;
  await writeClient
    .patch(params.id)
    .set({
      title: data.title,
      slug: buildSlugField(data.slug),
      mediaType: data.mediaType,
      coverImage: buildImageField(data.coverImage),
      rating: data.rating ?? undefined,
      releaseDate: data.releaseDate,
      director: data.director,
      cast: data.cast,
      description: data.description,
      externalUrl: data.externalUrl || undefined,
    })
    .commit();
  revalidateContentType("movie");
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  await writeClient.delete(params.id);
  revalidateContentType("movie");
  return NextResponse.json({ success: true });
}
