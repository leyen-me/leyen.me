import { z } from "zod";
import { createChatCompletion } from "@/lib/admin/ai/client";
import { getAiModel } from "@/lib/admin/ai/config";
import { parseJsonResponse, previewText } from "@/lib/admin/ai/parse-json";
import { GENERATE_QUIZ_SYSTEM_PROMPT } from "@/lib/admin/ai/english/prompts";
import type { EnglishWordDoc } from "@/lib/admin/english/daily-flow";
import {
  getCachedQuizField,
  parseCachedQuiz,
  saveCachedQuiz,
  type QuizMode,
} from "@/lib/admin/english/quiz-cache";
import { adminEnglishWordByIdQuery } from "@/lib/admin/english/queries";
import { writeClient } from "@/lib/sanity.write";

const questionSchema = z.object({
  wordId: z.string(),
  word: z.string(),
  type: z.enum(["dictation", "multiple_choice", "fill_blank"]),
  prompt: z.string(),
  answer: z.string(),
  options: z.array(z.string()),
  phonetic: z.string().optional(),
});

const quizResponseSchema = z.object({
  questions: z.array(questionSchema).min(1),
});

export type QuizQuestion = z.infer<typeof questionSchema>;

function attachWordHints(
  question: QuizQuestion,
  word: EnglishWordDoc
): QuizQuestion {
  return {
    ...question,
    phonetic: word.phonetic,
  };
}

function readCachedQuestion(
  word: EnglishWordDoc,
  mode: QuizMode
): QuizQuestion | null {
  const raw =
    mode === "review" ? word.cachedReviewQuiz : word.cachedExamQuiz;
  const cached = parseCachedQuiz(raw);
  if (!cached) return null;

  return attachWordHints(
    {
      wordId: word._id,
      word: word.word,
      ...cached,
      options: cached.options ?? [],
    },
    word
  );
}

async function generateViaAi(
  words: EnglishWordDoc[],
  mode: QuizMode,
  types: Array<"dictation" | "multiple_choice" | "fill_blank">
): Promise<QuizQuestion[]> {
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
          words
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

  const wordIdSet = new Set(words.map((w) => w._id));
  const questions = parsed.data.questions.filter((q) => wordIdSet.has(q.wordId));

  if (questions.length === 0) {
    throw new Error("AI 生成的题目格式不正确，请重试");
  }

  return questions;
}

export async function generateQuiz(input: {
  wordIds: string[];
  mode?: QuizMode;
  questionTypes?: Array<"dictation" | "multiple_choice" | "fill_blank">;
}): Promise<QuizQuestion[]> {
  const mode = input.mode ?? "new_words";
  const types =
    input.questionTypes ?? ["dictation", "multiple_choice", "fill_blank"];

  const words = await Promise.all(
    input.wordIds.map((id) =>
      writeClient.fetch<EnglishWordDoc | null>(adminEnglishWordByIdQuery, { id })
    )
  );
  const wordById = new Map(
    words
      .filter((w): w is EnglishWordDoc => Boolean(w))
      .map((w) => [w._id, w])
  );

  if (wordById.size === 0) {
    throw new Error("没有可用的单词");
  }

  const cachedById = new Map<string, QuizQuestion>();
  const needsAi: EnglishWordDoc[] = [];

  for (const id of input.wordIds) {
    const word = wordById.get(id);
    if (!word) continue;

    const cached = readCachedQuestion(word, mode);
    if (cached) {
      cachedById.set(id, cached);
    } else {
      needsAi.push(word);
    }
  }

  if (needsAi.length > 0) {
    const generated = await generateViaAi(needsAi, mode, types);
    const cacheField = getCachedQuizField(mode);

    await Promise.all(
      generated.map(async (q) => {
        const { wordId, word: _word, ...quiz } = q;
        await saveCachedQuiz(wordId, mode, quiz);
        const word = wordById.get(wordId);
        cachedById.set(
          wordId,
          word ? attachWordHints(q, word) : q
        );
      })
    );

    const missing = needsAi.filter((w) => !cachedById.has(w._id));
    if (missing.length > 0) {
      console.error("[ai/english/generate-quiz] Missing questions for words", {
        mode,
        cacheField,
        wordIds: missing.map((w) => w._id),
      });
      throw new Error("AI 未能为所有单词生成题目，请重试");
    }
  }

  const ordered = input.wordIds
    .map((id) => {
      const q = cachedById.get(id);
      const word = wordById.get(id);
      if (!q) return null;
      return word ? attachWordHints(q, word) : q;
    })
    .filter((q): q is QuizQuestion => Boolean(q));

  if (ordered.length === 0) {
    throw new Error("没有可用的单词");
  }

  return ordered;
}
