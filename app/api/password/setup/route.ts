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
    const { salt, verificationCipher } = await req.json();

    if (!salt || !verificationCipher) {
      return NextResponse.json(
        { error: "Missing salt or verificationCipher" },
        { status: 400 }
      );
    }

    const doc = await client.createOrReplace({
      _id: "password-vault",
      _type: "passwordVault",
      salt,
      verificationCipher,
    });

    revalidateTag("passwordVault");
    return NextResponse.json({ success: true, _id: doc._id });
  } catch (error) {
    console.error("Failed to setup password vault:", error);
    return NextResponse.json(
      { error: "Failed to setup vault" },
      { status: 500 }
    );
  }
}
