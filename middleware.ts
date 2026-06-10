import { NextRequest, NextResponse } from "next/server";
import type { AdminSessionData } from "@/lib/admin/session";
import { sessionOptions } from "@/lib/admin/session";
import { getIronSession } from "iron-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isPasswordRoute =
    pathname === "/password" || pathname.startsWith("/password/");

  if (!isAdminRoute && !isPasswordRoute) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/password" || pathname.startsWith("/admin/password/")) {
    return NextResponse.redirect(new URL("/password", request.url));
  }

  const response = NextResponse.next();
  const session = await getIronSession<AdminSessionData>(
    request,
    response,
    sessionOptions
  );

  if (!session.isLoggedIn) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/password", "/password/:path*"],
};
