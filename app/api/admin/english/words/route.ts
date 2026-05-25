import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import {
  adminEnglishWordsByStatusQuery,
  adminEnglishWordsQuery,
} from "@/lib/admin/english/queries";
import { writeClient } from "@/lib/sanity.write";

export async function GET(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const batchDate = searchParams.get("batchDate");

    if (status) {
      const words = await writeClient.fetch(adminEnglishWordsByStatusQuery, {
        status,
      });
      return NextResponse.json(words);
    }

    if (batchDate) {
      const words = await writeClient.fetch(
        `*[_type == "englishWord" && dailyBatchDate == $batchDate] | order(word asc) {
          _id, word, phonetic, partOfSpeech, meaningZh, level, status, dailyBatchDate, nextReviewAt
        }`,
        { batchDate }
      );
      return NextResponse.json(words);
    }

    const words = await writeClient.fetch(adminEnglishWordsQuery);
    return NextResponse.json(words);
  } catch (error) {
    console.error("Failed to fetch english words:", error);
    return NextResponse.json({ error: "Failed to fetch words" }, { status: 500 });
  }
}
