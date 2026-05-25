import { NextRequest, NextResponse } from "next/server";
import { adminPassword } from "@/lib/env.api";
import { getAdminSession } from "@/lib/admin/session";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin password is not configured" },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const session = await getAdminSession();
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
