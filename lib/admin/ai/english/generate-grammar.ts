import { z } from "zod";
import { createChatCompletion } from "@/lib/admin/ai/client";
import { getAiFastModel } from "@/lib/admin/ai/config";
import { parseJsonResponse, previewText } from "@/lib/admin/ai/parse-json";
import {
  buildLevelContext,
  GENERATE_GRAMMAR_SYSTEM_PROMPT,
} from "@/lib/admin/ai/english/prompts";
import { adminEnglishSettingsQuery } from "@/lib/admin/english/queries";
import { writeClient } from "@/lib/sanity.write";

const grammarQuestionSchema = z.object({
  prompt: z.string(),
  options: z.array(z.string()).min(2),
  answer: z.string(),
  explanationZh: z.string(),
});

const grammarResponseSchema = z.object({
  questions: z.array(grammarQuestionSchema).min(1),
});

export type GrammarQuestion = z.infer<typeof grammarQuestionSchema>;

export async function generateGrammarExercises(input: {
  topic?: string;
  count?: number;
}): Promise<GrammarQuestion[]> {
  const settings = await writeClient.fetch<{
    currentLevel: string;
    targetExam: string;
  } | null>(adminEnglishSettingsQuery);

  const level = settings?.currentLevel ?? "A1";
  const targetExam = settings?.targetExam ?? "none";
  const count = input.count ?? 5;
  const topic = input.topic ?? "综合语法";

  const raw = await createChatCompletion({
    model: getAiFastModel(),
    temperature: 0.5,
    max_tokens: 3072,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: GENERATE_GRAMMAR_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          `当前等级：${level}`,
          buildLevelContext(level, targetExam),
          `主题：${topic}`,
          `生成 ${count} 道语法选择题`,
        ].join("\n"),
      },
    ],
  });

  let parsedJson: unknown;
  try {
    parsedJson = parseJsonResponse(raw);
  } catch (error) {
    console.error("[ai/english/generate-grammar] Invalid JSON", {
      raw: previewText(raw, 500),
      error,
    });
    throw new Error("AI 返回格式异常，请重试");
  }

  const parsed = grammarResponseSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new Error("AI 生成的语法题格式不正确，请重试");
  }

  return parsed.data.questions;
}
