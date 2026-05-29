import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { englishExamResultSchema } from "@/lib/admin/content-models";
import { getTodayDateString } from "@/lib/admin/english/constants";
import { adminEnglishWordByIdQuery } from "@/lib/admin/english/queries";
import { clearCachedQuiz } from "@/lib/admin/english/quiz-cache";
import { applySrsCorrect, applySrsWrong } from "@/lib/admin/english/srs";
import {
  getOrCreateSettings,
  updateDailyLog,
  updateStreakAfterStudy,
} from "@/lib/admin/english/service";
import { writeClient } from "@/lib/sanity.write";

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const parsed = parseBody(englishExamResultSchema, await req.json());
    if (parsed.error) return parsed.error;

    const settings = await getOrCreateSettings();
    const today = getTodayDateString();
    const batchDate = parsed.data.batchDate;

    let correctCount = 0;
    await Promise.all(
      parsed.data.results.map(async ({ wordId, correct }) => {
        if (correct) correctCount += 1;

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

        if (correct && update.status !== "mastered") {
          update.status = "review";
        }

        await writeClient.patch(wordId).set(update).commit();
        await clearCachedQuiz(wordId, "new_words");
      })
    );

    const examScore = Math.round(
      (correctCount / parsed.data.results.length) * 100
    );

    await updateDailyLog(batchDate, {
      examScore,
      wordsLearnedCount: parsed.data.results.length,
      completedSteps: { exam: true },
    });

    if (batchDate === today) {
      await updateDailyLog(today, {
        completedSteps: { learn: true },
      });
    }

    await updateStreakAfterStudy();

    return NextResponse.json({ success: true, examScore });
  } catch (error) {
    console.error("Failed to submit exam results:", error);
    return NextResponse.json(
      { error: "Failed to submit exam results" },
      { status: 500 }
    );
  }
}
