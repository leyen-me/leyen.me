import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { writeClient } from "@/lib/sanity.write";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { encryptedData } = await req.json();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing entry id" }, { status: 400 });
    }

    if (!encryptedData || typeof encryptedData !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid encryptedData" },
        { status: 400 }
      );
    }

    await writeClient.patch(id).set({ encryptedData }).commit();

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
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing entry id" }, { status: 400 });
    }

    await writeClient.delete(id);

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
