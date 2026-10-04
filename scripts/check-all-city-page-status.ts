/**
 * Checks HTTP status for ALL county/city buy + rent routes.
 *
 * This doesn't catch browser-only chunk-load errors, but it will catch
 * server-side render/compile failures (500s) that usually accompany them.
 *
 * Usage (when dev server is running):
 *   BASE_URL=http://localhost:3000 npm run verify:city-pages:http
 */

import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(__dirname, "../.env") })
dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

import { COUNTIES } from "../src/lib/counties"

type Failure = {
  route: string
  status: number | "ERR"
  message?: string
}

function makeRoutes() {
  const routes: string[] = []

  for (const county of COUNTIES) {
    if (!county.cities || county.cities.length === 0) continue

    for (const city of county.cities) {
      routes.push(`/buy/${county.slug}/${city.slug}`)
      routes.push(`/rent/${county.slug}/${city.slug}`)
    }
  }

  return routes
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
      },
    })
    return { res, text: await res.text() }
  } finally {
    clearTimeout(t)
  }
}

async function main() {
  const baseUrl =
    process.env.BASE_URL?.replace(/\/+$/, "") || process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") || "http://localhost:3000"
  const timeoutMs = Number(process.env.ROUTE_CHECK_TIMEOUT_MS ?? 15000)
  const concurrency = Number(process.env.ROUTE_CHECK_CONCURRENCY ?? 6)

  const routes = makeRoutes()
  console.log(`Route checks: ${routes.length} (buy + rent for each city)`)
  console.log(`Base URL: ${baseUrl}`)
  console.log(`Timeout: ${timeoutMs}ms | Concurrency: ${concurrency}\n`)

  const failures: Failure[] = []

  let idx = 0
  async function worker(workerId: number) {
    while (idx < routes.length) {
      const i = idx++
      const route = routes[i]
      const url = `${baseUrl}${route}`

      try {
        const { res } = await fetchWithTimeout(url, timeoutMs)
        if (res.status !== 200) {
          failures.push({ route, status: res.status })
        }
      } catch (e: any) {
        failures.push({
          route,
          status: "ERR",
          message: e?.name === "AbortError" ? `timeout after ${timeoutMs}ms` : String(e?.message ?? e),
        })
      }

      if ((i + 1) % 50 === 0) {
        console.log(`Progress: ${i + 1}/${routes.length}`)
      }
    }

    console.log(`Worker ${workerId} done`)
  }

  const workers = Array.from({ length: Math.max(1, concurrency) }, (_, i) => worker(i + 1))
  await Promise.all(workers)

  console.log("\n────────────────────────────────────────────────────────")
  console.log(`Failures: ${failures.length}`)
  if (failures.length > 0) {
    for (const f of failures.slice(0, 50)) {
      console.log(`  ${f.route} -> ${f.status}${f.message ? ` (${f.message})` : ""}`)
    }
    if (failures.length > 50) console.log(`  ...and ${failures.length - 50} more`)
    process.exit(1)
  }

  console.log("  ✓ All city buy + rent routes returned HTTP 200.")
  process.exit(0)
}

main().catch((err) => {
  console.error("Route check failed:", err)
  process.exit(1)
})

