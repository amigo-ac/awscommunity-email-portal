import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isRegisterRoute = req.nextUrl.pathname.startsWith("/register");
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");

  // API routes handle their own auth
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Register route requires authentication
  if (isRegisterRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Admin routes require authentication and admin role
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (!req.auth?.user?.isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/register/:path*", "/admin/:path*"],
};
