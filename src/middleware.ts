import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  const token = request.cookies.get("access_token")?.value;

  const publicRoutes = ["/login", "/registrieren", "/request-password"];
  const isPublicRoute = publicRoutes.some((route) =>
    url.pathname.startsWith(route)
  );

  // Auth check for all pages except public routes and API routes
  if (!isPublicRoute && !url.pathname.startsWith("/api")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      await jwtVerify(
        token,
        new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!)
      );
    } catch (err) {
      console.error("JWT invalid:", err);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set("x-hostname", hostname);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|avif|gif|webp)$).*)",
  ],
};
