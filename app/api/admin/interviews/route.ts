import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { interviewSchema } from "@/lib/admin/content-models";
import { buildSlugField } from "@/lib/admin/sanity-helpers";
import { revalidateContentType } from "@/lib/admin/revalidate";
import { writeClient } from "@/lib/sanity.write";
import { adminInterviewsQuery } from "@/lib/admin/queries";

function mapInterview(data: ReturnType<typeof interviewSchema.parse>) {
  return {
    _type: "interviewQuestion" as const,
    title: data.title,
    slug: buildSlugField(data.slug),
    category: data.category,
    answer: data.answer,
    isPublished: data.isPublished ?? true,
  };
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const items = await writeClient.fetch(adminInterviewsQuery);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = parseBody(interviewSchema, await req.json());
  if (parsed.error) return parsed.error;
  const doc = await writeClient.create(mapInterview(parsed.data));
  revalidateContentType("interviewQuestion");
  return NextResponse.json({ success: true, _id: doc._id });
}
