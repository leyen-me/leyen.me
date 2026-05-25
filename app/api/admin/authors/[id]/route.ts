import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { authorSchema } from "@/lib/admin/content-models";
import { buildImageField } from "@/lib/admin/sanity-helpers";
import { revalidateContentType } from "@/lib/admin/revalidate";
import { writeClient } from "@/lib/sanity.write";
import { adminAuthorByIdQuery } from "@/lib/admin/queries";

type RouteContext = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const item = await writeClient.fetch(adminAuthorByIdQuery, { id: params.id });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = parseBody(authorSchema, await req.json());
  if (parsed.error) return parsed.error;
  const data = parsed.data;
  await writeClient
    .patch(params.id)
    .set({
      name: data.name,
      photo: buildImageField(data.photo),
      twitterUrl: data.twitterUrl,
    })
    .commit();
  revalidateContentType("author");
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  await writeClient.delete(params.id);
  revalidateContentType("author");
  return NextResponse.json({ success: true });
}
