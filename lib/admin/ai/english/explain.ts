import { z } from "zod";
import { createChatCompletion } from "@/lib/admin/ai/client";
import { getAiModel, getAiStructuredModel } from "@/lib/admin/ai/config";
import { parseJsonResponse, previewText } from "@/lib/admin/ai/parse-json";
import {
  EXPLAIN_SYSTEM_PROMPT,
  LEVEL_ADVICE_SYSTEM_PROMPT,
} from "@/lib/admin/ai/english/prompts";
import { adminEnglishSettingsQuery, adminEnglishStatsQuery } from "@/lib/admin/english/queries";
import { writeClient } from "@/lib/sanity.write";

const levelAdviceSchema = z.object({
  summary: z.string(),
  weakPoints: z.array(z.string()),
  suggestions: z.array(z.string()),
  recommendedLevel: z.string(),
});

export async function explainEnglishQuestion(input: {
  question: string;
  context?: string;
}): Promise<string> {
  const content = await createChatCompletion({
    model: getAiModel(),
    temperature: 0.4,
    max_tokens: 1024,
    messages: [
      { role: "system", content: EXPLAIN_SYSTEM_PROMPT },
      {
        role: "user",
        content: input.context
          ? `背景：${input.context}\n\n问题：${input.question}`
          : input.question,
      },
    ],
  });

  return content;
}

export async function generateLevelAdvice(): Promise<z.infer<typeof levelAdviceSchema>> {
  const [settings, stats] = await Promise.all([
    writeClient.fetch<{
      currentLevel: string;
      targetExam: string;
      currentStreak: number;
    } | null>(adminEnglishSettingsQuery),
    writeClient.fetch<{
      totalWords: number;
      masteredWords: number;
      newWordBookCount: number;
      learningWords: number;
      reviewWords: number;
    }>(adminEnglishStatsQuery),
  ]);

  const raw = await createChatCompletion({
    model: getAiStructuredModel(),
    temperature: 0.4,
    max_tokens: 1024,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: LEVEL_ADVICE_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          `当前等级：${settings?.currentLevel ?? "A1"}`,
          `目标考试：${settings?.targetExam ?? "none"}`,
          `连续打卡：${settings?.currentStreak ?? 0} 天`,
          `总词汇：${stats.totalWords}`,
          `已掌握：${stats.masteredWords}`,
          `生词本：${stats.newWordBookCount}`,
          `学习中：${stats.learningWords}`,
          `复习中：${stats.reviewWords}`,
        ].join("\n"),
      },
    ],
  });

  let parsedJson: unknown;
  try {
    parsedJson = parseJsonResponse(raw);
  } catch (error) {
    console.error("[ai/english/explain] Invalid level advice JSON", {
      raw: previewText(raw),
    });
    throw new Error("AI 返回格式异常，请重试");
  }

  const parsed = levelAdviceSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new Error("AI 生成的建议格式不正确，请重试");
  }

  return parsed.data;
}
