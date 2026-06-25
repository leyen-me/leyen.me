import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { writeClient } from "@/lib/sanity.write";

export async function POST(req: NextRequest) {

  try {
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid ids array" },
        { status: 400 }
      );
    }

    const transaction = writeClient.transaction();
    ids.forEach((id: string, index: number) => {
      transaction.patch(id, { set: { order: index } });
    });
    await transaction.commit();

    revalidateTag("passwordEntry");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder entries:", error);
    return NextResponse.json(
      { error: "Failed to reorder" },
      { status: 500 }
    );
  }
}
