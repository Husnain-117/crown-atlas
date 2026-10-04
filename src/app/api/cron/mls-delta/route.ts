/**
 * /api/cron/mls-delta
 *
 * Vercel Cron endpoint — runs the scheduled daily MLS delta sync.
 *
 * On each invocation it:
 *   1. Authenticates the caller via CRON_SECRET (Bearer token).
 *   2. Runs `runDeltaSync()` which queries the Trestle OData API for listings
 *      modified since the last successful run and UPSERTs them into Cloud SQL.
 *   3. Invalidates Redis plus tagged Vercel CDN and Runtime Cache entries so
 *      the next property request fetches fresh data from the database.
 *   4. Returns a structured JSON response with sync statistics.
 *
 * Security:
 *   Vercel forwards `Authorization: Bearer <CRON_SECRET>` on every scheduled
 *   invocation. Manual calls must include the same header — this prevents
 *   unauthenticated callers from triggering expensive sync runs.
 *
 * Schedule: daily at 03:00 UTC — `"0 3 * * *"` in vercel.json.
 *
 * Manual invocation (debugging / backfill):
 *   curl -X GET https://your-domain.com/api/cron/mls-delta \
 *     -H "Authorization: Bearer $CRON_SECRET"
 *
 *   Force a wider lookback window:
 *   curl -X GET "https://your-domain.com/api/cron/mls-delta?window=60" \
 *     -H "Authorization: Bearer $CRON_SECRET"
 */

import { NextRequest, NextResponse } from "next/server";
import { runDeltaSync } from "@/lib/trestle-delta";
import { rdelPattern } from "@/lib/redis";
import { authorizeServerRequest } from "@/lib/server-route-auth";
import { PROPERTY_CACHE_TAG } from "@/lib/cache/public-cache";
import { invalidateVercelCacheTags } from "@/lib/cache/vercel-runtime";

export const runtime    = "nodejs";
export const dynamic    = "force-dynamic";
export const maxDuration = 290; // Vercel serverless limit is 300 s; leave 10 s headroom.

export async function GET(request: NextRequest): Promise<NextResponse> {
  const unauthorized = authorizeServerRequest(request, "cron");
  if (unauthorized) return unauthorized;

  // ── Optional: manual window override (minutes) ─────────────────────────────
  // Useful for backfill runs: ?window=60 fetches last 60 minutes of changes.
  const windowParam = new URL(request.url).searchParams.get("window");
  const forceWindow = windowParam ? Math.min(Math.max(1, Number(windowParam)), 1440) : undefined;

  // ── Run sync ───────────────────────────────────────────────────────────────
  const result = await runDeltaSync(forceWindow);

  // ── Invalidate Redis property-search cache ─────────────────────────────────
  // Only bother if the sync actually modified rows so crawl-only runs don't
  // flush a warm cache unnecessarily.
  let cacheKeysDropped = 0;
  let vercelCacheInvalidation: "global" | "runtime" | "unavailable" | "skipped" = "skipped";
  if (result.upserted > 0) {
    [cacheKeysDropped, vercelCacheInvalidation] = await Promise.all([
      rdelPattern("props:v1:*"),
      invalidateVercelCacheTags([PROPERTY_CACHE_TAG]),
    ]);
    if (cacheKeysDropped > 0) {
      console.info(`[cron/mls-delta] Dropped ${cacheKeysDropped} cached property-search keys`);
    }
  }

  // ── Response ───────────────────────────────────────────────────────────────
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        jobId:       result.jobId,
        fetched:     result.fetched,
        upserted:    result.upserted,
        failed:      result.failed,
        windowStart: result.windowStart,
        windowEnd:   result.windowEnd,
        durationMs:  result.durationMs,
        error:       result.error ?? "Delta sync failed — see server logs for details.",
        cacheKeysDropped,
        vercelCacheInvalidation,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok:              true,
    jobId:           result.jobId,
    fetched:         result.fetched,
    upserted:        result.upserted,
    failed:          result.failed,
    windowStart:     result.windowStart,
    windowEnd:       result.windowEnd,
    durationMs:      result.durationMs,
    cacheKeysDropped,
    vercelCacheInvalidation,
  });
}
