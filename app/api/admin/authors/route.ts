import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { authorSchema } from "@/lib/admin/content-models";
import { buildImageField } from "@/lib/admin/sanity-helpers";
import { revalidateContentType } from "@/lib/admin/revalidate";
import { writeClient } from "@/lib/sanity.write";
import { adminAuthorsQuery } from "@/lib/admin/queries";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return NextResponse.json(await writeClient.fetch(adminAuthorsQuery));
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = parseBody(authorSchema, await req.json());
  if (parsed.error) return parsed.error;
  const data = parsed.data;
  const doc = await writeClient.create({
    _type: "author",
    name: data.name,
    photo: buildImageField(data.photo),
    twitterUrl: data.twitterUrl,
  });
  revalidateContentType("author");
  return NextResponse.json({ success: true, _id: doc._id });
}
