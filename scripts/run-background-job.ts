import dotenv from "dotenv"
import type { Pool } from "pg"

const JOB_NAMES = [
  "stats",
  "enrichment",
  "price-alerts",
  "search-alerts",
  "mortgage",
] as const

type JobName = typeof JOB_NAMES[number]
type JobMetadata = Record<string, unknown>

function loadRuntimeEnvironment(): void {
  const envFile = process.env.BACKGROUND_JOB_ENV_FILE
    || process.env.TRESTLE_SYNC_ENV_FILE
    || (process.env.NODE_ENV === "production"
      ? "/etc/crownlast/background-jobs.env"
      : ".env.local")
  dotenv.config({ path: envFile, override: false, quiet: true })
  process.env.NODE_ENV ||= "production"
  process.env.PG_POOL_MAX ||= "4"

  if (!process.env.DATABASE_URL) {
    const required = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"] as const
    for (const name of required) {
      if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`)
    }
    const url = new URL("postgresql://localhost")
    url.hostname = process.env.DB_HOST as string
    url.port = process.env.DB_PORT || "6432"
    url.username = process.env.DB_USER as string
    url.password = process.env.DB_PASSWORD as string
    url.pathname = `/${process.env.DB_NAME}`
    process.env.DATABASE_URL = url.toString()
  }
}

function parseJobName(raw: string | undefined): JobName {
  if (raw && (JOB_NAMES as readonly string[]).includes(raw)) return raw as JobName
  throw new Error(`Unknown background job "${raw || ""}". Expected: ${JOB_NAMES.join(", ")}`)
}

function positiveInteger(name: string, fallback: number, maximum: number): number {
  const parsed = Number.parseInt(process.env[name] || "", 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.min(parsed, maximum)
}

function requireEnvironment(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required for this background job`)
  return value
}

async function invalidateWebsiteCache(scope: string): Promise<JobMetadata> {
  const url = process.env.CACHE_INVALIDATION_URL
  const secret = process.env.CRON_SECRET
  if (!url || !secret) return { skipped: true, reason: "cache invalidation is not configured" }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scope }),
      signal: AbortSignal.timeout(30_000),
    })
    return { ok: response.ok, status: response.status }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function executeJob(jobName: JobName, pool: Pool): Promise<JobMetadata> {
  switch (jobName) {
    case "stats": {
      const { refreshLocationStatistics } = await import("../src/lib/jobs/refresh-location-statistics")
      const result = await refreshLocationStatistics(pool)
      return { ...result, cacheInvalidation: await invalidateWebsiteCache("location-statistics") }
    }
    case "enrichment": {
      const { enrichBatch } = await import("../src/lib/enrichment")
      const result = await enrichBatch(
        positiveInteger("ENRICHMENT_BATCH_SIZE", 50, 2_000),
        "Active",
        pool
      )
      if (result.processed > 0 && result.failed === result.processed) {
        throw new Error(`All ${result.processed} listing enrichments failed`)
      }
      return { ...result, cacheInvalidation: await invalidateWebsiteCache("properties") }
    }
    case "price-alerts": {
      requireEnvironment("RESEND_API_KEY")
      const { checkPriceAlerts } = await import("../src/lib/price-alert-checker")
      const result = await checkPriceAlerts(
        positiveInteger("PRICE_ALERT_BATCH_SIZE", 100, 2_000),
        pool
      )
      if (result.failed > 0) throw new Error(`${result.failed} price alert deliveries failed`)
      return result
    }
    case "search-alerts": {
      requireEnvironment("RESEND_API_KEY")
      requireEnvironment("TRESTLE_API_ID")
      requireEnvironment("TRESTLE_API_PASSWORD")
      const { matchSearchAlerts } = await import("../src/lib/jobs/match-search-alerts")
      const result = await matchSearchAlerts(pool)
      if (result.errors.length > 0) {
        throw new Error(`${result.errors.length} saved-search alerts failed`)
      }
      return result
    }
    case "mortgage": {
      const { refreshMortgageRateCache } = await import("../src/lib/mortgage-rate")
      const rate = await refreshMortgageRateCache(pool)
      if (!rate) throw new Error("FRED mortgage-rate refresh returned no value")
      return rate
    }
  }
}

async function main(): Promise<void> {
  loadRuntimeEnvironment()
  const jobName = parseJobName(process.argv[2])
  const { getPool } = await import("../src/lib/db")
  const pool = await getPool()
  const lockClient = await pool.connect()
  const lockName = `crownlast-background:${jobName}`
  let locked = false
  let runId: number | null = null
  const startedAt = Date.now()

  try {
    const lock = await lockClient.query<{ locked: boolean }>(
      "SELECT pg_try_advisory_lock(hashtext($1)) AS locked",
      [lockName]
    )
    locked = Boolean(lock.rows[0]?.locked)
    if (!locked) {
      await lockClient.query(
        `INSERT INTO background_job_runs (
           job_name, status, completed_at, duration_ms, metadata
         ) VALUES ($1, 'skipped', NOW(), 0, $2::jsonb)`,
        [jobName, JSON.stringify({ reason: "another run holds the advisory lock" })]
      )
      console.log(JSON.stringify({ ok: true, jobName, skipped: true }))
      return
    }

    const run = await lockClient.query<{ id: number }>(
      `INSERT INTO background_job_runs (job_name, status)
       VALUES ($1, 'running')
       RETURNING id`,
      [jobName]
    )
    runId = Number(run.rows[0].id)

    const metadata = await executeJob(jobName, pool)
    const durationMs = Date.now() - startedAt
    await lockClient.query(
      `UPDATE background_job_runs
       SET status = 'success', completed_at = NOW(), duration_ms = $2, metadata = $3::jsonb
       WHERE id = $1`,
      [runId, durationMs, JSON.stringify(metadata)]
    )
    console.log(JSON.stringify({ ok: true, jobName, runId, durationMs, ...metadata }))
  } catch (error) {
    const durationMs = Date.now() - startedAt
    const message = error instanceof Error ? error.message : String(error)
    if (runId !== null) {
      await lockClient.query(
        `UPDATE background_job_runs
         SET status = 'failed', completed_at = NOW(), duration_ms = $2, error_message = $3
         WHERE id = $1`,
        [runId, durationMs, message.slice(0, 4_000)]
      ).catch(() => undefined)
    }
    throw error
  } finally {
    if (locked) {
      await lockClient.query(
        "SELECT pg_advisory_unlock(hashtext($1))",
        [lockName]
      ).catch(() => undefined)
    }
    lockClient.release()
    await pool.end()
  }
}

main().catch((error) => {
  console.error(JSON.stringify({
    ok: false,
    error: error instanceof Error ? error.message : String(error),
  }))
  process.exitCode = 1
})
