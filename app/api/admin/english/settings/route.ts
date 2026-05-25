import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { englishSettingsSchema } from "@/lib/admin/content-models";
import { getOrCreateSettings, updateSettings } from "@/lib/admin/english/service";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const settings = await getOrCreateSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch english settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const parsed = parseBody(englishSettingsSchema, await req.json());
    if (parsed.error) return parsed.error;

    await updateSettings(parsed.data);
    const settings = await getOrCreateSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Failed to update english settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
