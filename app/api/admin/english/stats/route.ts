import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { getTodayDateString } from "@/lib/admin/english/constants";
import {
  adminEnglishDailyLogsQuery,
  adminEnglishStatsQuery,
} from "@/lib/admin/english/queries";
import { getOrCreateDailyLog, getOrCreateSettings } from "@/lib/admin/english/service";
import { getTodayStudyState } from "@/lib/admin/english/daily-flow";
import { writeClient } from "@/lib/sanity.write";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const today = getTodayDateString();
    const startDate = new Date(`${today}T12:00:00`);
    startDate.setDate(startDate.getDate() - 364);
    const startDateStr = startDate.toISOString().slice(0, 10);

    const [settings, stats, dailyLogs, todayState, todayLog] = await Promise.all([
      getOrCreateSettings(),
      writeClient.fetch(adminEnglishStatsQuery),
      writeClient.fetch(adminEnglishDailyLogsQuery, { startDate: startDateStr }),
      getTodayStudyState(),
      getOrCreateDailyLog(today),
    ]);

    const todayProgress = {
      review: todayLog.completedSteps.review,
      learn: todayLog.completedSteps.learn,
      exam: todayLog.completedSteps.exam,
      wordsLearned: todayState.todayWords.length,
      reviewDue: todayState.reviewWords.length,
    };

    return NextResponse.json({
      settings,
      stats,
      dailyLogs,
      todayProgress,
      currentStep: todayState.currentStep,
    });
  } catch (error) {
    console.error("Failed to fetch english stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
