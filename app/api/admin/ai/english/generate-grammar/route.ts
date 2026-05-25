import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { AiConfigError } from "@/lib/admin/ai/config";
import { AiRequestError } from "@/lib/admin/ai/client";
import { englishGenerateGrammarInputSchema } from "@/lib/admin/content-models";
import { generateGrammarExercises } from "@/lib/admin/ai/english/generate-grammar";

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const parsed = parseBody(englishGenerateGrammarInputSchema, await req.json());
    if (parsed.error) return parsed.error;

    const questions = await generateGrammarExercises(parsed.data);
    return NextResponse.json({ questions });
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
    return NextResponse.json({ error: "Failed to generate grammar" }, { status: 500 });
  }
}
