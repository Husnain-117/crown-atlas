/**
 * /api/mortgage/current-rate
 *
 * Public endpoint — returns the current 30-year fixed mortgage rate.
 *
 * The rate is served from Redis cache (written by the daily cron job or on
 * first-ever request if the cache is cold).  Typical response time:
 *   - Redis HIT  : ~5 ms
 *   - Redis MISS : ~400–800 ms (FRED network round-trip)
 *   - No FRED key: labelled fallback estimate
 *
 * Response headers:
 *   X-Cache: HIT | MISS | FALLBACK
 *   Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400
 *     → Vercel Edge caches the response for 1 hour; serves stale for 24 h
 *       while the CDN silently revalidates in the background.
 *
 * Example response:
 * {
 *   "rate": 6.89,
 *   "date": "2026-03-06",
 *   "source": "FRED/MORTGAGE30US",
 *   "cachedAt": "2026-03-07T14:00:00.000Z"
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentMortgageRate, getFallbackMortgageRate } from "@/lib/mortgage-rate";
import { rget } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Cache key kept in sync with mortgage-rate.ts */
const CACHE_KEY = "mortgage:v1:30yr-fixed";

export async function GET(_request: NextRequest): Promise<NextResponse> {
  // ── Detect Redis HIT before calling the lib function ─────────────────────
  // This lets us set the correct X-Cache header without duplicating logic.
  const cached = await rget(CACHE_KEY);
  const isHit = cached !== null;

  const rate = (await getCurrentMortgageRate()) ?? getFallbackMortgageRate();

  return NextResponse.json(
    {
      rate: rate.rate,
      date: rate.date,
      source: rate.source,
      cachedAt: new Date(rate.cachedAt).toISOString(),
      isEstimate: rate.source === "Fallback estimate",
    },
    {
      headers: {
        // Allow CDN to cache for 1 hour; serve stale for up to 24 h while
        // revalidating — aligns with the Redis TTL and daily cron cadence.
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        // Inform callers whether this was served from Redis or freshly fetched
        "X-Cache": rate.source === "Fallback estimate" ? "FALLBACK" : isHit ? "HIT" : "MISS",
      },
    }
  );
}
