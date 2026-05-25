import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { movieSchema } from "@/lib/admin/content-models";
import { buildImageField, buildSlugField } from "@/lib/admin/sanity-helpers";
import { revalidateContentType } from "@/lib/admin/revalidate";
import { writeClient } from "@/lib/sanity.write";
import { adminMoviesQuery } from "@/lib/admin/queries";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return NextResponse.json(await writeClient.fetch(adminMoviesQuery));
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = parseBody(movieSchema, await req.json());
  if (parsed.error) return parsed.error;
  const data = parsed.data;
  const doc = await writeClient.create({
    _type: "movie",
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
  });
  revalidateContentType("movie");
  return NextResponse.json({ success: true, _id: doc._id });
}
