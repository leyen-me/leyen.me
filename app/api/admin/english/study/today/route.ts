import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { getTodayStudyState } from "@/lib/admin/english/daily-flow";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const state = await getTodayStudyState();
    return NextResponse.json(state);
  } catch (error) {
    console.error("Failed to fetch today study state:", error);
    return NextResponse.json(
      { error: "Failed to fetch study state" },
      { status: 500 }
    );
  }
}
