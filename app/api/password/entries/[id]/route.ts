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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { encryptedData } = await req.json();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing entry id" }, { status: 400 });
    }

    if (!encryptedData || typeof encryptedData !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid encryptedData" },
        { status: 400 }
      );
    }

    await client.patch(id).set({ encryptedData }).commit();

    revalidateTag("passwordEntry");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update password entry:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing entry id" }, { status: 400 });
    }

    await client.delete(id);

    revalidateTag("passwordEntry");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete password entry:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
