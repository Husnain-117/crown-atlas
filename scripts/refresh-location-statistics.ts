import dotenv from "dotenv"

function loadRuntimeEnvironment(): void {
  const envFile = process.env.TRESTLE_SYNC_ENV_FILE || ".env.local"
  dotenv.config({ path: envFile, override: false, quiet: true })

  if (/^postgres(?:ql)?:\/\//i.test(process.env.DATABASE_URL || "")) return

  const requiredNames = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"] as const
  for (const name of requiredNames) {
    if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`)
  }

  const url = new URL("postgresql://localhost")
  url.hostname = process.env.DB_HOST as string
  const configuredPort = Number.parseInt(process.env.DB_PORT || "", 10)
  url.port = Number.isFinite(configuredPort) ? String(configuredPort) : "6432"
  url.username = process.env.DB_USER as string
  url.password = process.env.DB_PASSWORD as string
  url.pathname = `/${process.env.DB_NAME}`
  process.env.DATABASE_URL = url.toString()
  const sslMode = process.env.DB_SSL?.trim().toLowerCase()
  if (!["true", "require", "required", "false", "disable", "disabled"].includes(sslMode || "")) {
    process.env.DB_SSL = "require"
  }
}

async function main(): Promise<void> {
  loadRuntimeEnvironment()
  const [{ refreshLocationStatistics }, { getPool }] = await Promise.all([
    import("../src/lib/jobs/refresh-location-statistics"),
    import("../src/lib/db"),
  ])
  const pool = await getPool()

  try {
    const result = await refreshLocationStatistics(pool)
    console.log(JSON.stringify({ ok: true, ...result }, null, 2))
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  const pgError = error as Error & { code?: string; detail?: string; constraint?: string }
  console.error(JSON.stringify({
    message: pgError instanceof Error ? pgError.message : String(pgError),
    code: pgError.code,
    detail: pgError.detail,
    constraint: pgError.constraint,
  }, null, 2))
  process.exitCode = 1
})
