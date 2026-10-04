import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

import { notifyLeadInbox } from "@/lib/email"
import {
  captureLeadDeliveryError,
  recordLeadDelivery,
} from "@/lib/observability"
import { authorizeServerRequest } from "@/lib/server-route-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: Request) {
  const unauthorized = authorizeServerRequest(request, "cron")
  if (unauthorized) return unauthorized

  const requestId = randomUUID()
  const startedAt = Date.now()
  const body = await request.json().catch(() => ({}))
  const source = safeSource(body)
  const shortId = requestId.slice(0, 8)
  const checkedAt = new Date().toISOString()

  const result = await notifyLeadInbox({
    subject: `[Synthetic lead delivery check] ${shortId}`,
    html: `
      <h2>Synthetic lead delivery check</h2>
      <p>This automated message confirms that the production website can deliver a lead to the Crown Coastal inbox.</p>
      <p><strong>Check ID:</strong> ${shortId}</p>
      <p><strong>Source:</strong> ${source}</p>
      <p><strong>Checked at:</strong> ${checkedAt}</p>
      <p>No visitor submitted this message and no follow-up is required.</p>
    `,
  })

  if (!result.success) {
    captureLeadDeliveryError(result.error, {
      route: "/api/monitoring/lead-delivery",
      requestId,
      kind: "Synthetic check",
      hasPropertyContext: false,
      durationMs: Date.now() - startedAt,
      stage: "inbox",
    })
    return NextResponse.json(
      { success: false, error: "Lead delivery check failed.", requestId },
      {
        status: 502,
        headers: { "Cache-Control": "no-store", "X-Lead-Request-Id": requestId },
      },
    )
  }

  recordLeadDelivery({
    route: "/api/monitoring/lead-delivery",
    requestId,
    kind: "Synthetic check",
    hasPropertyContext: false,
    durationMs: Date.now() - startedAt,
  })

  return NextResponse.json(
    { success: true, requestId, checkedAt },
    { headers: { "Cache-Control": "no-store", "X-Lead-Request-Id": requestId } },
  )
}

function safeSource(body: unknown): string {
  if (!body || typeof body !== "object" || !("source" in body)) {
    return "scheduled-monitor"
  }
  const source = String(body.source || "")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 80)
  return source || "scheduled-monitor"
}
