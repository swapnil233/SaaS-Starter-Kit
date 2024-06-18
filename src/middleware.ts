import micromatch from "micromatch";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard/**"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if the route requires authentication
  if (micromatch.isMatch(pathname, protectedRoutes)) {
    const redirectUrl = new URL("/signin", req.url);
    redirectUrl.searchParams.set("callbackUrl", encodeURI(req.url));

    try {
      const url = new URL("/api/auth/session", req.url);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.get("cookie") || "",
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch session: ${response.statusText}`);
        return NextResponse.redirect(redirectUrl);
      }

      const session = await response.json();
      if (!session.user) {
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error("Error during session fetch:", error);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth/session).*)"],
};
