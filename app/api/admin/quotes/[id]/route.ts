import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { quoteSchema } from "@/lib/admin/content-models";
import { revalidateContentType } from "@/lib/admin/revalidate";
import { writeClient } from "@/lib/sanity.write";
import { adminQuoteByIdQuery } from "@/lib/admin/queries";

type RouteContext = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const item = await writeClient.fetch(adminQuoteByIdQuery, { id: params.id });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = parseBody(quoteSchema, await req.json());
  if (parsed.error) return parsed.error;
  const data = parsed.data;
  await writeClient
    .patch(params.id)
    .set({
      contentType: data.contentType,
      quote: data.quote,
      author: data.author,
      context: data.context,
      tags: data.tags,
    })
    .commit();
  revalidateContentType("quote");
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  await writeClient.delete(params.id);
  revalidateContentType("quote");
  return NextResponse.json({ success: true });
}
