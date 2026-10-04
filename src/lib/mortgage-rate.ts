/**
 * src/lib/mortgage-rate.ts
 *
 * FRED API mortgage rate integration — Section 1-E.
 *
 * Fetches the 30-year fixed mortgage rate from the St. Louis Fed (FRED).
 * The result is cached in PostgreSQL and Redis for 24 hours so the public
 * endpoint stays fast and the Droplet can refresh it without Vercel compute.
 *
 * Series used:
 *   MORTGAGE30US — 30-year fixed-rate mortgage average (weekly, Freddie Mac)
 *   See: https://fred.stlouisfed.org/series/MORTGAGE30US
 *
 * Graceful degradation:
 *   - If Redis is unavailable → uses the shared PostgreSQL cache
 *   - If FRED_API_KEY is absent → uses FRED's public CSV graph export
 *   - If every FRED request fails → returns a clearly-labelled estimate so
 *     payment calculators continue to work
 *   - Forced cron refreshes still return `null` on failure so monitoring can
 *     detect a broken upstream integration
 */

import { rget, rset } from "@/lib/redis";
import { getPool } from "@/lib/db";
import type { Pool } from "pg";

// ── Constants ─────────────────────────────────────────────────────────────────

const FRED_BASE_URL = "https://api.stlouisfed.org/fred";
const FRED_CSV_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=MORTGAGE30US";
const SERIES_ID = "MORTGAGE30US";

/** Redis key — v1 prefix allows safe key-space refactors in future */
const CACHE_KEY = "mortgage:v1:30yr-fixed";

/**
 * Cache TTL in seconds.
 * FRED updates MORTGAGE30US weekly (Thursday) so 24-hour staleness is fine.
 * The cron job refreshes this every weekday morning anyway.
 */
const CACHE_TTL_S = 86_400; // 24 hours

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MortgageRate {
  /** Current rate as a percentage, e.g. 6.89 */
  rate: number;
  /** ISO 8601 date string of the FRED observation, e.g. "2026-03-06" */
  date: string;
  /** Unix timestamp (ms) of when this value was cached */
  cachedAt: number;
  /** Data source label */
  source: "FRED/MORTGAGE30US" | "Fallback estimate";
}

interface FredObservationResponse {
  observations: Array<{
    date: string;
    value: string; // "." when not yet released
  }>;
}

const DEFAULT_FALLBACK_RATE = 6.5;

/** Return a bounded estimate for calculators when live market data is absent. */
export function getFallbackMortgageRate(
  configuredRate = process.env.MORTGAGE_FALLBACK_RATE,
  now = Date.now()
): MortgageRate {
  const parsed = Number(configuredRate);
  const rate = Number.isFinite(parsed) && parsed >= 2 && parsed <= 15
    ? parsed
    : DEFAULT_FALLBACK_RATE;

  return {
    rate,
    date: new Date(now).toISOString().slice(0, 10),
    cachedAt: now,
    source: "Fallback estimate",
  };
}

// ── Core fetcher ──────────────────────────────────────────────────────────────

export function parseFredCsv(
  csv: string,
  cachedAt = Date.now()
): MortgageRate | null {
  const lines = csv.trim().split(/\r?\n/);
  for (let index = lines.length - 1; index > 0; index--) {
    const [date, rawValue] = lines[index].split(",");
    const value = Number(rawValue);
    if (/^\d{4}-\d{2}-\d{2}$/.test(date || "") && Number.isFinite(value)) {
      return {
        rate: value,
        date,
        cachedAt,
        source: "FRED/MORTGAGE30US",
      };
    }
  }
  return null;
}

async function fetchFromFredCsv(): Promise<MortgageRate | null> {
  try {
    const res = await fetch(FRED_CSV_URL, {
      headers: { Accept: "text/csv" },
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[mortgage-rate] FRED CSV returned ${res.status}`);
      return null;
    }

    const parsed = parseFredCsv(await res.text());
    if (parsed) return parsed;
    console.error("[mortgage-rate] FRED CSV contained no valid observation");
    return null;
  } catch (error) {
    console.error(
      "[mortgage-rate] FRED CSV fetch failed:",
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

/**
 * Fetches the most recent 30-year fixed mortgage rate from FRED.
 *
 * @returns Parsed `MortgageRate` object, or `null` on failure.
 */
async function fetchFromFred(): Promise<MortgageRate | null> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return fetchFromFredCsv();
  }

  const url = new URL(`${FRED_BASE_URL}/series/observations`);
  url.searchParams.set("series_id", SERIES_ID);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("sort_order", "desc");
  url.searchParams.set("limit", "5"); // Fetch last 5 to skip any "." values
  url.searchParams.set("observation_start", "2024-01-01");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8_000);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      // Never cache FRED responses in the Next.js data cache — we manage TTL
      // ourselves in Redis.
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`[mortgage-rate] FRED API returned ${res.status}`);
      return fetchFromFredCsv();
    }

    const json = (await res.json()) as FredObservationResponse;
    const observations = json?.observations ?? [];

    // Find the first observation that has a real numeric value (not ".")
    const latest = observations.find((o) => o.value !== "." && !isNaN(Number(o.value)));

    if (!latest) {
      console.error("[mortgage-rate] No valid observation found in FRED response");
      return null;
    }

    return {
      rate: parseFloat(latest.value),
      date: latest.date,
      cachedAt: Date.now(),
      source: "FRED/MORTGAGE30US",
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[mortgage-rate] FRED fetch failed:", msg);
    return fetchFromFredCsv();
  }
}

async function readDatabaseCache(providedPool?: Pool): Promise<MortgageRate | null> {
  try {
    const pool = providedPool ?? await getPool();
    const { rows } = await pool.query<{
      rate: string | number;
      observation_date: Date | string;
      source: string;
      fetched_at: Date | string;
    }>(`
      SELECT rate, observation_date, source, fetched_at
      FROM mortgage_rate_cache
      WHERE series_id = $1
        AND fetched_at > NOW() - INTERVAL '24 hours'
      LIMIT 1
    `, [SERIES_ID]);
    const row = rows[0];
    if (!row) return null;

    const rate = Number(row.rate);
    const fetchedAt = new Date(row.fetched_at).getTime();
    if (!Number.isFinite(rate) || !Number.isFinite(fetchedAt)) return null;

    return {
      rate,
      date: new Date(row.observation_date).toISOString().slice(0, 10),
      cachedAt: fetchedAt,
      source: row.source === "FRED/MORTGAGE30US"
        ? "FRED/MORTGAGE30US"
        : "Fallback estimate",
    };
  } catch (error) {
    console.warn(
      "[mortgage-rate] Database cache unavailable:",
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

async function writeDatabaseCache(
  rate: MortgageRate,
  providedPool?: Pool
): Promise<void> {
  try {
    const pool = providedPool ?? await getPool();
    await pool.query(`
      INSERT INTO mortgage_rate_cache (
        series_id, rate, observation_date, source, fetched_at
      ) VALUES ($1, $2, $3, $4, TO_TIMESTAMP($5 / 1000.0))
      ON CONFLICT (series_id) DO UPDATE SET
        rate = EXCLUDED.rate,
        observation_date = EXCLUDED.observation_date,
        source = EXCLUDED.source,
        fetched_at = EXCLUDED.fetched_at
    `, [SERIES_ID, rate.rate, rate.date, rate.source, rate.cachedAt]);
  } catch (error) {
    console.warn(
      "[mortgage-rate] Failed to persist database cache:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the current 30-year fixed mortgage rate.
 *
 * Cache strategy:
 *   1. Try Redis: if a value exists within TTL, return it (fast path ~1 ms)
 *   2. On Redis miss: fetch from FRED, write result back to Redis, return it
 *   3. On an interactive request failure: return a labelled fallback estimate
 *   4. On a forced refresh failure: return `null` so cron monitoring still fails
 *
 * @param forceRefresh - Skip Redis read and always hit FRED (used by cron)
 */
export async function getCurrentMortgageRate(
  forceRefresh = false,
  providedPool?: Pool
): Promise<MortgageRate | null> {
  // ── Step 1: Cache read ────────────────────────────────────────────────────
  if (!forceRefresh) {
    const cached = await rget(CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as MortgageRate;
      } catch {
        // Corrupt cached value — fall through to FRED fetch
        console.warn("[mortgage-rate] Failed to parse cached value, refetching.");
      }
    }

    const databaseCached = await readDatabaseCache(providedPool);
    if (databaseCached) {
      void rset(CACHE_KEY, JSON.stringify(databaseCached), CACHE_TTL_S);
      return databaseCached;
    }
  }

  // ── Step 2: Fetch from FRED ────────────────────────────────────────────────
  const rate = await fetchFromFred();
  if (!rate) return forceRefresh ? null : getFallbackMortgageRate();

  // ── Step 3: Write-through cache ────────────────────────────────────────────
  // Fire-and-forget — don't block the response on Redis write
  void rset(CACHE_KEY, JSON.stringify(rate), CACHE_TTL_S);
  await writeDatabaseCache(rate, providedPool);

  return rate;
}

/**
 * Explicitly warms the Redis cache by fetching from FRED unconditionally.
 * Called by the daily cron job at /api/cron/mortgage-rates.
 *
 * @returns The freshly cached rate, or `null` on failure.
 */
export async function refreshMortgageRateCache(
  providedPool?: Pool
): Promise<MortgageRate | null> {
  return getCurrentMortgageRate(true, providedPool);
}
