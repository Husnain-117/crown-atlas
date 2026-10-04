import { NextRequest } from "next/server"
import { captureSecurityViolation } from "@/lib/observability"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const MAX_REPORT_BYTES = 16_384

function withoutQuery(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null
  try {
    const url = new URL(value)
    return url.origin + url.pathname
  } catch {
    return value.split(/[?#]/, 1)[0].slice(0, 500)
  }
}

function normalizeReport(body: unknown): Record<string, unknown> | null {
  if (Array.isArray(body)) {
    const first = body[0]
    return first && typeof first === "object" ? first as Record<string, unknown> : null
  }
  if (!body || typeof body !== "object") return null
  const record = body as Record<string, unknown>
  const legacy = record["csp-report"]
  return legacy && typeof legacy === "object"
    ? legacy as Record<string, unknown>
    : record
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0)
  if (contentLength > MAX_REPORT_BYTES) {
    return new Response(null, { status: 413 })
  }

  try {
    const raw = await request.text()
    if (raw.length > MAX_REPORT_BYTES) {
      return new Response(null, { status: 413 })
    }

    const report = normalizeReport(JSON.parse(raw))
    if (report) {
      captureSecurityViolation({
        directive: String(report["effective-directive"] || report.effectiveDirective || report["violated-directive"] || "unknown").slice(0, 120),
        blockedUrl: withoutQuery(report["blocked-uri"] || report.blockedURL),
        documentUrl: withoutQuery(report["document-uri"] || report.url),
        disposition: String(report.disposition || "report").slice(0, 40),
      })
    }
  } catch {
    return new Response(null, { status: 400 })
  }

  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  })
}
