import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { projectSchema } from "@/lib/admin/content-models";
import { buildImageField, buildSlugField } from "@/lib/admin/sanity-helpers";
import { revalidateContentType } from "@/lib/admin/revalidate";
import { writeClient } from "@/lib/sanity.write";
import { adminProjectsQuery } from "@/lib/admin/queries";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return NextResponse.json(await writeClient.fetch(adminProjectsQuery));
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = parseBody(projectSchema, await req.json());
  if (parsed.error) return parsed.error;
  const data = parsed.data;
  const doc = await writeClient.create({
    _type: "project",
    name: data.name,
    slug: buildSlugField(data.slug),
    tagline: data.tagline,
    logo: buildImageField(data.logo),
    projectUrl: data.projectUrl || undefined,
    repository: data.repository || undefined,
    coverImage: buildImageField(data.coverImage),
    description: data.description ?? "",
    order: data.order ?? 0,
  });
  revalidateContentType("project");
  return NextResponse.json({ success: true, _id: doc._id });
}
