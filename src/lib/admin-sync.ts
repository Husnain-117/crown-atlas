import { getSyncHistory, getSyncMetrics } from "@/lib/db/sync-repo"
import { rdelPattern } from "@/lib/redis"
import { runDeltaSync } from "@/lib/trestle-delta"
import { PROPERTY_CACHE_TAG } from "@/lib/cache/public-cache"
import { invalidateVercelCacheTags } from "@/lib/cache/vercel-runtime"

const MAX_WINDOW_MINUTES = 24 * 60

export function resolveSyncWindowMinutes(
  syncType: unknown,
  requestedWindow: unknown,
): number {
  const requested = Number(requestedWindow)
  if (Number.isFinite(requested)) {
    return Math.min(MAX_WINDOW_MINUTES, Math.max(1, Math.round(requested)))
  }

  return syncType === "all" || syncType === "full" ? MAX_WINDOW_MINUTES : 60
}

export async function runAdminDeltaSync(syncType?: unknown, requestedWindow?: unknown) {
  const windowMinutes = resolveSyncWindowMinutes(syncType, requestedWindow)
  const result = await runDeltaSync(windowMinutes)
  let cacheKeysDropped = 0
  let vercelCacheInvalidation: "global" | "runtime" | "unavailable" | "skipped" = "skipped"

  if (result.upserted > 0) {
    [cacheKeysDropped, vercelCacheInvalidation] = await Promise.all([
      rdelPattern("props:v1:*"),
      invalidateVercelCacheTags([PROPERTY_CACHE_TAG]),
    ])
  }

  return { ...result, windowMinutes, cacheKeysDropped, vercelCacheInvalidation }
}

export async function getAdminSyncStatus() {
  const [metrics, history] = await Promise.all([
    getSyncMetrics(),
    getSyncHistory(20),
  ])

  return {
    metrics,
    history,
    scheduler: {
      managedBy: "vercel-cron",
      runtimeIntervalsSupported: false,
    },
  }
}
