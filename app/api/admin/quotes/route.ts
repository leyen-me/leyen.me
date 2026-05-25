import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { quoteSchema } from "@/lib/admin/content-models";
import { revalidateContentType } from "@/lib/admin/revalidate";
import { writeClient } from "@/lib/sanity.write";
import { adminQuotesQuery } from "@/lib/admin/queries";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return NextResponse.json(await writeClient.fetch(adminQuotesQuery));
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = parseBody(quoteSchema, await req.json());
  if (parsed.error) return parsed.error;
  const data = parsed.data;
  const doc = await writeClient.create({
    _type: "quote",
    contentType: data.contentType,
    quote: data.quote,
    author: data.author,
    context: data.context,
    tags: data.tags,
  });
  revalidateContentType("quote");
  return NextResponse.json({ success: true, _id: doc._id });
}
