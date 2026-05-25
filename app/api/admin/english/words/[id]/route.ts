import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { englishWordPatchSchema } from "@/lib/admin/content-models";
import { adminEnglishWordByIdQuery } from "@/lib/admin/english/queries";
import { writeClient } from "@/lib/sanity.write";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const word = await writeClient.fetch(adminEnglishWordByIdQuery, { id });
    if (!word) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }
    return NextResponse.json(word);
  } catch (error) {
    console.error("Failed to fetch english word:", error);
    return NextResponse.json({ error: "Failed to fetch word" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const parsed = parseBody(englishWordPatchSchema, await req.json());
    if (parsed.error) return parsed.error;

    const existing = await writeClient.fetch(adminEnglishWordByIdQuery, { id });
    if (!existing) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    await writeClient.patch(id).set(parsed.data).commit();
    const word = await writeClient.fetch(adminEnglishWordByIdQuery, { id });
    return NextResponse.json({ success: true, word });
  } catch (error) {
    console.error("Failed to update english word:", error);
    return NextResponse.json({ error: "Failed to update word" }, { status: 500 });
  }
}
