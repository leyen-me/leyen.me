import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
