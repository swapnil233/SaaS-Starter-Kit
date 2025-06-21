import upstash from "@/lib/upstash";
import { Ratelimit } from "@upstash/ratelimit";
import { ipAddress } from "@vercel/functions";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_API_PREFIXES = [
  "/api/auth",
  "/api/public", // cooldown.ts
  "/api/users/verification",
];

// Sensitive endpoints that need rate limiting.
const RATE_LIMIT_ENDPOINTS = [
  { path: "/api/auth/register", limit: 20, windowSeconds: 3600 }, // 20 reqs/hour (3600 seconds)
  { path: "/api/auth/signin", limit: 20, windowSeconds: 3600 }, // 20 reqs/hour (3600 seconds)
  { path: "/api/auth/request-password-reset", limit: 10, windowSeconds: 3600 }, // 10 reqs/hour (3600 seconds)
  { path: "/api/users/verification", limit: 10, windowSeconds: 3600 }, // 10 reqs/hour (3600 seconds)
  { path: "/api/public/cooldown", limit: 10, windowSeconds: 60 }, // 10 reqs/min (60 seconds)
];

// Pre-create rate limiters for each sensitive endpoint to avoid creating them on each request
const rateLimiters = RATE_LIMIT_ENDPOINTS.reduce(
  (acc, endpoint) => {
    acc[endpoint.path] = new Ratelimit({
      redis: upstash,
      limiter: Ratelimit.slidingWindow(
        endpoint.limit,
        `${endpoint.windowSeconds} s`
      ), // Format as "3600 s"
      analytics: false,
    });
    return acc;
  },
  {} as Record<string, Ratelimit>
);

// The code below will run on all routes that begin with /dashboard/ or /account or /api/
export const config = {
  matcher: ["/dashboard/:path*", "/account", "/api/:path*"],
};

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for IP-based rate limiting on sensitive endpoints
  // This is an additional layer of protection on top of the per-route rate limiting
  const sensitiveEndpoint = RATE_LIMIT_ENDPOINTS.find((endpoint) =>
    pathname.startsWith(endpoint.path)
  );

  if (sensitiveEndpoint) {
    // Get the client's IP using Vercel's secure function
    const ip = ipAddress(req) || "unknown";

    try {
      // Use the pre-created rate limiter for this endpoint
      const limiter = rateLimiters[sensitiveEndpoint.path];
      const { success, reset, remaining } = await limiter.limit(
        `${sensitiveEndpoint.path}:${ip}`
      );

      if (!success) {
        return NextResponse.json(
          {
            error: "Too many requests",
            retryAfter: reset,
          },
          {
            status: 429,
            headers: {
              "Retry-After": `${reset}`,
              "X-RateLimit-Limit": `${sensitiveEndpoint.limit}`,
              "X-RateLimit-Remaining": `${remaining}`,
              "X-RateLimit-Reset": `${Date.now() + reset * 1000}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Rate limit middleware error:", error);
      // Fail open if Upstash has issues
    }
  }

  // Skip if this is a declared public prefix
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Decode the next-auth cookie only (no DB, no Prisma)
  const token = await getToken({
    req,
    secret: process.env.JWT_SECRET,
  });

  if (pathname.startsWith("/api/")) {
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!token.emailVerified)
      return NextResponse.json(
        { error: "Email verification required" },
        { status: 403 }
      );

    return NextResponse.next();
  }

  // Not signed-in? Kick to /signin and keep where they tried to go
  if (!token) {
    const url = new URL("/signin", req.url);
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }

  // Signed-in but email unverified? Kick to /verify-email
  if (!token.emailVerified) {
    return NextResponse.redirect(new URL("/verify-email", req.url));
  }

  // All checks passed
  return NextResponse.next();
}
