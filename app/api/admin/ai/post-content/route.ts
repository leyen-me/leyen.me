import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { AiConfigError } from "@/lib/admin/ai/config";
import { AiRequestError } from "@/lib/admin/ai/client";
import {
  generatePostContent,
  postContentInputSchema,
} from "@/lib/admin/ai/post-content";

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const parsed = parseBody(postContentInputSchema, body);
    if (parsed.error) return parsed.error;

    const text = await generatePostContent(parsed.data);
    return NextResponse.json({ text });
  } catch (error) {
    if (error instanceof AiConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    if (error instanceof AiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof Error) {
      console.error("[api/admin/ai/post-content]", error.message, error);
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    console.error("Failed to generate post content:", error);
    return NextResponse.json(
      { error: "Failed to generate post content" },
      { status: 500 }
    );
  }
}
