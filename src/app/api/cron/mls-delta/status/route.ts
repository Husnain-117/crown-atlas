/**
 * /api/cron/mls-delta/status
 *
 * Public health / observability endpoint for the MLS delta-sync pipeline.
 *
 * Returns:
 *   - The last successful sync run (from `sync_jobs_last_success` view).
 *   - The most recent run in any state (can be used to detect stuck/failed jobs).
 *   - A `healthy` flag: true when a success exists and is less than 15 minutes old.
 *   - A `staleCount` of jobs currently stuck in `running` state > 30 min
 *     (exposes the `sync_jobs_stale` view).
 *
 * This endpoint is intentionally public (no auth) — it exposes only aggregate
 * operational metadata, not any listing or user data.
 *
 * Cache-Control: short TTL so monitoring dashboards get near-real-time data.
 */

import { NextResponse } from "next/server";
import { getPgPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LastSuccessRow {
  job_type:         string;
  id:               string;
  completed_at:     Date | null;
  records_inserted: number | null;
  records_updated:  number | null;
  duration_ms:      number | null;
}

interface RecentRow {
  id:             string;
  status:         string;
  started_at:     Date | null;
  completed_at:   Date | null;
  records_fetched: number | null;
  records_inserted: number | null;
  records_failed: number | null;
  error_message:  string | null;
}

/** A sync is considered healthy if there's been a success within 15 minutes. */
const HEALTHY_WINDOW_MS = 15 * 60 * 1_000;

export async function GET(): Promise<NextResponse> {
  try {
    const pool = await getPgPool();

    const [lastSuccessRes, recentRes, staleRes] = await Promise.all([
      // Last successful run from the view created in migration 005
      pool.query<LastSuccessRow>(
        `SELECT job_type, id, completed_at, records_inserted, records_updated, duration_ms
         FROM   sync_jobs_last_success
         WHERE  job_type = 'trestle_listing_delta'`
      ),
      // Most recent run in any state (including failures)
      pool.query<RecentRow>(
        `SELECT id, status, started_at, completed_at,
                records_fetched, records_inserted, records_failed, error_message
         FROM   sync_jobs
         WHERE  job_type = 'trestle_listing_delta'
         ORDER  BY created_at DESC
         LIMIT  1`
      ),
      // Count of jobs stuck in running > 30 min (from migration-005 view)
      pool.query<{ count: string }>(
        `SELECT COUNT(*)::TEXT AS count FROM sync_jobs_stale
         WHERE  job_type = 'trestle_listing_delta'`
      ),
    ]);

    const lastSuccess = lastSuccessRes.rows[0] ?? null;
    const recent      = recentRes.rows[0]      ?? null;
    const staleCount  = Number(staleRes.rows[0]?.count ?? 0);

    const healthy =
      lastSuccess?.completed_at != null &&
      Date.now() - new Date(lastSuccess.completed_at).getTime() < HEALTHY_WINDOW_MS;

    return NextResponse.json(
      {
        healthy,
        staleCount,
        lastSuccess: lastSuccess
          ? {
              completedAt:  lastSuccess.completed_at,
              upserted:     lastSuccess.records_inserted ?? lastSuccess.records_updated,
              durationMs:   lastSuccess.duration_ms,
            }
          : null,
        mostRecentRun: recent
          ? {
              status:       recent.status,
              startedAt:    recent.started_at,
              completedAt:  recent.completed_at,
              fetched:      recent.records_fetched,
              upserted:     recent.records_inserted,
              failed:       recent.records_failed,
            }
          : null,
        checkedAt: new Date().toISOString(),
      },
      {
        headers: {
          // Allow CDN / browser to cache briefly — stale data is acceptable here.
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("[cron/mls-delta/status] DB error:", err);
    return NextResponse.json(
      { healthy: false, error: "Service unavailable" },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
