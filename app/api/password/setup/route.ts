import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { writeClient } from "@/lib/sanity.write";

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { salt, verificationCipher } = await req.json();

    if (!salt || !verificationCipher) {
      return NextResponse.json(
        { error: "Missing salt or verificationCipher" },
        { status: 400 }
      );
    }

    const doc = await writeClient.createOrReplace({
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
