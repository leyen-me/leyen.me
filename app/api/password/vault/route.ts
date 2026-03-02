import { NextResponse } from "next/server";
import { sanityFetch } from "@/lib/sanity.client";
import {
  passwordVaultQuery,
  passwordEntriesQuery,
} from "@/lib/sanity.query";

export async function GET() {
  try {
    const [vault, entries] = await Promise.all([
      sanityFetch<{
        _id: string;
        salt: string;
        verificationCipher: string;
      } | null>({
        query: passwordVaultQuery,
        tags: ["passwordVault"],
      }),
      sanityFetch<
        Array<{
          _id: string;
          _createdAt: string;
          encryptedData: string;
        }>
      >({
        query: passwordEntriesQuery,
        tags: ["passwordEntry"],
      }),
    ]);

    return NextResponse.json({
      vault: vault
        ? {
            _id: vault._id,
            salt: vault.salt,
            verificationCipher: vault.verificationCipher,
          }
        : null,
      entries,
    });
  } catch (error) {
    console.error("Failed to fetch password vault:", error);
    return NextResponse.json(
      { error: "Failed to fetch vault" },
      { status: 500 }
    );
  }
}
