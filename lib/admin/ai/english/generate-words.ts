import { z } from "zod";
import { createChatCompletion } from "@/lib/admin/ai/client";
import { getAiEnglishModel } from "@/lib/admin/ai/config";
import { parseJsonResponse, previewText } from "@/lib/admin/ai/parse-json";
import {
  buildLevelContext,
  GENERATE_WORDS_SYSTEM_PROMPT,
} from "@/lib/admin/ai/english/prompts";
import { adminEnglishKnownWordsQuery } from "@/lib/admin/english/queries";
import { adminEnglishSettingsQuery } from "@/lib/admin/english/queries";
import { getTodayDateString } from "@/lib/admin/english/constants";
import { createInitialSrsFields } from "@/lib/admin/english/srs";
import { writeClient } from "@/lib/sanity.write";

const wordsResponseSchema = z.object({
  words: z.array(z.string().min(1)),
});

export async function generateDailyWords(batchDate?: string): Promise<{
  wordIds: string[];
  words: string[];
}> {
  const today = batchDate ?? getTodayDateString();
  const [settings, knownWords, existingBatch] = await Promise.all([
    writeClient.fetch<{
      currentLevel: string;
      targetExam: string;
      dailyWordCount: number;
    } | null>(adminEnglishSettingsQuery),
    writeClient.fetch<Array<{ word: string }>>(adminEnglishKnownWordsQuery),
    writeClient.fetch<Array<{ _id: string; word: string }>>(
      `*[_type == "englishWord" && dailyBatchDate == $batchDate]{ _id, word }`,
      { batchDate: today }
    ),
  ]);

  if (existingBatch.length > 0) {
    return {
      wordIds: existingBatch.map((w) => w._id),
      words: existingBatch.map((w) => w.word),
    };
  }

  const level = settings?.currentLevel ?? "A1";
  const targetExam = settings?.targetExam ?? "none";
  const count = settings?.dailyWordCount ?? 20;
  const known = knownWords.map((w) => w.word.toLowerCase());

  const raw = await createChatCompletion({
    model: getAiEnglishModel(),
    temperature: 0.4,
    max_tokens: 1024,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: GENERATE_WORDS_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          `当前等级：${level}`,
          `目标考试：${targetExam}`,
          `需要 ${count} 个新词`,
          buildLevelContext(level, targetExam),
          known.length
            ? `已学过（勿重复）：${known.slice(-200).join(", ")}`
            : "用户尚无已学单词",
        ].join("\n"),
      },
    ],
  });

  let parsedJson: unknown;
  try {
    parsedJson = parseJsonResponse(raw);
  } catch (error) {
    console.error("[ai/english/generate-words] Invalid JSON", {
      raw: previewText(raw),
      error,
    });
    throw new Error("AI 返回格式异常，请重试");
  }

  const parsed = wordsResponseSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new Error("AI 未返回有效单词列表，请重试");
  }

  const uniqueWords = [
    ...new Set(
      parsed.data.words
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w && !known.includes(w))
    ),
  ].slice(0, count);

  if (uniqueWords.length === 0) {
    throw new Error("AI 未能生成有效的新单词，请重试");
  }

  const srs = createInitialSrsFields();
  const created = await Promise.all(
    uniqueWords.map((word) =>
      writeClient.create({
        _type: "englishWord",
        word,
        level,
        status: srs.status,
        srsInterval: srs.srsInterval,
        nextReviewAt: srs.nextReviewAt,
        consecutiveCorrect: srs.consecutiveCorrect,
        wrongCount: srs.wrongCount,
        learnedAt: today,
        lastReviewedAt: srs.lastReviewedAt,
        dailyBatchDate: today,
        phrases: [],
        examples: [],
        derivations: [],
      })
    )
  );

  return {
    wordIds: created.map((doc) => doc._id),
    words: uniqueWords,
  };
}
