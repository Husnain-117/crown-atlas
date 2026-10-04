/**
 * /api/cron/mortgage-rates
 *
 * Vercel Cron endpoint — refreshes the FRED mortgage rate cache daily.
 *
 * Security: protected by CRON_SECRET bearer token (set in Vercel env vars).
 * Vercel forwards this as `Authorization: Bearer <secret>` on every cron call.
 *
 * Schedule: weekdays at 14:00 UTC (6:00 AM Pacific, before US market open)
 * Configured in vercel.json — see the crons array.
 *
 * Idempotent: safe to call manually via curl for debugging/backfill.
 *   curl -X GET https://your-domain.com/api/cron/mortgage-rates \
 *     -H "Authorization: Bearer $CRON_SECRET"
 */

import { NextRequest, NextResponse } from "next/server";
import { refreshMortgageRateCache } from "@/lib/mortgage-rate";
import { authorizeServerRequest } from "@/lib/server-route-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const unauthorized = authorizeServerRequest(request, "cron");
  if (unauthorized) return unauthorized;

  // ── Refresh ───────────────────────────────────────────────────────────────
  const started = Date.now();
  const rate = await refreshMortgageRateCache();

  if (!rate) {
    // FRED_API_KEY missing or FRED returned an error — log and surface clearly
    console.error("[cron/mortgage-rates] Failed to refresh mortgage rate cache");
    return NextResponse.json(
      {
        ok: false,
        error:
          "Failed to fetch from FRED. Check FRED_API_KEY and FRED API availability.",
      },
      { status: 502 }
    );
  }

  const durationMs = Date.now() - started;
  console.info(
    `[cron/mortgage-rates] Refreshed: ${rate.rate}% (${rate.date}) in ${durationMs}ms`
  );

  return NextResponse.json({
    ok: true,
    rate: rate.rate,
    date: rate.date,
    cachedAt: new Date(rate.cachedAt).toISOString(),
    durationMs,
  });
}
