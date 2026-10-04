/**
 * connection-test-runner.ts
 *
 * End-to-end integration test battery for all external services used by the
 * Crown Coastal Homes platform.  Covers:
 *
 *   Group A — Redis          : PING latency, round-trip read/write/delete
 *   Group B — PostgreSQL     : connectivity, properties table, sync_jobs, price_alerts
 *   Group C — Trestle MLS    : OAuth2 token, OData reachability, delta query
 *   Group D — Email (SMTP)   : transport verify (no actual email sent)
 *   Group E — Environment    : required env-var inventory
 *
 * Designed to run from:
 *   • GET /api/admin/connection-tests   (Next.js API route)
 *   • scripts/test-connections.ts       (ts-node CLI)
 *
 * All tests are wrapped in try/catch — a thrown error never propagates to the
 * caller.  Missing env vars result in "skip" rather than "fail" so the report
 * distinguishes "not configured" from "configured but broken".
 */

import Redis from "ioredis";
import { Pool } from "pg";
import axios from "axios";
import nodemailer from "nodemailer";

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

export type TestStatus = "pass" | "fail" | "warn" | "skip";

export interface TestResult {
  /** Human-readable test name shown in reports. */
  name: string;
  /** Category grouping for display purposes. */
  category: "redis" | "postgresql" | "mls_api" | "email" | "environment";
  /** Outcome of the test. */
  status: TestStatus;
  /** Wall-clock duration of the test in milliseconds. */
  latencyMs: number;
  /** One-line description of what happened. */
  message: string;
  /** Optional structured detail blob (safe to expose — no secrets). */
  data?: Record<string, unknown>;
}

export type OverallHealth = "healthy" | "degraded" | "critical";

export interface ConnectionTestReport {
  /** ISO timestamp when the check ran. */
  timestamp: string;
  /** NODE_ENV value of the process. */
  environment: string;
  /** Aggregate health verdict. */
  overall: OverallHealth;
  summary: {
    total: number;
    pass:  number;
    fail:  number;
    warn:  number;
    skip:  number;
  };
  /** Ordered list of individual test results. */
  tests: TestResult[];
  /** Total wall-clock time for all tests in ms. */
  durationMs: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Wrap a test body and guarantee a TestResult even on unexpected throw. */
async function runTest(
  name: string,
  category: TestResult["category"],
  fn: () => Promise<Omit<TestResult, "name" | "category" | "latencyMs">>
): Promise<TestResult> {
  const t0 = Date.now();
  try {
    const partial = await fn();
    return { name, category, latencyMs: Date.now() - t0, ...partial };
  } catch (err) {
    return {
      name,
      category,
      latencyMs: Date.now() - t0,
      status: "fail",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Mask the middle section of a URL or string that likely contains credentials. */
function maskSecret(s: string): string {
  if (!s || s.length < 6) return "***";
  return s.slice(0, 3) + "***" + s.slice(-3);
}

// ─────────────────────────────────────────────────────────────────────────────
// Group E — Environment checks  (synchronous, run first)
// ─────────────────────────────────────────────────────────────────────────────

const ENV_MANIFEST: Record<string, { required: boolean; desc: string }> = {
  REDIS_URL:            { required: false, desc: "Redis connection URL (caching)" },
  DB_HOST:              { required: false, desc: "PostgreSQL host (TCP mode)" },
  DATABASE_URL:         { required: false, desc: "PostgreSQL connection string" },
  INSTANCE_CONNECTION_NAME: { required: false, desc: "Cloud SQL instance (connector mode)" },
  DB_USER:              { required: true,  desc: "PostgreSQL user" },
  DB_PASSWORD:          { required: true,  desc: "PostgreSQL password" },
  DB_NAME:              { required: true,  desc: "PostgreSQL database name" },
  TRESTLE_API_ID:       { required: false,  desc: "Trestle OAuth2 client ID" },
  TRESTLE_API_PASSWORD: { required: false,  desc: "Trestle OAuth2 client secret" },
  TRESTLE_BASE_URL:     { required: false,  desc: "Trestle OData base URL" },
  TRESTLE_OAUTH_URL:    { required: false,  desc: "Trestle OAuth2 token endpoint" },
  EMAIL_HOST:           { required: false, desc: "SMTP host" },
  EMAIL_USER:           { required: false, desc: "SMTP user" },
  EMAIL_PASS:           { required: false, desc: "SMTP password" },
  CRON_SECRET:          { required: false, desc: "Cron auth secret" },
  OPENAI_API_KEY:       { required: false, desc: "OpenAI API key (NLP search)" },
};

export function checkEnvironment(): TestResult {
  const t0 = Date.now();
  const missing: string[] = [];
  const present: string[] = [];

  for (const [key, meta] of Object.entries(ENV_MANIFEST)) {
    if (process.env[key]) {
      present.push(key);
    } else {
      if (meta.required) missing.push(key);
    }
  }

  const status: TestStatus = missing.length === 0 ? "pass" : "warn";
  const message =
    missing.length === 0
      ? `All ${present.length} configured env vars present`
      : `${missing.length} required var(s) missing: ${missing.join(", ")}`;

  return {
    name:      "Environment Variables",
    category:  "environment",
    status,
    latencyMs: Date.now() - t0,
    message,
    data: {
      present: present.length,
      missing_required: missing,
      has_redis:  !!process.env.REDIS_URL,
      has_pg_tcp: !!process.env.DB_HOST,
      has_pg_url: !!process.env.DATABASE_URL,
      has_cloud_sql: !!process.env.INSTANCE_CONNECTION_NAME,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Group A — Redis
// ─────────────────────────────────────────────────────────────────────────────

/** Build a fresh short-lived Redis client (not the app singleton). */
function buildRedisClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  return new Redis(url, {
    maxRetriesPerRequest: 1,
    enableReadyCheck:     false,
    lazyConnect:          true,
    connectTimeout:       5_000,
    commandTimeout:       3_000,
    retryStrategy:        () => null, // no retries in test mode
  });
}

export async function testRedisPing(): Promise<TestResult> {
  return runTest("Redis PING", "redis", async () => {
    const r = buildRedisClient();
    if (!r) {
      return { status: "skip", message: "REDIS_URL not configured" };
    }
    try {
      const pong = await r.ping();
      return {
        status: pong === "PONG" ? "pass" : "warn",
        message: `Server replied: ${pong}`,
        data:    { reply: pong },
      };
    } finally {
      r.disconnect();
    }
  });
}

export async function testRedisReadWrite(): Promise<TestResult> {
  return runTest("Redis Round-trip Read/Write", "redis", async () => {
    const r = buildRedisClient();
    if (!r) {
      return { status: "skip", message: "REDIS_URL not configured" };
    }
    const testKey = `conntest:v1:${Date.now()}`;
    const testVal = "crown-coastal-ok";
    try {
      await r.set(testKey, testVal, "EX", 30);
      const read = await r.get(testKey);
      await r.del(testKey);
      const ok = read === testVal;
      return {
        status:  ok ? "pass" : "fail",
        message: ok ? "Write → Read → Delete succeeded" : `Read returned "${read}" (expected "${testVal}")`,
        data:    { key: testKey, match: ok },
      };
    } finally {
      r.disconnect();
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Group B — PostgreSQL
// ─────────────────────────────────────────────────────────────────────────────

/** Build a minimal direct-TCP pg.Pool for connection testing. */
function buildPgPool(): Pool | null {
  // Try DATABASE_URL first, then individual vars
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      connectionTimeoutMillis: 8_000,
      idleTimeoutMillis:       5_000,
      ssl:
        process.env.DB_SSL === "true"
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!host || !user || !password || !database) return null;

  return new Pool({
    host,
    port:     parseInt(process.env.DB_PORT ?? "5432", 10),
    user,
    password,
    database,
    max:      2,
    connectionTimeoutMillis: 8_000,
    idleTimeoutMillis:       5_000,
    ssl:
      process.env.DB_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
  });
}

export async function testPostgresConnect(): Promise<TestResult> {
  return runTest("PostgreSQL Connect", "postgresql", async () => {
    const pool = buildPgPool();
    if (!pool) {
      return {
        status:  "skip",
        message: "No PG connection info — set DATABASE_URL or DB_HOST+DB_USER+DB_PASSWORD+DB_NAME",
      };
    }
    let client;
    try {
      client = await pool.connect();
      const { rows } = await client.query<{ db: string; ver: string }>(
        "SELECT current_database() AS db, split_part(version(), ' ', 2) AS ver"
      );
      return {
        status:  "pass",
        message: `Connected to "${rows[0].db}" (PostgreSQL ${rows[0].ver})`,
        data:    { database: rows[0].db, pg_version: rows[0].ver },
      };
    } finally {
      client?.release();
      await pool.end().catch(() => {/* ignore */});
    }
  });
}

export async function testPropertiesTable(): Promise<TestResult> {
  return runTest("PostgreSQL — properties table", "postgresql", async () => {
    const pool = buildPgPool();
    if (!pool) return { status: "skip", message: "PG not configured" };
    let client;
    try {
      client = await pool.connect();
      const { rows } = await client.query<{
        total: string;
        active: string;
        last_updated: Date | null;
        oldest_active: Date | null;
      }>(`
        SELECT
          COUNT(*)                                               AS total,
          COUNT(*) FILTER (WHERE standard_status = 'Active')    AS active,
          MAX(updated_at)                                        AS last_updated,
          MIN(updated_at) FILTER (WHERE standard_status='Active') AS oldest_active
        FROM properties
      `);
      const row = rows[0];
      const total  = parseInt(row.total, 10);
      const active = parseInt(row.active, 10);
      if (total === 0) {
        return {
          status:  "warn",
          message: "properties table exists but is empty — delta sync has not run yet",
          data:    { total, active },
        };
      }
      const lastUpdatedAgo = row.last_updated
        ? Math.round((Date.now() - new Date(row.last_updated).getTime()) / 1000)
        : null;
      const staleWarning =
        lastUpdatedAgo !== null && lastUpdatedAgo > 30 * 60
          ? " ⚠ last update > 30 min ago"
          : "";
      return {
        status:  staleWarning ? "warn" : "pass",
        message: `${total.toLocaleString()} rows total, ${active.toLocaleString()} Active${staleWarning}`,
        data: {
          total_rows:       total,
          active_listings:  active,
          last_updated_iso: row.last_updated?.toISOString() ?? null,
          last_updated_seconds_ago: lastUpdatedAgo,
        },
      };
    } finally {
      client?.release();
      await pool.end().catch(() => {/* ignore */});
    }
  });
}

export async function testSyncJobsTable(): Promise<TestResult> {
  return runTest("PostgreSQL — sync_jobs (last delta run)", "postgresql", async () => {
    const pool = buildPgPool();
    if (!pool) return { status: "skip", message: "PG not configured" };
    let client;
    try {
      client = await pool.connect();
      const { rows } = await client.query<{
        last_success_at: Date | null;
        last_status:     string | null;
        records_fetched: number | null;
        records_inserted: number | null;
        duration_ms:     number | null;
        stale_count:     string;
      }>(`
        SELECT
          MAX(completed_at) FILTER (WHERE status = 'success')  AS last_success_at,
          (SELECT status FROM sync_jobs
            WHERE job_type = 'trestle_listing_delta'
            ORDER BY started_at DESC LIMIT 1)                   AS last_status,
          (SELECT records_fetched FROM sync_jobs
            WHERE job_type = 'trestle_listing_delta' AND status = 'success'
            ORDER BY completed_at DESC LIMIT 1)                 AS records_fetched,
          (SELECT records_inserted FROM sync_jobs
            WHERE job_type = 'trestle_listing_delta' AND status = 'success'
            ORDER BY completed_at DESC LIMIT 1)                 AS records_inserted,
          (SELECT duration_ms FROM sync_jobs
            WHERE job_type = 'trestle_listing_delta' AND status = 'success'
            ORDER BY completed_at DESC LIMIT 1)                 AS duration_ms,
          (COUNT(*) FILTER (
            WHERE status = 'running'
              AND started_at < NOW() - INTERVAL '30 minutes'
          ))::TEXT                                               AS stale_count
        FROM sync_jobs
        WHERE job_type = 'trestle_listing_delta'
      `);
      const row = rows[0];
      if (!row?.last_success_at) {
        return {
          status:  "warn",
          message: "No successful delta sync found — has the cron run yet?",
          data:    { last_status: row?.last_status ?? "no_runs" },
        };
      }
      const agoMs   = Date.now() - new Date(row.last_success_at).getTime();
      const agoMin  = Math.round(agoMs / 60_000);
      const isStale = agoMin > 15;
      const staleJobs = parseInt(row.stale_count || "0", 10);
      return {
        status:  isStale ? "warn" : "pass",
        message: isStale
          ? `Last success was ${agoMin} min ago (>15 min threshold) — check cron`
          : `Last sync succeeded ${agoMin} min ago`,
        data: {
          last_success_iso:    new Date(row.last_success_at).toISOString(),
          minutes_ago:         agoMin,
          last_status:         row.last_status,
          records_fetched:     row.records_fetched,
          records_inserted:    row.records_inserted,
          duration_ms:         row.duration_ms,
          stuck_running_jobs:  staleJobs,
        },
      };
    } finally {
      client?.release();
      await pool.end().catch(() => {/* ignore */});
    }
  });
}

export async function testPriceAlertsTable(): Promise<TestResult> {
  return runTest("PostgreSQL — price_alerts table", "postgresql", async () => {
    const pool = buildPgPool();
    if (!pool) return { status: "skip", message: "PG not configured" };
    let client;
    try {
      client = await pool.connect();
      const { rows } = await client.query<{
        total:   string;
        active:  string;
        pending: string;
        fired:   string;
      }>(`
        SELECT
          COUNT(*)                                              AS total,
          COUNT(*) FILTER (WHERE is_active = TRUE)             AS active,
          COUNT(*) FILTER (WHERE is_active = TRUE
                             AND fired_at IS NULL)             AS pending,
          COUNT(*) FILTER (WHERE fired_at IS NOT NULL)         AS fired
        FROM price_alerts
      `);
      const row = rows[0];
      return {
        status:  "pass",
        message: `${row.total} alerts (${row.active} active, ${row.pending} pending delivery, ${row.fired} fired)`,
        data: {
          total:   parseInt(row.total,   10),
          active:  parseInt(row.active,  10),
          pending: parseInt(row.pending, 10),
          fired:   parseInt(row.fired,   10),
        },
      };
    } catch (err: any) {
      // Table may not exist yet if migration 004 hasn't run
      if (err.code === "42P01") {
        return {
          status:  "warn",
          message: "price_alerts table not found — run migration 20260310_004",
        };
      }
      throw err;
    } finally {
      client?.release();
      await pool.end().catch(() => {/* ignore */});
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Group C — Trestle MLS
// ─────────────────────────────────────────────────────────────────────────────

interface TrestleTokenClaims {
  access_token: string;
  token_type:   string;
  expires_in:   number;
  scope:        string;
}

async function acquireTrestleToken(): Promise<string> {
  const id       = process.env.TRESTLE_API_ID       ?? process.env.TRESTLE_CLIENT_ID ?? "";
  const secret   = process.env.TRESTLE_API_PASSWORD ?? process.env.TRESTLE_CLIENT_SECRET ?? "";
  const oauthUrl = process.env.TRESTLE_OAUTH_URL    ?? "https://api-trestle.corelogic.com/trestle/oidc/connect/token";

  const response = await axios.post<TrestleTokenClaims>(
    oauthUrl,
    new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret, scope: "api" }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }, timeout: 15_000 }
  );
  return response.data.access_token;
}

export async function testTrestleOAuth(): Promise<TestResult> {
  return runTest("Trestle MLS — OAuth2 token", "mls_api", async () => {
    const id       = process.env.TRESTLE_API_ID       ?? process.env.TRESTLE_CLIENT_ID;
    const secret   = process.env.TRESTLE_API_PASSWORD ?? process.env.TRESTLE_CLIENT_SECRET;
    const oauthUrl = process.env.TRESTLE_OAUTH_URL;

    if (!id || !secret || !oauthUrl) {
      return {
        status:  "skip",
        message: "Trestle import runs on DigitalOcean; credentials are intentionally absent from the website",
      };
    }

    const response = await axios.post<TrestleTokenClaims>(
      oauthUrl,
      new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret, scope: "api" }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }, timeout: 15_000 }
    );

    const { access_token, expires_in, token_type, scope } = response.data;
    if (!access_token) {
      return { status: "fail", message: "Token endpoint returned no access_token" };
    }
    return {
      status:  "pass",
      message: `Token obtained (${token_type}, expires in ${expires_in}s, scope="${scope}")`,
      data:    {
        token_preview: maskSecret(access_token),
        expires_in,
        token_type,
        scope,
        endpoint: oauthUrl,
      },
    };
  });
}

export async function testTrestleODataConnect(): Promise<TestResult> {
  return runTest("Trestle MLS — OData API reachability ($top=1)", "mls_api", async () => {
    const baseUrl = process.env.TRESTLE_BASE_URL;
    if (!process.env.TRESTLE_API_ID || !process.env.TRESTLE_API_PASSWORD || !baseUrl) {
      return { status: "skip", message: "Trestle credentials not configured" };
    }

    const token = await acquireTrestleToken();

    const response = await axios.get<{ value: unknown[] }>(
      `${baseUrl}/odata/Property`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        params:  { "$top": 1, "$select": "ListingKey,StandardStatus,City,ListPrice,ModificationTimestamp" },
        timeout: 20_000,
      }
    );

    const listing = response.data.value?.[0] as any;
    if (!listing) {
      return { status: "warn", message: "OData endpoint reachable but returned 0 properties" };
    }
    return {
      status:  "pass",
      message: `OData endpoint reachable — sample listing: ${listing.ListingKey ?? "N/A"} | ${listing.City ?? "N/A"} | $${(listing.ListPrice ?? 0).toLocaleString()} | ${listing.StandardStatus ?? "N/A"}`,
      data: {
        base_url:        baseUrl,
        http_status:     response.status,
        sample_key:      listing.ListingKey,
        sample_status:   listing.StandardStatus,
        sample_city:     listing.City,
        sample_price:    listing.ListPrice,
        sample_modified: listing.ModificationTimestamp,
      },
    };
  });
}

export async function testTrestleDeltaQuery(): Promise<TestResult> {
  return runTest("Trestle MLS — Delta query (last 10 min)", "mls_api", async () => {
    const baseUrl = process.env.TRESTLE_BASE_URL;
    if (!process.env.TRESTLE_API_ID || !process.env.TRESTLE_API_PASSWORD || !baseUrl) {
      return { status: "skip", message: "Trestle credentials not configured" };
    }

    const token = await acquireTrestleToken();

    // Query the window the 5-minute cron uses: last 10 minutes
    const windowStart = new Date(Date.now() - 10 * 60 * 1_000).toISOString();
    const filter = `ModificationTimestamp ge ${windowStart}`;

    const response = await axios.get<{ "@odata.count"?: number; value: unknown[] }>(
      `${baseUrl}/odata/Property`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        params:  {
          "$filter": filter,
          "$top":    10,
          "$count":  "true",
          "$select": "ListingKey,StandardStatus,City,ListPrice,ModificationTimestamp",
          "$orderby": "ModificationTimestamp desc",
        },
        timeout: 30_000,
      }
    );

    const count  = response.data["@odata.count"] ?? response.data.value.length;
    const sample = response.data.value.slice(0, 3) as any[];

    return {
      status:  "pass",
      message: `Delta query succeeded — ${count} listing(s) modified in the last 10 min`,
      data: {
        window_start:    windowStart,
        odata_count:     count,
        returned_rows:   response.data.value.length,
        http_status:     response.status,
        sample_listings: sample.map((l: any) => ({
          key:      l.ListingKey,
          status:   l.StandardStatus,
          city:     l.City,
          modified: l.ModificationTimestamp,
        })),
      },
    };
  });
}

export async function testTrestleMetadata(): Promise<TestResult> {
  return runTest("Trestle MLS — OData $metadata endpoint", "mls_api", async () => {
    const baseUrl = process.env.TRESTLE_BASE_URL;
    if (!baseUrl) return { status: "skip", message: "TRESTLE_BASE_URL not set" };

    const token = await acquireTrestleToken();

    const response = await axios.get(
      `${baseUrl}/odata/$metadata`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/xml,application/json" },
        timeout: 10_000,
        // We don't need the full body — just verify the HTTP 200
        maxContentLength: 1_024,
        validateStatus: (s) => s < 500,
      }
    );

    if (response.status !== 200) {
      return {
        status:  "warn",
        message: `$metadata returned HTTP ${response.status}`,
        data:    { http_status: response.status },
      };
    }
    return {
      status:  "pass",
      message: `OData $metadata responsive (HTTP ${response.status})`,
      data:    { http_status: response.status, url: `${baseUrl}/odata/$metadata` },
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Group D — Email (SMTP)
// ─────────────────────────────────────────────────────────────────────────────

export async function testSmtpTransport(): Promise<TestResult> {
  return runTest("SMTP transport verify", "email", async () => {
    const host = process.env.EMAIL_HOST;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!host || !user || !pass) {
      return {
        status:  "skip",
        message: "EMAIL_HOST / EMAIL_USER / EMAIL_PASS not configured",
      };
    }

    const transporter = nodemailer.createTransport({
      host,
      port:   parseInt(process.env.EMAIL_PORT ?? "587", 10),
      secure: process.env.EMAIL_SECURE === "true",
      auth:   { user, pass },
      connectionTimeout: 8_000,
      greetingTimeout:   8_000,
    });

    // nodemailer.verify() opens a real connection and authenticates — never sends mail
    await transporter.verify();
    transporter.close();

    return {
      status:  "pass",
      message: `SMTP auth verified against ${host}`,
      data: {
        host,
        port:   parseInt(process.env.EMAIL_PORT ?? "587", 10),
        secure: process.env.EMAIL_SECURE === "true",
        user:   maskSecret(user),
      },
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Master runner
// ─────────────────────────────────────────────────────────────────────────────

export async function runAllConnectionTests(): Promise<ConnectionTestReport> {
  const start = Date.now();

  // Group E — env check is synchronous and runs first
  const envResult = checkEnvironment();

  // Groups A, B, C, D run concurrently for lowest total wall time.
  // DB tests are split so each creates its own short-lived pool (avoids
  // the Cloud SQL Connector requirement that exists in getPgPool()).
  const [
    redisPing,
    redisRW,
    pgConnect,
    pgProps,
    pgSyncJobs,
    pgPriceAlerts,
    mlsOAuth,
    mlsOData,
    mlsDelta,
    mlsMeta,
    smtp,
  ] = await Promise.all([
    testRedisPing(),
    testRedisReadWrite(),
    testPostgresConnect(),
    testPropertiesTable(),
    testSyncJobsTable(),
    testPriceAlertsTable(),
    testTrestleOAuth(),
    testTrestleODataConnect(),
    testTrestleDeltaQuery(),
    testTrestleMetadata(),
    testSmtpTransport(),
  ]);

  const tests: TestResult[] = [
    envResult,
    redisPing,
    redisRW,
    pgConnect,
    pgProps,
    pgSyncJobs,
    pgPriceAlerts,
    mlsOAuth,
    mlsOData,
    mlsDelta,
    mlsMeta,
    smtp,
  ];

  // ── Summary ────────────────────────────────────────────────────────────────
  const summary = { total: tests.length, pass: 0, fail: 0, warn: 0, skip: 0 };
  for (const t of tests) summary[t.status]++;

  // ── Overall verdict ────────────────────────────────────────────────────────
  // critical  — any critical service (PG or MLS auth) failed
  // degraded  — non-critical failures/warnings exist
  // healthy   — all configured services pass
  const criticalTests = ["PostgreSQL Connect", "Trestle MLS — OAuth2 token"];
  const hasCriticalFail = tests.some(
    (t) => criticalTests.includes(t.name) && t.status === "fail"
  );
  const overall: OverallHealth = hasCriticalFail
    ? "critical"
    : summary.fail > 0
    ? "degraded"
    : summary.warn > 0
    ? "degraded"
    : "healthy";

  return {
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "unknown",
    overall,
    summary,
    tests,
    durationMs: Date.now() - start,
  };
}
