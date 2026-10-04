import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";
import { authorizeAdminPageRequest } from "@/lib/admin-page-auth";
import { LANDINGS_BY_SLUG } from "@/lib/landing/defs";
import { getLegacyPropertyResolverPath } from "@/lib/property-url";
import { isCACitySlug } from "@/lib/seo/cities";
import { getClusterConfig } from "@/lib/clusters/cluster-config";
import { canonicalCityBuyPath, legacyClusterTarget, legacyDiscoverTarget, resolveCanonicalCityLocation } from "@/lib/seo/location-canonical";

// ── Rate limiter (Upstash HTTP, Edge-compatible) ──────────────────────────────
// Built once at module load so the singleton Redis connection is reused across
// invocations — avoids re-establishing an HTTP session on every request.
// Returns null when Upstash env vars are absent so the entire middleware degrades
// gracefully in local development without Redis configured.

let ratelimiter: Ratelimit | null = null;

try {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    ratelimiter = new Ratelimit({
      redis:   Redis.fromEnv(),
      // Sliding window: 100 requests per IP per minute on all /api/* routes
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      // Namespace prefix — avoids collisions with other Upstash uses in the project
      prefix:     "@cc/rl:api",
      // Don't emit usage-analytics events — reduces write overhead
      analytics:  false,
    });
  }
} catch {
  // Swallow initialisation errors — never crash at module load
  ratelimiter = null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Cron and health routes are exempt from rate limiting (called by Vercel cron)
const RATE_LIMIT_EXEMPT: string[] = ["/api/cron/", "/api/health"];

// Routes that serve authenticated, user-specific data must never be served
// from a shared CDN cache or a browser back-forward cache.
const PRIVATE_PATH_PREFIXES: string[] = [
  "/dashboard", "/profile", "/admin", "/settings", "/saved",
];

// Query-string keys whose values are persisted in cookies for attribution
const TRACKING_PARAMS: string[] = [
  "utm_source", "utm_medium", "utm_campaign",
  "utm_content", "utm_term", "gclid", "fbclid",
];

// ── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname, search } = req.nextUrl;

  // Admin pages contain operational controls and must fail closed. API routes
  // have their own bearer-token authorization and are handled below.
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname === "/api/admin" || pathname.startsWith("/api/admin/");
  if (isAdminPage || isAdminApi) {
    const adminAuth = authorizeAdminPageRequest(req);

    if (!adminAuth.configured || (isAdminPage && !adminAuth.basicConfigured)) {
      return isAdminApi
        ? NextResponse.json(
            { error: "Server authentication is not configured" },
            { status: 503, headers: { "Cache-Control": "private, no-store" } },
          )
        : new NextResponse("Not Found", {
            status: 404,
            headers: { "Cache-Control": "private, no-store" },
          });
    }

    if (!adminAuth.authorized) {
      const headers = {
        "Cache-Control": "private, no-store",
        "WWW-Authenticate": 'Basic realm="Crown Coastal Admin", charset="UTF-8"',
      };
      return isAdminApi
        ? NextResponse.json({ error: "Unauthorized" }, { status: 401, headers })
        : new NextResponse("Authentication required", { status: 401, headers });
    }
  }

  // ── 1. API routes: apply sliding-window rate limiting ───────────────────
  if (pathname.startsWith("/api/")) {
    const isExempt = RATE_LIMIT_EXEMPT.some((p) => pathname.startsWith(p));

    if (ratelimiter && !isExempt) {
      // x-forwarded-for is set by Vercel's edge network; fall back to req.ip
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        // Next 15 exposes ip via the request object
        (req as unknown as { ip?: string }).ip ??
        "anonymous";

      try {
        const { success, remaining, reset } = await ratelimiter.limit(ip);

        if (!success) {
          // Return 429 with standard rate-limit response headers
          const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
          return new NextResponse("Too Many Requests", {
            status: 429,
            headers: {
              "Content-Type":          "text/plain; charset=utf-8",
              "X-RateLimit-Limit":     "100",
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset":     String(reset),
              "Retry-After":           String(retryAfter),
            },
          });
        }

        // Pass remaining quota to the Route Handler for optional observability
        const res = NextResponse.next();
        res.headers.set("X-RateLimit-Remaining", String(remaining));
        return res;
      } catch {
        // Redis unreachable — fail open to preserve availability.
        // A rate limiting outage must never affect legitimate users.
      }
    }

    // No rate limiting (exempt or Upstash not configured) — pass through
    return NextResponse.next();
  }

  // ── 2. Page routes: URL normalisation ───────────────────────────────────
  // Redirect uppercase / double-slash URLs to their canonical lowercase form.
  const cleaned = pathname.replace(/\/{2,}/g, "/");
  const lower   = cleaned.toLowerCase();

  if (pathname !== lower || pathname !== cleaned) {
    const url    = req.nextUrl.clone();
    url.pathname = lower;
    url.search   = search;
    // 301 permanent redirect — signals to search engines which URL is canonical
    return NextResponse.redirect(url, 301);
  }

  // Resolve old address/listing-key URLs before the App Router starts
  // streaming. The Node route handler performs the database lookup and sends
  // a real HTTP 308 to the durable property-entity URL. Stable entity URLs skip
  // this path entirely and retain their normal ISR/CDN behavior.
  const propertyResolverPath = getLegacyPropertyResolverPath(pathname);
  if (propertyResolverPath) {
    const lookupUrl = req.nextUrl.clone();
    lookupUrl.pathname = propertyResolverPath;
    return NextResponse.rewrite(lookupUrl);
  }

  // Reject fabricated California landing URLs before React starts streaming.
  // A route-level notFound() can otherwise carry a 200 status, which search
  // engines correctly classify as a soft 404.
  const californiaSegments = pathname.split("/").filter(Boolean);
  if (
    californiaSegments[0] === "california" &&
    californiaSegments.length === 3 &&
    (
      !isCACitySlug(californiaSegments[1]) ||
      !LANDINGS_BY_SLUG[californiaSegments[2]]
    )
  ) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=3600",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex",
      },
    });
  }

  // Resolve only configured legacy destinations before React can stream a
  // 200 + meta refresh. Dedicated discovery pages (e.g. neighborhoods) and
  // specialty California landings do not match these rules.
  const segments = pathname.split("/").filter(Boolean);
  let locationTarget: string | null = null;
  if (segments[0] === "discover" && segments.length === 2) {
    locationTarget = legacyDiscoverTarget(segments[1]);
  } else if (segments[0] === "discover" && segments.length === 3 && getClusterConfig(segments[2])) {
    locationTarget = legacyClusterTarget(segments[1], segments[2]);
  } else if (segments[0] === "california" && segments.length === 3 && segments[2] === "homes-for-sale") {
    const location = resolveCanonicalCityLocation(segments[1]);
    locationTarget = location ? canonicalCityBuyPath(location) : null;
  }
  if (locationTarget && locationTarget !== pathname) {
    const url = req.nextUrl.clone();
    url.pathname = locationTarget;
    return NextResponse.redirect(url, 308);
  }

  // ── 3. Build the response; forward pathname for LCP preload in layout ─────
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  const res = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Property context and campaign parameters hydrate the same static contact
  // page. Keep those useful URLs out of the index while the canonical remains
  // the clean /contact URL.
  if (pathname === "/contact" && req.nextUrl.searchParams.size > 0) {
    res.headers.set("X-Robots-Tag", "noindex, follow");
  }

  // ── 4. Attribution cookie persistence (90-day TTL) ───────────────────────
  // Persist UTM params and click IDs so the first-touch source is available
  // throughout the browsing session even after the query string is gone.
  const isProduction = process.env.NODE_ENV === "production";

  for (const key of TRACKING_PARAMS) {
    const value = req.nextUrl.searchParams.get(key);
    if (value) {
      res.cookies.set(key, value, {
        path:     "/",
        maxAge:   60 * 60 * 24 * 90,   // 90 days
        httpOnly: true,                  // not readable by JS — reduces XSS surface
        sameSite: "lax",
        secure:   isProduction,
      });
    }
  }

  // ── 5. Private routes: prevent shared-cache poisoning ───────────────────
  // Without these headers a CDN (or browser bfcache) could serve one user's
  // authenticated page to a different user.
  if (PRIVATE_PATH_PREFIXES.some((p) => pathname.startsWith(p))) {
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.headers.set("Pragma", "no-cache");
  }
  // ── 6. Property pages: publicly cacheable, revalidate hourly ────────────
  else if (pathname.startsWith('/properties/')) {
    const edgeCachePolicy = 'public, s-maxage=3600, stale-while-revalidate=86400';
    res.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    res.headers.set('CDN-Cache-Control', edgeCachePolicy);
    res.headers.set('Vercel-CDN-Cache-Control', edgeCachePolicy);
  }
  else {
    // ── 7. Public marketing pages: allow bfcache ───────────────────────────
    // Explicitly avoid no-store so the back/forward cache can restore these
    // pages and speed up return navigations (Lighthouse bfcache audit).
    res.headers.set(
      "Cache-Control",
      "public, max-age=0, must-revalidate"
    );
  }

  return res;
}

// ── Matcher ───────────────────────────────────────────────────────────────────
// Telling Next.js exactly which paths need the middleware is a meaningful
// performance win: the Edge worker process is skipped entirely for static
// assets, so images, fonts, and JS bundles are served at full CDN speed.
export const config = {
  matcher: [
    // API routes (rate limiting)
    "/api/:path*",
    // App shell & key pages where attribution / cache headers matter
    "/",
    "/properties",
    "/properties/:path*",
    "/(california|buy|rent|sell|map|contact|auth|login|register|forgot-password|dashboard|profile|admin|settings|saved|discover)/:path*",
  ],
};
