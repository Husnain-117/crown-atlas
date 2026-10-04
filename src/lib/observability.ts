import * as Sentry from "@sentry/nextjs"
import type { DataCacheStatus } from "@/lib/cache/public-cache"

type SafeContext = Record<string, string | number | boolean | null | undefined>

type LeadDeliveryContext = {
  route: string
  requestId: string
  kind: string
  hasPropertyContext: boolean
  durationMs: number
  stage?: string
}

function cleanContext(context: SafeContext): Record<string, string | number | boolean | null> {
  return Object.fromEntries(
    Object.entries(context).filter(
      (entry): entry is [string, string | number | boolean | null] => entry[1] !== undefined
    )
  )
}

export function captureOperationalError(
  error: unknown,
  operation: string,
  context: SafeContext = {}
): void {
  const safeContext = cleanContext(context)
  Sentry.withScope((scope) => {
    scope.setTag("operation", operation)
    scope.setContext("operation", safeContext)
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)))
  })

  console.error(JSON.stringify({
    level: "error",
    event: "operational_failure",
    operation,
    ...safeContext,
  }))
}

export function recordCacheObservation(
  cacheName: string,
  status: DataCacheStatus
): void {
  Sentry.metrics.count("crown.cache.request", 1, {
    attributes: {
      cache_name: cacheName,
      cache_status: status,
      cache_hit: status === "MISS" ? "false" : "true",
    },
  })
}

export function recordDatabaseTiming(operation: string, durationMs: number): void {
  Sentry.metrics.distribution("crown.database.duration", durationMs, {
    unit: "millisecond",
    attributes: { operation },
  })
}

export function recordLeadDelivery(context: LeadDeliveryContext): void {
  const attributes = {
    route: context.route,
    lead_kind: context.kind,
    property_context: String(context.hasPropertyContext),
  }
  Sentry.metrics.count("crown.lead.delivery", 1, { attributes })
  Sentry.metrics.distribution("crown.lead.delivery_duration", context.durationMs, {
    unit: "millisecond",
    attributes,
  })

  console.info(JSON.stringify({
    level: "info",
    event: "lead_delivered",
    ...context,
  }))
}

export function captureLeadDeliveryError(
  error: unknown,
  context: LeadDeliveryContext,
): void {
  Sentry.metrics.count("crown.lead.delivery_failure", 1, {
    attributes: {
      route: context.route,
      lead_kind: context.kind,
      property_context: String(context.hasPropertyContext),
      stage: context.stage || "delivery",
    },
  })
  captureOperationalError(error, "lead.delivery", context)
}

export function captureSecurityViolation(context: SafeContext): void {
  const safeContext = cleanContext(context)
  Sentry.withScope((scope) => {
    scope.setTag("operation", "security.csp")
    scope.setContext("csp", safeContext)
    Sentry.captureMessage("Content Security Policy violation", "warning")
  })
}

export function appendServerTiming(
  response: Response,
  metrics: Record<string, { durationMs?: number; description?: string }>
): void {
  const entries = Object.entries(metrics).map(([name, metric]) => {
    const duration = metric.durationMs == null
      ? ""
      : ";dur=" + Math.max(0, metric.durationMs).toFixed(1)
    const description = metric.description
      ? ';desc="' + metric.description.replace(/[",;]/g, " ") + '"'
      : ""
    return name + duration + description
  })

  if (entries.length > 0) response.headers.set("Server-Timing", entries.join(", "))
}
