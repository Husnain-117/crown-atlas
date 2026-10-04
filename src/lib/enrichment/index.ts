/**
 * Enrichment pipeline orchestrator — Phase 2, Section 2-B
 *
 * Runs Walk Score, GreatSchools, FEMA Flood, and CAL FIRE enrichers
 * in parallel for each listing in the queue, then persists the merged
 * results to the `properties` table in Cloud SQL.
 *
 * Queue strategy (prioritised ORDER BY in SQL):
 *   1. Active listings never enriched  (enrichment_synced_at IS NULL)
 *   2. Active listings stale > 30 days (enrichment_synced_at < NOW() - 30d)
 *   Within each tier: most recently modified listings first.
 *
 * Concurrency model:
 *   - Inner: all 4 enrichers per listing run via Promise.allSettled — one
 *     failure never blocks the others.
 *   - Outer: CONCURRENCY listings processed simultaneously — large enough to
 *     keep external APIs busy, small enough to avoid bursting rate limits.
 *
 * UPSERT safety:
 *   Uses COALESCE($n, existing_column) so a disabled enricher (no API key,
 *   or outside coverage area) never overwrites a valid value from a prior run.
 *
 * Exports:
 *   enrichBatch(batchSize?, status?)  — main entry point, called by cron
 *   enrichListingByKey(listingKey)    — on-demand single-listing enrichment
 */

import { getPgPool } from "@/lib/db";
import type { Pool } from "pg";

import { enrichWithWalkScore }    from "./walk-score";
import { enrichWithGreatSchools } from "./great-schools";
import { enrichWithFEMAFlood }    from "./fema-flood";
import { enrichWithCALFIRE }      from "./cal-fire";
import type { ListingInput, EnrichmentPatch } from "./types";

export type { ListingInput, EnrichmentPatch } from "./types";

// ── Config ────────────────────────────────────────────────────────────────────

/** Listings processed in parallel per chunk. */
const CONCURRENCY = 10;

/** Default batch size per cron invocation. */
const DEFAULT_BATCH_SIZE = 50;

// ── Public return type ────────────────────────────────────────────────────────

export interface EnrichBatchResult {
  processed:  number;
  enriched:   number;
  /** Never-had-data / outside-coverage — synced_at stamped, no column change. */
  skipped:    number;
  /** DB write succeeded but all 4 enrichers failed. */
  failed:     number;
  durationMs: number;
}

// ── DB helpers ────────────────────────────────────────────────────────────────

async function fetchQueue(
  pool:      Pool,
  batchSize: number,
  status:    string
): Promise<ListingInput[]> {
  const { rows } = await pool.query<ListingInput>(
    `SELECT
       listing_key,
       latitude::double precision AS latitude,
       longitude::double precision AS longitude,
       unparsed_address,
       city,
       state_or_province,
       postal_code
     FROM   properties
     WHERE  latitude          IS NOT NULL
       AND  longitude         IS NOT NULL
       AND  standard_status   = $1
       AND  (
             enrichment_synced_at IS NULL
          OR enrichment_synced_at < NOW() - INTERVAL '30 days'
       )
     ORDER BY enrichment_synced_at NULLS FIRST,
              modification_timestamp DESC NULLS LAST
     LIMIT  $2`,
    [status, batchSize]
  );
  return rows;
}

/**
 * Persist the enrichment patch for one listing.
 *
 * Uses COALESCE so a null from a disabled enricher never overwrites a real
 * value stored by a previous run.  `enrichment_synced_at` is always stamped
 * regardless of partial data — this prevents the listing from being re-queued
 * until the 30-day window elapses.
 */
async function applyPatch(
  pool:       Pool,
  listingKey: string,
  patch:      Partial<EnrichmentPatch>,
  errorNote:  string | null
): Promise<void> {
  await pool.query(
    `UPDATE properties
     SET
       walk_score           = COALESCE($2,  walk_score),
       transit_score        = COALESCE($3,  transit_score),
       bike_score           = COALESCE($4,  bike_score),
       flood_zone           = COALESCE($5,  flood_zone),
       flood_risk_score     = COALESCE($6,  flood_risk_score),
       fire_risk_score      = COALESCE($7,  fire_risk_score),
       school_rating        = COALESCE($8,  school_rating),
       enrichment_synced_at = NOW(),
       enrichment_error     = NULLIF($9,    ''),
       updated_at           = NOW()
     WHERE listing_key = $1`,
    [
      listingKey,
      patch.walk_score       ?? null,
      patch.transit_score    ?? null,
      patch.bike_score       ?? null,
      patch.flood_zone       ?? null,
      patch.flood_risk_score ?? null,
      patch.fire_risk_score  ?? null,
      patch.school_rating    ?? null,
      errorNote,
    ]
  );
}

// ── Per-listing logic ─────────────────────────────────────────────────────────

/** Return values used to tally the batch result. */
type ListingOutcome = "enriched" | "skipped" | "failed";

async function enrichOneListing(
  pool:    Pool,
  listing: ListingInput
): Promise<ListingOutcome> {
  // Run all 4 enrichers concurrently — one failure must not block others.
  const [walkResult, schoolResult, floodResult, fireResult] =
    await Promise.allSettled([
      enrichWithWalkScore(listing),
      enrichWithGreatSchools(listing),
      enrichWithFEMAFlood(listing),
      enrichWithCALFIRE(listing),
    ]);

  // Collect error messages for the DB audit column.
  const errors: string[] = [];
  const label = (name: string, r: PromiseSettledResult<unknown>) => {
    if (r.status === "rejected") {
      errors.push(`${name}: ${(r as PromiseRejectedResult).reason?.message ?? "unknown"}`);
    }
  };
  label("walk",   walkResult);
  label("school", schoolResult);
  label("flood",  floodResult);
  label("fire",   fireResult);

  // Merge successful patches (later entries overwrite earlier for same key).
  const patch: Partial<EnrichmentPatch> = {};
  if (walkResult.status   === "fulfilled") Object.assign(patch, walkResult.value);
  if (schoolResult.status === "fulfilled") Object.assign(patch, schoolResult.value);
  if (floodResult.status  === "fulfilled") Object.assign(patch, floodResult.value);
  if (fireResult.status   === "fulfilled") Object.assign(patch, fireResult.value);

  await applyPatch(pool, listing.listing_key, patch, errors.join("; ") || null);

  // Determine outcome for telemetry.
  if (errors.length === 4) return "failed";   // every enricher threw
  const hasData = Object.values(patch).some((v) => v !== undefined && v !== null);
  return hasData ? "enriched" : "skipped";
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Enrich a batch of Active listings that have never been enriched or whose
 * enrichment is older than 30 days.
 *
 * @param batchSize  Max listings to process per invocation (default 50).
 * @param status     MLS StandardStatus to filter — default "Active".
 *                   Pass "%" to process all statuses (useful for backfill).
 */
export async function enrichBatch(
  batchSize: number = DEFAULT_BATCH_SIZE,
  status:    string = "Active",
  providedPool?: Pool
): Promise<EnrichBatchResult> {
  const started = Date.now();
  const pool    = providedPool ?? await getPgPool();

  const listings = await fetchQueue(pool, batchSize, status);

  if (listings.length === 0) {
    return { processed: 0, enriched: 0, skipped: 0, failed: 0, durationMs: Date.now() - started };
  }

  let enriched = 0, skipped = 0, failed = 0;

  // Process in chunks to avoid a single burst of CONCURRENCY * 4 concurrent
  // external HTTP requests across the whole batch.
  for (let i = 0; i < listings.length; i += CONCURRENCY) {
    const chunk = listings.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      chunk.map((l) => enrichOneListing(pool, l))
    );
    for (const r of results) {
      if (r.status === "fulfilled") {
        if (r.value === "enriched") enriched++;
        else if (r.value === "skipped") skipped++;
        else failed++;
      } else {
        // enrichOneListing itself threw — shouldn't happen but guard anyway.
        failed++;
        console.error("[enrichment] Unhandled error in enrichOneListing:", r.reason);
      }
    }
  }

  return {
    processed:  listings.length,
    enriched,
    skipped,
    failed,
    durationMs: Date.now() - started,
  };
}

/**
 * Trigger immediate enrichment for a single listing (on-demand).
 * Useful for admin tools or post-import hooks.
 * Returns `null` — callers should re-fetch from the DB if they need the values.
 */
export async function enrichListingByKey(
  listingKey: string,
  providedPool?: Pool
): Promise<null> {
  const pool = providedPool ?? await getPgPool();
  const { rows } = await pool.query<ListingInput>(
    `SELECT listing_key,
            latitude::double precision AS latitude,
            longitude::double precision AS longitude,
            unparsed_address, city, state_or_province, postal_code
     FROM   properties
     WHERE  listing_key = $1
       AND  latitude    IS NOT NULL
       AND  longitude   IS NOT NULL
     LIMIT  1`,
    [listingKey]
  );
  if (!rows[0]) return null;
  await enrichOneListing(pool, rows[0]);
  return null;
}
