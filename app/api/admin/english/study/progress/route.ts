import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { englishStudyProgressSchema } from "@/lib/admin/content-models";
import { updateDailyLog } from "@/lib/admin/english/service";

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const parsed = parseBody(englishStudyProgressSchema, await req.json());
    if (parsed.error) return parsed.error;

    const { date, learnWordIndex, reviewWordIndex } = parsed.data;
    const log = await updateDailyLog(date, {
      ...(learnWordIndex !== undefined ? { learnWordIndex } : {}),
      ...(reviewWordIndex !== undefined ? { reviewWordIndex } : {}),
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("Failed to save study progress:", error);
    return NextResponse.json(
      { error: "Failed to save study progress" },
      { status: 500 }
    );
  }
}
