import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { interviewSchema } from "@/lib/admin/content-models";
import { buildSlugField } from "@/lib/admin/sanity-helpers";
import { revalidateContentType } from "@/lib/admin/revalidate";
import { writeClient } from "@/lib/sanity.write";
import { adminInterviewByIdQuery } from "@/lib/admin/queries";

type RouteContext = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const item = await writeClient.fetch(adminInterviewByIdQuery, { id: params.id });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = parseBody(interviewSchema, await req.json());
  if (parsed.error) return parsed.error;
  const data = parsed.data;
  await writeClient
    .patch(params.id)
    .set({
      title: data.title,
      slug: buildSlugField(data.slug),
      category: data.category,
      answer: data.answer,
      isPublished: data.isPublished ?? true,
    })
    .commit();
  revalidateContentType("interviewQuestion");
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  await writeClient.delete(params.id);
  revalidateContentType("interviewQuestion");
  return NextResponse.json({ success: true });
}
