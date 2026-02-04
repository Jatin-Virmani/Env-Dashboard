import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const auth = request.cookies.get("auth")?.value;
  const path = request.nextUrl.pathname;

  const protectedRoutes = ["/upload", "/history"];

  const isProtected = protectedRoutes.some(route =>
    path.startsWith(route)
  );

  if (isProtected && !auth) {
    return NextResponse.redirect(new URL("/verification", request.url));
  }
}
