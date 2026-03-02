import { NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion, token } from "@/lib/env.api";
import {
  passwordVaultQuery,
  passwordEntriesQuery,
} from "@/lib/sanity.query";

// 使用 useCdn: false 确保获取最新数据，避免 CDN 缓存导致新添加的密码条目查不到
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [vault, entries] = await Promise.all([
      client.fetch<{
        _id: string;
        salt: string;
        verificationCipher: string;
      } | null>(passwordVaultQuery),
      client.fetch<
        Array<{
          _id: string;
          _createdAt: string;
          encryptedData: string;
        }>
      >(passwordEntriesQuery),
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
          "Cache-Control": "no-store, no-cache, must-revalidate",
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
