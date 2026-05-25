import { createChatCompletion } from "@/lib/admin/ai/client";
import { getAiStructuredModel } from "@/lib/admin/ai/config";
import { parseJsonResponse, previewText } from "@/lib/admin/ai/parse-json";
import {
  buildLevelContext,
  ENRICH_WORD_SYSTEM_PROMPT,
} from "@/lib/admin/ai/english/prompts";
import { normalizeEnrichedWord } from "@/lib/admin/ai/english/normalize";
import type { EnglishWordDoc } from "@/lib/admin/english/daily-flow";
import { adminEnglishWordByIdQuery } from "@/lib/admin/english/queries";
import { adminEnglishSettingsQuery } from "@/lib/admin/english/queries";
import { isWordEnriched } from "@/lib/admin/english/word-utils";
import { writeClient } from "@/lib/sanity.write";

async function fetchWord(wordId: string): Promise<EnglishWordDoc | null> {
  return writeClient.fetch<EnglishWordDoc | null>(adminEnglishWordByIdQuery, {
    id: wordId,
  });
}

async function patchWordEnrichment(
  wordId: string,
  enriched: NonNullable<ReturnType<typeof normalizeEnrichedWord>>
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
    model: getAiStructuredModel(),
    temperature: 0.3,
    max_tokens: 2048,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: ENRICH_WORD_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          buildLevelContext(level, targetExam),
          `请为单词「${wordDoc.word}」生成详解。`,
          "examples[].source 只能是 ielts、toefl、movie、general 四个值之一。",
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

  const normalized = normalizeEnrichedWord(parsedJson);
  if (!normalized) {
    console.error("[ai/english/enrich-word] Unable to normalize", {
      wordId,
      word: wordDoc.word,
      raw: previewText(raw, 500),
      parsedJson,
    });
    throw new Error("AI 返回的单词详解不完整，请重试");
  }

  return patchWordEnrichment(wordId, normalized);
}

/** 按顺序逐词 enrich（避免单次 token 过大） */
export async function enrichWords(wordIds: string[]): Promise<EnglishWordDoc[]> {
  const results: EnglishWordDoc[] = [];
  for (const wordId of wordIds) {
    results.push(await enrichWord(wordId));
  }
  return results;
}
