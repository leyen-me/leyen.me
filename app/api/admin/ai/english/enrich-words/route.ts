import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { AiConfigError } from "@/lib/admin/ai/config";
import { AiRequestError } from "@/lib/admin/ai/client";
import { englishEnrichWordsInputSchema } from "@/lib/admin/content-models";
import { enrichWord, enrichWords } from "@/lib/admin/ai/english/enrich-words";

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const parsed = parseBody(englishEnrichWordsInputSchema, await req.json());
    if (parsed.error) return parsed.error;

    if (parsed.data.wordId) {
      const word = await enrichWord(parsed.data.wordId);
      return NextResponse.json({ word });
    }

    const words = await enrichWords(parsed.data.wordIds ?? []);
    return NextResponse.json({ words });
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
    return NextResponse.json({ error: "Failed to enrich words" }, { status: 500 });
  }
}
