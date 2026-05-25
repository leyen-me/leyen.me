import { z } from "zod";
import { createChatCompletion } from "@/lib/admin/ai/client";
import { getAiModel } from "@/lib/admin/ai/config";
import { parseJsonResponse, previewText } from "@/lib/admin/ai/parse-json";
import {
  buildLevelContext,
  ENRICH_WORD_SYSTEM_PROMPT,
} from "@/lib/admin/ai/english/prompts";
import type { EnglishWordDoc } from "@/lib/admin/english/daily-flow";
import { adminEnglishWordByIdQuery } from "@/lib/admin/english/queries";
import { adminEnglishSettingsQuery } from "@/lib/admin/english/queries";
import { isWordEnriched } from "@/lib/admin/english/word-utils";
import { writeClient } from "@/lib/sanity.write";

const phraseSchema = z.object({
  phrase: z.string(),
  meaningZh: z.string(),
});

const exampleSchema = z.object({
  sentence: z.string(),
  source: z.enum(["ielts", "toefl", "movie", "general"]),
  translationZh: z.string(),
});

const derivationSchema = z.object({
  word: z.string(),
  partOfSpeech: z.string(),
  meaningZh: z.string(),
});

const enrichedWordSchema = z.object({
  word: z.string(),
  phonetic: z.string(),
  partOfSpeech: z.string(),
  meaningZh: z.string(),
  phrases: z.array(phraseSchema).min(1),
  examples: z.array(exampleSchema).min(1),
  derivations: z.array(derivationSchema),
});

async function fetchWord(wordId: string): Promise<EnglishWordDoc | null> {
  return writeClient.fetch<EnglishWordDoc | null>(adminEnglishWordByIdQuery, {
    id: wordId,
  });
}

async function patchWordEnrichment(
  wordId: string,
  enriched: z.infer<typeof enrichedWordSchema>
): Promise<EnglishWordDoc> {
  await writeClient
    .patch(wordId)
    .set({
      phonetic: enriched.phonetic,
      partOfSpeech: enriched.partOfSpeech,
      meaningZh: enriched.meaningZh,
      phrases: enriched.phrases,
      examples: enriched.examples,
      derivations: enriched.derivations,
    })
    .commit();

  const updated = await fetchWord(wordId);
  if (!updated) throw new Error("单词保存失败");
  return updated;
}

/** 逐词 enrich，已缓存则直接返回 */
export async function enrichWord(wordId: string): Promise<EnglishWordDoc> {
  const wordDoc = await fetchWord(wordId);
  if (!wordDoc) throw new Error("单词不存在");

  if (isWordEnriched(wordDoc)) {
    return wordDoc;
  }

  const settings = await writeClient.fetch<{
    currentLevel: string;
    targetExam: string;
  } | null>(adminEnglishSettingsQuery);

  const level = settings?.currentLevel ?? wordDoc.level ?? "A1";
  const targetExam = settings?.targetExam ?? "none";

  const raw = await createChatCompletion({
    model: getAiModel(),
    temperature: 0.3,
    max_tokens: 1536,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: ENRICH_WORD_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          buildLevelContext(level, targetExam),
          `请为单词「${wordDoc.word}」生成详解。`,
        ].join("\n"),
      },
    ],
  });

  let parsedJson: unknown;
  try {
    parsedJson = parseJsonResponse(raw);
  } catch (error) {
    console.error("[ai/english/enrich-word] Invalid JSON", {
      wordId,
      word: wordDoc.word,
      raw: previewText(raw, 500),
      error,
    });
    throw new Error("AI 返回格式异常，请重试");
  }

  const parsed = enrichedWordSchema.safeParse(parsedJson);
  if (!parsed.success) {
    console.error("[ai/english/enrich-word] Schema mismatch", {
      wordId,
      word: wordDoc.word,
      error: parsed.error,
    });
    throw new Error("AI 返回的单词详解不完整，请重试");
  }

  return patchWordEnrichment(wordId, parsed.data);
}

/** 按顺序逐词 enrich（避免单次 token 过大） */
export async function enrichWords(wordIds: string[]): Promise<EnglishWordDoc[]> {
  const results: EnglishWordDoc[] = [];
  for (const wordId of wordIds) {
    results.push(await enrichWord(wordId));
  }
  return results;
}
