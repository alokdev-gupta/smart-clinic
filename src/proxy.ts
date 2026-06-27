import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16+ uses "proxy" (renamed from "middleware")
export async function proxy(req: NextRequest) {
  const session = await auth();
  const { nextUrl } = req;
  const isLoggedIn = !!session?.user;

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const allowedRoles = ["ADMIN", "DOCTOR", "PATIENT"];

  if (isDashboardRoute) {
    if (!isLoggedIn || !allowedRoles.includes(session?.user?.role ?? "")) {
      const loginUrl = new URL("/login", nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|login|register).*)",
  ],
};
