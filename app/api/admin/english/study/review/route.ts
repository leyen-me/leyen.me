import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { englishReviewResultSchema } from "@/lib/admin/content-models";
import { getTodayDateString } from "@/lib/admin/english/constants";
import { adminEnglishWordByIdQuery } from "@/lib/admin/english/queries";
import { clearCachedQuiz } from "@/lib/admin/english/quiz-cache";
import { applySrsCorrect, applySrsWrong } from "@/lib/admin/english/srs";
import {
  getOrCreateDailyLog,
  getOrCreateSettings,
  updateDailyLog,
  updateStreakAfterStudy,
} from "@/lib/admin/english/service";
import { writeClient } from "@/lib/sanity.write";

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const parsed = parseBody(englishReviewResultSchema, await req.json());
    if (parsed.error) return parsed.error;

    const settings = await getOrCreateSettings();
    const today = getTodayDateString();

    await Promise.all(
      parsed.data.results.map(async ({ wordId, correct }) => {
        const word = await writeClient.fetch<{
          srsInterval: number;
          consecutiveCorrect: number;
          wrongCount: number;
          status: string;
        } | null>(adminEnglishWordByIdQuery, { id: wordId });

        if (!word) return;

        const current = {
          srsInterval: word.srsInterval ?? 1,
          consecutiveCorrect: word.consecutiveCorrect ?? 0,
          wrongCount: word.wrongCount ?? 0,
          status: word.status as "learning" | "review" | "mastered" | "new_word_book",
        };

        const update = correct
          ? applySrsCorrect(current, settings.masteredThreshold)
          : applySrsWrong(current);

        await writeClient.patch(wordId).set(update).commit();
        await clearCachedQuiz(wordId, "review");
      })
    );

    const completeStep = parsed.data.completeStep ?? true;
    const dailyLog = await getOrCreateDailyLog(today);

    await updateDailyLog(today, {
      reviewCount: (dailyLog.reviewCount ?? 0) + parsed.data.results.length,
      ...(completeStep ? { completedSteps: { review: true } } : {}),
    });

    if (completeStep) {
      await updateStreakAfterStudy();
    }

    return NextResponse.json({ success: true, completeStep });
  } catch (error) {
    console.error("Failed to submit review results:", error);
    return NextResponse.json(
      { error: "Failed to submit review results" },
      { status: 500 }
    );
  }
}
