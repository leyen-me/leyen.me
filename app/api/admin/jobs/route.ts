import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { jobSchema } from "@/lib/admin/content-models";
import { buildImageField } from "@/lib/admin/sanity-helpers";
import { revalidateContentType } from "@/lib/admin/revalidate";
import { writeClient } from "@/lib/sanity.write";
import { adminJobsQuery } from "@/lib/admin/queries";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return NextResponse.json(await writeClient.fetch(adminJobsQuery));
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = parseBody(jobSchema, await req.json());
  if (parsed.error) return parsed.error;
  const data = parsed.data;
  const doc = await writeClient.create({
    _type: "job",
    name: data.name,
    jobTitle: data.jobTitle,
    logo: buildImageField(data.logo),
    url: data.url || undefined,
    description: data.description,
    startDate: data.startDate,
    endDate: data.endDate,
  });
  revalidateContentType("job");
  return NextResponse.json({ success: true, _id: doc._id });
}
