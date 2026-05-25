import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { englishDailyUpdateSchema } from "@/lib/admin/content-models";
import { updateDailyLog, updateStreakAfterStudy } from "@/lib/admin/english/service";

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const parsed = parseBody(englishDailyUpdateSchema, await req.json());
    if (parsed.error) return parsed.error;

    const { date, step, wordsLearnedCount, reviewCount, examScore } = parsed.data;

    const log = await updateDailyLog(date, {
      wordsLearnedCount,
      reviewCount,
      examScore,
      completedSteps: { [step]: true },
    });

    await updateStreakAfterStudy();

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("Failed to update daily log:", error);
    return NextResponse.json(
      { error: "Failed to update daily log" },
      { status: 500 }
    );
  }
}
