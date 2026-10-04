/**
 * trestle-delta.ts
 *
 * MLS delta-sync engine — Phase 2, Data Depth.
 *
 * Responsibilities:
 *   1. Determine the sync window start by reading the last successful
 *      `trestle_listing_delta` row from the `sync_jobs` table.
 *      Falls back to `MLS_DELTA_WINDOW_MINUTES` (default 10) on the first run.
 *   2. Fetch all Trestle listings modified since that timestamp using
 *      `ModificationTimestamp ge <ISO>` OData filter.
 *   3. UPSERT each listing into the Cloud SQL `properties` table via `getPgPool()`.
 *      The PostGIS `geom` column is kept in sync automatically by the existing
 *      `trg_sync_geom` trigger (created in migration 002).
 *   4. Write a completed `sync_jobs` row (or update the running row to
 *      success/failed) so the next run can use the exact window end time.
 *   5. Return structured stats for the cron route to forward as its response.
 *
 * Design invariants:
 *   – Uses `getPgPool()` from `@/lib/db`; PostgreSQL is the property source of truth.
 *   – `media_urls` and `main_photo_url` are intentionally excluded from the
 *     UPSERT SET clause so that enrichment-layer data is never overwritten by
 *     the raw Trestle feed.
 *   – All write paths are idempotent: duplicate runs with the same window
 *     produce the same result (UPSERT ON CONFLICT listing_key).
 *   – Errors in a single batch do not abort the whole run: each batch is
 *     wrapped individually and partial failures increment `records_failed`.
 */

import { getPgPool } from "@/lib/db";
import { ensureListingHistorySchema } from "@/lib/db/listing-history-schema";
import { TrestleApiService } from "@/lib/trestle-service";
import type { TrestleProperty } from "@/lib/trestle-types";

// ── Constants ──────────────────────────────────────────────────────────────────

/** Job type key stored in `sync_jobs.job_type`. */
const JOB_TYPE = "trestle_listing_delta";

/** Default delta window in minutes when no prior success exists. */
const DEFAULT_WINDOW_MINUTES = Number(process.env.MLS_DELTA_WINDOW_MINUTES ?? 10);

/** Maximum number of listings to fetch per run (guards against runway fetches). */
const MAX_RECORDS = Number(process.env.MLS_DELTA_MAX_RECORDS ?? 2_000);

/** Number of listings to UPSERT per PostgreSQL statement (keeps payload small). */
const DB_BATCH_SIZE = 100;

// ── Return type ────────────────────────────────────────────────────────────────

export interface DeltaSyncResult {
  ok: boolean;
  jobId: string | null;
  fetched: number;
  upserted: number;
  failed: number;
  windowStart: string;
  windowEnd: string;
  durationMs: number;
  error?: string;
}

// ── Trestle service singleton ──────────────────────────────────────────────────

function getTrestleService(): TrestleApiService {
  const apiId       = process.env.TRESTLE_API_ID       ?? process.env.TRESTLE_CLIENT_ID ?? "";
  const apiPassword = process.env.TRESTLE_API_PASSWORD  ?? process.env.TRESTLE_CLIENT_SECRET ?? "";
  const baseUrl     = process.env.TRESTLE_BASE_URL      ?? "https://api.trestle.com/v2";
  const oauthUrl    = process.env.TRESTLE_OAUTH_URL     ?? "https://api.trestle.com/v2/connect/token";

  return new TrestleApiService({ apiId, apiPassword, baseUrl, oauthUrl });
}

// ── Sync-jobs helpers ──────────────────────────────────────────────────────────

/**
 * Read the completed_at timestamp of the last successful delta run.
 * Returns `null` when no prior success exists (first run).
 */
async function getLastSuccessTime(): Promise<Date | null> {
  const pool = await getPgPool();
  const { rows } = await pool.query<{ completed_at: Date }>(
    `SELECT completed_at
     FROM   sync_jobs
     WHERE  job_type = $1
       AND  status   = 'success'
     ORDER  BY completed_at DESC
     LIMIT  1`,
    [JOB_TYPE]
  );
  return rows[0]?.completed_at ?? null;
}

/**
 * Insert a `running` sync_jobs row and return its UUID.
 * Used to track the job even if the worker crashes mid-run.
 */
async function insertRunningJob(
  windowStart: Date,
  windowEnd: Date
): Promise<string> {
  const pool = await getPgPool();
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO sync_jobs
       (job_type, status, started_at, triggered_by, metadata)
     VALUES
       ($1, 'running', NOW(), 'cron', $2)
     RETURNING id`,
    [
      JOB_TYPE,
      JSON.stringify({
        window_start: windowStart.toISOString(),
        window_end:   windowEnd.toISOString(),
      }),
    ]
  );
  return rows[0].id;
}

/**
 * Finalise the sync_jobs row: mark success or failed, write counters.
 */
async function finaliseJob(
  jobId: string,
  status: "success" | "partial" | "failed",
  counters: { fetched: number; upserted: number; failed: number },
  errorMessage?: string
): Promise<void> {
  const pool = await getPgPool();
  await pool.query(
    `UPDATE sync_jobs
     SET    status          = $2,
            records_fetched  = $3,
            records_inserted = $4,
            records_updated  = $4,
            records_failed   = $5,
            completed_at     = NOW(),
            error_message    = $6,
            updated_at       = NOW()
     WHERE  id = $1`,
    [
      jobId,
      status,
      counters.fetched,
      counters.upserted,
      counters.failed,
      errorMessage ?? null,
    ]
  );
}

// ── UPSERT batch ───────────────────────────────────────────────────────────────

/**
 * Map a TrestleProperty to the subset of `properties` columns that the delta
 * sync is authoritative for. Columns managed by the enrichment layer
 * (`media_urls`, `main_photo_url`) are deliberately excluded so that
 * enriched image data is never overwritten by the raw feed.
 */
function buildUpsertRow(p: TrestleProperty): Record<string, unknown> {
  return {
    listing_key:                  p.ListingKey,
    standard_status:              p.StandardStatus              ?? null,
    mls_status:                   p.MlsStatus                   ?? null,
    property_type:                p.PropertyType                ?? null,
    property_sub_type:            p.PropertySubType             ?? null,
    list_price:                   p.ListPrice                   ?? null,
    original_list_price:          p.OriginalListPrice           ?? null,
    price_change_timestamp:       p.PriceChangeTimestamp        ?? null,
    listing_contract_date:        p.ListingContractDate         ?? null,
    on_market_date:               p.OnMarketDate                ?? null,
    close_date:                   p.CloseDate                   ?? null,
    close_price:                  p.ClosePrice                  ?? null,
    bedrooms_total:               p.BedroomsTotal               ?? null,
    bathrooms_total_integer:      p.BathroomsTotalInteger       ?? null,
    living_area:                  p.LivingArea                  ?? null,
    lot_size_sq_ft:               p.LotSizeSquareFeet           ?? null,
    year_built:                   p.YearBuilt                   ?? null,
    photos_count:                 p.PhotosCount                 ?? null,
    days_on_market:               p.DaysOnMarket                ?? null,
    cumulative_days_on_market:    p.CumulativeDaysOnMarket      ?? null,
    city:                         p.City                        ?? null,
    state_or_province:            p.StateOrProvince             ?? null,
    postal_code:                  p.PostalCode                  ?? null,
    latitude:                     p.Latitude                    ?? null,
    longitude:                    p.Longitude                   ?? null,
    unparsed_address:             p.UnparsedAddress             ?? null,
    listing_agent_full_name:      p.ListAgentFullName           ?? null,
    list_office_name:             p.ListOfficeName              ?? null,
    public_remarks:               p.PublicRemarks               ?? null,
    private_remarks:              p.PrivateRemarks              ?? null,
    pool_private_yn:              p.PoolPrivateYN               ?? null,
    waterfront_yn:                p.WaterfrontYN                ?? null,
    view_yn:                      p.ViewYN                      ?? null,
    parking_total:                p.ParkingTotal                ?? null,
    garage_spaces:                p.GarageSpaces                ?? null,
    hoa_fee:                      p.AssociationFee              ?? null,
    hoa_fee_frequency:            p.AssociationFeeFrequency     ?? null,
    tax_annual_amount:            p.TaxAnnualAmount             ?? null,
    school_district:              p.HighSchoolDistrict          ?? p.ElementarySchoolDistrict ?? p.SchoolDistrictName ?? null,
    elementary_school:            p.ElementarySchool            ?? p.ElementarySchoolName     ?? null,
    middle_school:                p.MiddleOrJuniorSchool        ?? p.MiddleOrJuniorSchoolName ?? null,
    high_school:                  p.HighSchool                  ?? p.HighSchoolName           ?? null,
    modification_timestamp:       p.ModificationTimestamp       ?? null,
    last_seen_ts:                 new Date().toISOString(),
  };
}

// Use a stable ordered list of columns for deterministic SQL generation.
const UPSERT_COLUMNS = [
  "listing_key",
  "standard_status",
  "mls_status",
  "property_type",
  "property_sub_type",
  "list_price",
  "original_list_price",
  "price_change_timestamp",
  "listing_contract_date",
  "on_market_date",
  "close_date",
  "close_price",
  "bedrooms_total",
  "bathrooms_total_integer",
  "living_area",
  "lot_size_sq_ft",
  "year_built",
  "photos_count",
  "days_on_market",
  "cumulative_days_on_market",
  "city",
  "state_or_province",
  "postal_code",
  "latitude",
  "longitude",
  "unparsed_address",
  "listing_agent_full_name",
  "list_office_name",
  "public_remarks",
  "private_remarks",
  "pool_private_yn",
  "waterfront_yn",
  "view_yn",
  "parking_total",
  "garage_spaces",
  "hoa_fee",
  "hoa_fee_frequency",
  "tax_annual_amount",
  "school_district",
  "elementary_school",
  "middle_school",
  "high_school",
  "modification_timestamp",
  "last_seen_ts",
] as const;

/** UPDATE SET clause — excludes listing_key (conflict target), created_at, media_urls, main_photo_url. */
const UPDATE_SET = UPSERT_COLUMNS.filter((c) => c !== "listing_key")
  .map((c) => `${c} = EXCLUDED.${c}`)
  .join(",\n    ");

/**
 * Upsert a batch of TrestleProperty records into the `properties` table.
 * Returns the number of rows affected.
 *
 * Uses a multi-row VALUES list to minimise round-trips.
 * All values are parameterised — no string concatenation of external data.
 */
async function upsertBatch(batch: TrestleProperty[]): Promise<number> {
  if (batch.length === 0) return 0;

  const pool = await getPgPool();
  await ensureListingHistorySchema(pool);
  const values: unknown[] = [];
  const rowPlaceholders: string[] = [];

  for (const prop of batch) {
    const row = buildUpsertRow(prop);
    const startIdx = values.length + 1;
    const placeholders = UPSERT_COLUMNS.map((_, i) => `$${startIdx + i}`).join(", ");
    rowPlaceholders.push(`(${placeholders})`);
    UPSERT_COLUMNS.forEach((col) => values.push(row[col] ?? null));
  }

  const sql = `
    INSERT INTO properties (${UPSERT_COLUMNS.join(", ")})
    VALUES ${rowPlaceholders.join(",\n    ")}
    ON CONFLICT (listing_key) DO UPDATE SET
    ${UPDATE_SET},
    updated_at = NOW()
  `;

  const result = await pool.query(sql, values);
  return result.rowCount ?? 0;
}

// ── Public entry point ─────────────────────────────────────────────────────────

/**
 * Run one delta-sync cycle.
 *
 * Called by the `/api/cron/mls-delta` Vercel Cron handler.
 * Safe to call manually for backfill or debugging.
 *
 * @param forceWindowMinutes  Override the lookback window (useful for manual backfill).
 */
export async function runDeltaSync(
  forceWindowMinutes?: number
): Promise<DeltaSyncResult> {
  const runStart = Date.now();
  const windowEnd = new Date();

  // ── Auto-clear stuck jobs ──────────────────────────────────────────────────
  try {
    const pool = await getPgPool();
    await pool.query(`
      UPDATE sync_jobs
      SET status = 'failed',
          error_message = 'Job timed out and was cleared by subsequent run',
          updated_at = NOW(),
          completed_at = NOW()
      WHERE status = 'running'
        AND started_at < NOW() - INTERVAL '2 hours'
    `);
  } catch (err) {
    console.warn("[delta] Failed to auto-clear stale jobs:", err);
  }

  // ── Determine window start ─────────────────────────────────────────────────
  let windowStart: Date;
  const lastSuccess = forceWindowMinutes
    ? null
    : await getLastSuccessTime().catch(() => null);

  if (lastSuccess) {
    // Overlap by 30 s to guard against clock skew between Vercel and Trestle.
    windowStart = new Date(lastSuccess.getTime() - 30_000);
  } else {
    const minutes = forceWindowMinutes ?? DEFAULT_WINDOW_MINUTES;
    windowStart = new Date(windowEnd.getTime() - minutes * 60_000);
  }

  // ── Insert running job ─────────────────────────────────────────────────────
  let jobId: string | null = null;
  try {
    jobId = await insertRunningJob(windowStart, windowEnd);
  } catch (err) {
    // Non-fatal: if sync_jobs is unavailable keep going — we still want to sync.
    console.warn("[delta] Failed to insert sync_jobs row:", err);
  }

  const counters = { fetched: 0, upserted: 0, failed: 0 };

  try {
    // ── Fetch from Trestle ───────────────────────────────────────────────────
    console.info(
      `[delta] Fetching listings modified since ${windowStart.toISOString()} (maxRecords=${MAX_RECORDS})`
    );

    const trestle = getTrestleService();
    const properties = await trestle.getRecentlyUpdatedProperties(
      // Convert the exact window start to an "hoursAgo" equivalent.
      // getRecentlyUpdatedProperties only accepts integer hours — we build a
      // fractional hours value and let the service compute the timestamp.
      (windowEnd.getTime() - windowStart.getTime()) / (1000 * 60 * 60)
    );

    const slice = properties.slice(0, MAX_RECORDS);
    counters.fetched = slice.length;

    console.info(`[delta] Fetched ${counters.fetched} listings`);

    // ── UPSERT in batches ────────────────────────────────────────────────────
    for (let i = 0; i < slice.length; i += DB_BATCH_SIZE) {
      const batch = slice.slice(i, i + DB_BATCH_SIZE);
      try {
        const affected = await upsertBatch(batch);
        counters.upserted += affected;
      } catch (batchErr) {
        counters.failed += batch.length;
        console.error(
          `[delta] Batch ${Math.floor(i / DB_BATCH_SIZE) + 1} failed:`,
          batchErr
        );
      }
    }

    // ── Finalise job record ──────────────────────────────────────────────────
    const finalStatus =
      counters.failed === 0
        ? "success"
        : counters.upserted > 0
        ? "partial"
        : "failed";

    if (jobId) {
      await finaliseJob(jobId, finalStatus, counters).catch((e) =>
        console.warn("[delta] Failed to finalise sync_jobs row:", e)
      );
    }

    const durationMs = Date.now() - runStart;
    console.info(
      `[delta] Done — fetched=${counters.fetched} upserted=${counters.upserted} ` +
        `failed=${counters.failed} duration=${durationMs}ms status=${finalStatus}`
    );

    return {
      ok: finalStatus !== "failed",
      jobId,
      ...counters,
      windowStart: windowStart.toISOString(),
      windowEnd:   windowEnd.toISOString(),
      durationMs,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[delta] Fatal error:", err);

    if (jobId) {
      await finaliseJob(jobId, "failed", counters, message).catch(() => {});
    }

    return {
      ok: false,
      jobId,
      ...counters,
      windowStart: windowStart.toISOString(),
      windowEnd:   windowEnd.toISOString(),
      durationMs:  Date.now() - runStart,
      error:       message,
    };
  }
}
