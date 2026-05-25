import { z } from "zod";
import { createChatCompletion } from "@/lib/admin/ai/client";
import { getAiModel } from "@/lib/admin/ai/config";
import { parseJsonResponse, previewText } from "@/lib/admin/ai/parse-json";
import { GENERATE_QUIZ_SYSTEM_PROMPT } from "@/lib/admin/ai/english/prompts";
import type { EnglishWordDoc } from "@/lib/admin/english/daily-flow";
import { adminEnglishWordByIdQuery } from "@/lib/admin/english/queries";
import { writeClient } from "@/lib/sanity.write";

const questionSchema = z.object({
  wordId: z.string(),
  word: z.string(),
  type: z.enum(["dictation", "multiple_choice", "fill_blank"]),
  prompt: z.string(),
  answer: z.string(),
  options: z.array(z.string()),
});

const quizResponseSchema = z.object({
  questions: z.array(questionSchema).min(1),
});

export type QuizQuestion = z.infer<typeof questionSchema>;

export async function generateQuiz(input: {
  wordIds: string[];
  mode?: "review" | "new_words";
  questionTypes?: Array<"dictation" | "multiple_choice" | "fill_blank">;
}): Promise<QuizQuestion[]> {
  const words = await Promise.all(
    input.wordIds.map((id) =>
      writeClient.fetch<EnglishWordDoc | null>(adminEnglishWordByIdQuery, { id })
    )
  );
  const validWords = words.filter((w): w is EnglishWordDoc => Boolean(w));

  if (validWords.length === 0) {
    throw new Error("没有可用的单词");
  }

  const types =
    input.questionTypes ?? ["dictation", "multiple_choice", "fill_blank"];
  const mode = input.mode ?? "new_words";

  const raw = await createChatCompletion({
    model: getAiModel(),
    temperature: 0.5,
    max_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: GENERATE_QUIZ_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          `模式：${mode === "review" ? "复习考试" : "新词考试"}`,
          `题型：${types.join(", ")}`,
          `单词列表（含 wordId）：`,
          validWords
            .map(
              (w) =>
                `- wordId: ${w._id}, word: ${w.word}, meaning: ${w.meaningZh ?? ""}`
            )
            .join("\n"),
          `请为每个单词生成 1 道题，混合使用指定题型，wordId 必须与上面一致。`,
        ].join("\n"),
      },
    ],
  });

  let parsedJson: unknown;
  try {
    parsedJson = parseJsonResponse(raw);
  } catch (error) {
    console.error("[ai/english/generate-quiz] Invalid JSON", {
      raw: previewText(raw, 500),
      error,
    });
    throw new Error("AI 返回格式异常，请重试");
  }

  const parsed = quizResponseSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new Error("AI 生成的题目格式不正确，请重试");
  }

  return parsed.data.questions;
}
