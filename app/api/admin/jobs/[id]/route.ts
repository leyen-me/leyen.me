import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { jobSchema } from "@/lib/admin/content-models";
import { buildImageField } from "@/lib/admin/sanity-helpers";
import { revalidateContentType } from "@/lib/admin/revalidate";
import { writeClient } from "@/lib/sanity.write";
import { adminJobByIdQuery } from "@/lib/admin/queries";

type RouteContext = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const item = await writeClient.fetch(adminJobByIdQuery, { id: params.id });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = parseBody(jobSchema, await req.json());
  if (parsed.error) return parsed.error;
  const data = parsed.data;
  await writeClient
    .patch(params.id)
    .set({
      name: data.name,
      jobTitle: data.jobTitle,
      logo: buildImageField(data.logo),
      url: data.url || undefined,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
    })
    .commit();
  revalidateContentType("job");
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  await writeClient.delete(params.id);
  revalidateContentType("job");
  return NextResponse.json({ success: true });
}
