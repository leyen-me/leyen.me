import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { writeClient } from "@/lib/sanity.write";

export async function POST(req: NextRequest) {

  try {
    const { encryptedData, order } = await req.json();

    if (!encryptedData || typeof encryptedData !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid encryptedData" },
        { status: 400 }
      );
    }

    const doc = await writeClient.create({
      _type: "passwordEntry",
      encryptedData,
      order: typeof order === "number" ? order : 0,
    });

    revalidateTag("passwordEntry");
    return NextResponse.json({ success: true, _id: doc._id });
  } catch (error) {
    console.error("Failed to create password entry:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    );
  }
}
