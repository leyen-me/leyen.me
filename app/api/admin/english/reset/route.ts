import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { englishResetConfirmSchema } from "@/lib/admin/content-models";
import {
  countEnglishDocuments,
  resetAllEnglishData,
} from "@/lib/admin/english/reset";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const counts = await countEnglishDocuments();
    const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
    return NextResponse.json({ counts, total });
  } catch (error) {
    console.error("Failed to count english documents:", error);
    return NextResponse.json(
      { error: "Failed to count english data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const parsed = parseBody(englishResetConfirmSchema, await req.json());
    if (parsed.error) return parsed.error;

    const result = await resetAllEnglishData();
    const total = Object.values(result.deleted).reduce((sum, n) => sum + n, 0);

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      total,
    });
  } catch (error) {
    console.error("Failed to reset english data:", error);
    return NextResponse.json(
      { error: "Failed to reset english data" },
      { status: 500 }
    );
  }
}
