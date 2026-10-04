import { NextResponse } from "next/server"
import { clearStuckJobs } from "@/lib/db/sync-repo"
import { getAdminSyncStatus, runAdminDeltaSync } from "@/lib/admin-sync"
import { authorizeServerRequest } from "@/lib/server-route-auth"
import { createTrestleApiService } from "@/lib/trestle-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 290

export async function GET(request: Request) {
  const unauthorized = authorizeServerRequest(request, "admin")
  if (unauthorized) return unauthorized

  try {
    return NextResponse.json({ success: true, data: await getAdminSyncStatus() })
  } catch (error) {
    console.error("[admin/sync] Failed to load status:", error)
    return NextResponse.json({ success: false, error: "Failed to load sync status" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const unauthorized = authorizeServerRequest(request, "admin")
  if (unauthorized) return unauthorized

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const action = typeof body.action === "string" ? body.action : "trigger"

  try {
    if (action === "trigger") {
      const result = await runAdminDeltaSync(body.syncType, body.windowMinutes)
      return NextResponse.json({ success: result.ok, data: result }, { status: result.ok ? 200 : 502 })
    }

    if (action === "test") {
      const connected = await createTrestleApiService().testConnection()
      return NextResponse.json({ success: connected, data: { connected } }, { status: connected ? 200 : 502 })
    }

    if (action === "cleanup") {
      const cleared = await clearStuckJobs("1 hour")
      return NextResponse.json({ success: true, data: { cleared } })
    }

    if (action === "start" || action === "stop") {
      return NextResponse.json({
        success: true,
        message: "The recurring sync is managed by Vercel Cron; no in-process timer was changed.",
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[admin/sync] Action failed:", error)
    return NextResponse.json({ success: false, error: "Sync action failed" }, { status: 500 })
  }
}
