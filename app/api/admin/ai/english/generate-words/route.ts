import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { AiConfigError } from "@/lib/admin/ai/config";
import { AiRequestError } from "@/lib/admin/ai/client";
import { englishGenerateWordsInputSchema } from "@/lib/admin/content-models";
import { generateDailyWords } from "@/lib/admin/ai/english/generate-words";

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = parseBody(englishGenerateWordsInputSchema, body);
    if (parsed.error) return parsed.error;

    const generated = await generateDailyWords(parsed.data.batchDate);

    return NextResponse.json({
      wordIds: generated.wordIds,
      words: generated.words,
    });
  } catch (error) {
    if (error instanceof AiConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof AiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error) {
      console.error("[api/admin/ai/english/generate-words]", error.message);
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Failed to generate words" }, { status: 500 });
  }
}
