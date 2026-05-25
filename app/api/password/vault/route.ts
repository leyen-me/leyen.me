import { NextResponse } from "next/server";
import { unstable_noStore } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { writeClient } from "@/lib/sanity.write";
import {
  passwordVaultQuery,
  passwordEntriesQuery,
} from "@/lib/sanity.query";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  unstable_noStore();
  try {
    const fetchOptions = { cache: "no-store" as RequestCache };
    const [vault, entries] = await Promise.all([
      writeClient.fetch<{
        _id: string;
        salt: string;
        verificationCipher: string;
      } | null>(passwordVaultQuery, {}, fetchOptions),
      writeClient.fetch<
        Array<{
          _id: string;
          _createdAt: string;
          encryptedData: string;
        }>
      >(passwordEntriesQuery, {}, fetchOptions),
    ]);

    return NextResponse.json(
      {
        vault: vault
          ? {
              _id: vault._id,
              salt: vault.salt,
              verificationCipher: vault.verificationCipher,
            }
          : null,
        entries,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch password vault:", error);
    return NextResponse.json(
      { error: "Failed to fetch vault" },
      { status: 500 }
    );
  }
}
