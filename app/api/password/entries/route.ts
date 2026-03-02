import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion, token } from "@/lib/env.api";

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

export async function POST(req: NextRequest) {
  try {
    const { encryptedData } = await req.json();

    if (!encryptedData || typeof encryptedData !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid encryptedData" },
        { status: 400 }
      );
    }

    const doc = await client.create({
      _type: "passwordEntry",
      encryptedData,
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
