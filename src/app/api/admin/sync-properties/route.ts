import { NextResponse } from "next/server"
import { getAdminSyncStatus, runAdminDeltaSync } from "@/lib/admin-sync"
import { authorizeServerRequest } from "@/lib/server-route-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 290

export async function POST(request: Request) {
  const unauthorized = authorizeServerRequest(request, "admin")
  if (unauthorized) return unauthorized

  const body = await request.json().catch(() => ({})) as Record<string, unknown>

  try {
    const result = await runAdminDeltaSync(body.syncType, body.windowMinutes)
    return NextResponse.json(
      {
        success: result.ok,
        message: result.ok
          ? `Sync completed: ${result.fetched} fetched, ${result.upserted} upserted.`
          : "Sync failed. Review the server logs and sync history.",
        result,
      },
      { status: result.ok ? 200 : 502 },
    )
  } catch (error) {
    console.error("[admin/sync-properties] Sync failed:", error)
    return NextResponse.json({ success: false, error: "Sync failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const unauthorized = authorizeServerRequest(request, "admin")
  if (unauthorized) return unauthorized

  try {
    return NextResponse.json({ success: true, status: await getAdminSyncStatus() })
  } catch (error) {
    console.error("[admin/sync-properties] Status failed:", error)
    return NextResponse.json({ success: false, error: "Failed to load sync status" }, { status: 500 })
  }
}
