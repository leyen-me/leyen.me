import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { AiConfigError } from "@/lib/admin/ai/config";
import { AiRequestError } from "@/lib/admin/ai/client";
import {
  generatePostSlug,
  postSlugInputSchema,
} from "@/lib/admin/ai/post-slug";

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const parsed = parseBody(postSlugInputSchema, body);
    if (parsed.error) return parsed.error;

    const slug = await generatePostSlug(parsed.data);
    return NextResponse.json({ slug });
  } catch (error) {
    if (error instanceof AiConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    if (error instanceof AiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    console.error("Failed to generate post slug:", error);
    return NextResponse.json(
      { error: "Failed to generate post slug" },
      { status: 500 }
    );
  }
}
