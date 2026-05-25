import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { AiConfigError } from "@/lib/admin/ai/config";
import { AiRequestError } from "@/lib/admin/ai/client";
import { englishExplainInputSchema } from "@/lib/admin/content-models";
import {
  explainEnglishQuestion,
  generateLevelAdvice,
} from "@/lib/admin/ai/english/explain";

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const action = body?.action as string | undefined;

    if (action === "level_advice") {
      const advice = await generateLevelAdvice();
      return NextResponse.json({ advice });
    }

    const parsed = parseBody(englishExplainInputSchema, body);
    if (parsed.error) return parsed.error;

    const answer = await explainEnglishQuestion(parsed.data);
    return NextResponse.json({ answer });
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
    return NextResponse.json({ error: "Failed to get explanation" }, { status: 500 });
  }
}
