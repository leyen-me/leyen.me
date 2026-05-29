import { z } from "zod";
import { writeClient } from "@/lib/sanity.write";

export const cachedQuizSchema = z.object({
  type: z.enum(["dictation", "multiple_choice", "fill_blank"]),
  prompt: z.string(),
  answer: z.string(),
  options: z.array(z.string()),
});

export type CachedQuiz = z.infer<typeof cachedQuizSchema>;

export type QuizMode = "review" | "new_words";

const CACHE_FIELD: Record<QuizMode, "cachedReviewQuiz" | "cachedExamQuiz"> = {
  review: "cachedReviewQuiz",
  new_words: "cachedExamQuiz",
};

export function parseCachedQuiz(raw: unknown): CachedQuiz | null {
  const parsed = cachedQuizSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export function getCachedQuizField(mode: QuizMode): "cachedReviewQuiz" | "cachedExamQuiz" {
  return CACHE_FIELD[mode];
}

export async function saveCachedQuiz(
  wordId: string,
  mode: QuizMode,
  quiz: CachedQuiz
): Promise<void> {
  await writeClient.patch(wordId).set({ [CACHE_FIELD[mode]]: quiz }).commit();
}

export async function clearCachedQuiz(wordId: string, mode: QuizMode): Promise<void> {
  await writeClient.patch(wordId).unset([CACHE_FIELD[mode]]).commit();
}

export async function clearCachedQuizzes(
  wordIds: string[],
  mode: QuizMode
): Promise<void> {
  await Promise.all(wordIds.map((id) => clearCachedQuiz(id, mode)));
}
