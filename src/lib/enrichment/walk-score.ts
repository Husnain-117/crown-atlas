/**
 * Walk Score enricher
 *
 * Walk Score Public API: https://www.walkscore.com/professional/api.php
 *
 * Required env var:
 *   WALK_SCORE_API_KEY — free API key from walkscore.com/professional
 *
 * Columns written:
 *   walk_score    (0–100)  — pedestrian friendliness
 *   transit_score (0–100)  — public transit quality
 *   bike_score    (0–100)  — bikeability
 *
 * Rate limits (free tier): 5,000 requests / day.
 *
 * Caching: results are cached in Redis for 7 days keyed to the coordinate
 * truncated to 3 decimal places (~111 m resolution), so two units in the
 * same building share the cached result without an extra API call.
 *
 * Graceful degradation: returns `{}` when WALK_SCORE_API_KEY is absent,
 * so the orchestrator leaves existing DB values untouched.
 */

import { rget, rset } from "@/lib/redis";
import type { ListingInput, EnrichmentPatch } from "./types";

const API_BASE = "https://api.walkscore.com/score";

/** Cache TTL: 7 days — walk scores change at most quarterly. */
const CACHE_TTL_S = 7 * 24 * 60 * 60;

/** Walk Score API status code for a successful response. */
const WS_OK = 1;

/** Walk Score API status code indicating the daily quota is exhausted. */
const WS_RATE_LIMITED = 30;

function cacheKey(lat: number, lng: number): string {
  // 3 decimal places ≈ 111 m — fine for neighbourhood-level sharing.
  return `enrich:v1:ws:${lat.toFixed(3)}:${lng.toFixed(3)}`;
}

export async function enrichWithWalkScore(
  listing: ListingInput
): Promise<Partial<EnrichmentPatch>> {
  const apiKey = process.env.WALK_SCORE_API_KEY;
  if (!apiKey) return {};

  // ── Redis cache hit ──────────────────────────────────────────────────────
  const key = cacheKey(listing.latitude, listing.longitude);
  const cached = await rget(key);
  if (cached) {
    try { return JSON.parse(cached) as Partial<EnrichmentPatch>; } catch { /* fall through */ }
  }

  // ── Build request ────────────────────────────────────────────────────────
  const address =
    listing.unparsed_address ??
    [listing.city, listing.state_or_province].filter(Boolean).join(", ");

  const params = new URLSearchParams({
    format:   "json",
    address:  address,
    lat:      String(listing.latitude),
    lon:      String(listing.longitude),
    transit:  "1",
    bike:     "1",
    wsapikey: apiKey,
  });

  const res = await fetch(`${API_BASE}?${params}`, {
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) throw new Error(`Walk Score HTTP ${res.status}`);

  // Walk Score always returns 200; errors are signalled via the `status` field.
  const data = await res.json() as Record<string, any>;

  // Rate limited or invalid key — throw so the listing is not marked enriched
  // and will be retried on the next cron run.
  if (data.status === WS_RATE_LIMITED) {
    throw new Error("Walk Score daily quota exceeded");
  }
  if (data.status !== WS_OK) {
    // Covers: 2 (score pending), 40–45 (bad location / no data).
    // Return empty so enrichment_synced_at is stamped but columns stay null —
    // avoids infinite retries for addresses Walk Score genuinely can't serve.
    return {};
  }

  const patch: Partial<EnrichmentPatch> = {
    walk_score:    typeof data.walkscore         === "number" ? data.walkscore         : null,
    transit_score: typeof data.transit?.score    === "number" ? data.transit.score     : null,
    bike_score:    typeof data.bike?.score       === "number" ? data.bike.score        : null,
  };

  // Cache the result so nearby listings skip the API call entirely.
  await rset(key, JSON.stringify(patch), CACHE_TTL_S);
  return patch;
}
