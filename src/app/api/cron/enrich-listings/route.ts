/**
 * /api/cron/enrich-listings
 *
 * Vercel Cron endpoint — runs the property enrichment pipeline every 6 hours.
 *
 * Each invocation:
 *   1. Authenticates via CRON_SECRET bearer token.
 *   2. Fetches up to `batch` Active listings whose enrichment_synced_at is
 *      NULL or older than 30 days (never-enriched listings first).
 *   3. For each listing runs Walk Score, GreatSchools, FEMA Flood, and
 *      CAL FIRE enrichers in parallel (Promise.allSettled per listing).
 *   4. Writes the merged results back with COALESCE so a disabled enricher
 *      never overwrites a valid value from a prior run.
 *   5. Returns structured JSON with enrichment statistics.
 *
 * Schedule: every 6 hours — `"0 * /6 * * *"` in vercel.json (without space).
 *   At the default batch=50 that enriches ~200 listings/day.
 *   For initial backfill use ?batch=200 or run multiple times manually.
 *
 * Manual invocation:
 *   curl -X GET https://your-domain.com/api/cron/enrich-listings \
 *     -H "Authorization: Bearer $CRON_SECRET"
 *
 *   Larger batch for backfill:
 *   curl -X GET "https://your-domain.com/api/cron/enrich-listings?batch=200" \
 *     -H "Authorization: Bearer $CRON_SECRET"
 *
 *   Process all statuses (not just Active) for historical backfill:
 *   curl -X GET "https://your-domain.com/api/cron/enrich-listings?batch=200&status=Sold" \
 *     -H "Authorization: Bearer $CRON_SECRET"
 */

import { NextRequest, NextResponse } from "next/server";
import { enrichBatch } from "@/lib/enrichment";
import { authorizeServerRequest } from "@/lib/server-route-auth";

export const runtime     = "nodejs";
export const dynamic     = "force-dynamic";
export const maxDuration = 290; // Full Vercel limit minus 10 s headroom.

export async function GET(request: NextRequest): Promise<NextResponse> {
  const unauthorized = authorizeServerRequest(request, "cron");
  if (unauthorized) return unauthorized;

  // ── Optional query params ──────────────────────────────────────────────────
  const { searchParams } = new URL(request.url);

  // batch: clamp to [1, 500] — 500 is the safe upper bound within 290 s.
  const rawBatch  = searchParams.get("batch");
  const batchSize = rawBatch
    ? Math.min(Math.max(1, Number(rawBatch)), 500)
    : 50;

  // status: default "Active"; pass any valid MLS StandardStatus for targeted runs.
  const status = searchParams.get("status") ?? "Active";

  // ── Run enrichment ─────────────────────────────────────────────────────────
  console.info(
    `[cron/enrich-listings] Starting — batch=${batchSize} status="${status}"`
  );

  const result = await enrichBatch(batchSize, status);

  console.info(
    `[cron/enrich-listings] Done — ` +
      `processed=${result.processed} enriched=${result.enriched} ` +
      `skipped=${result.skipped} failed=${result.failed} ` +
      `duration=${result.durationMs}ms`
  );

  return NextResponse.json({
    ok:         true,
    batchSize,
    status,
    processed:  result.processed,
    enriched:   result.enriched,
    skipped:    result.skipped,
    failed:     result.failed,
    durationMs: result.durationMs,
  });
}
