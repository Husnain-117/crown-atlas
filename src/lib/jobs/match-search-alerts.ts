import type { Pool } from "pg"
import { getPool } from "@/lib/db"
import { fetchNewListings } from "@/lib/crmls"
import { sendEmail } from "@/lib/email"
import SearchAlertEmail from "@/emails/search-alert"

type SavedSearchFilters = Omit<Parameters<typeof fetchNewListings>[0], "since">

interface SavedSearchRow {
  id: string
  email: string
  label: string | null
  filters: SavedSearchFilters | string
  token: string
  last_notified: Date | string | null
}

export interface SearchAlertMatchResult {
  processed: number
  sent: number
  matchedListings: number
  errors: string[]
  durationMs: number
}

function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || "https://crowncoastalhomes.com"
  return configured.replace(/\/$/, "")
}

function parseFilters(value: SavedSearchRow["filters"]): SavedSearchFilters {
  if (typeof value !== "string") return value || {}
  const parsed = JSON.parse(value) as unknown
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {}
  return parsed as SavedSearchFilters
}

export async function matchSearchAlerts(
  providedPool?: Pool
): Promise<SearchAlertMatchResult> {
  const startedAt = Date.now()
  const pool = providedPool ?? await getPool()
  const result = await pool.query<SavedSearchRow>(`
    SELECT id, email, label, filters, token, last_notified
    FROM saved_searches
    WHERE active = TRUE
      AND NULLIF(TRIM(email), '') IS NOT NULL
      AND (last_notified IS NULL OR last_notified < NOW() - INTERVAL '23 hours')
    ORDER BY created_at ASC
  `)

  let processed = 0
  let sent = 0
  let matchedListings = 0
  const errors: string[] = []

  for (const search of result.rows) {
    processed++
    try {
      const filters = parseFilters(search.filters)
      const since = search.last_notified
        ? new Date(search.last_notified)
        : new Date(Date.now() - 86_400_000)
      const listings = await fetchNewListings(
        { ...filters, since },
        { throwOnError: true }
      )

      if (listings.length > 0) {
        const unsubscribeUrl = `${siteUrl()}/api/unsubscribe?token=${encodeURIComponent(search.token)}`
        const delivery = await sendEmail({
          to: search.email,
          subject: `${listings.length} new home${listings.length === 1 ? "" : "s"} match your search`,
          react: SearchAlertEmail({
            listings: listings.slice(0, 5),
            searchLabel: search.label || "your saved search",
            unsubscribeUrl,
          }),
        })
        if (!delivery.success) {
          throw new Error(`Email provider rejected alert: ${String(delivery.error)}`)
        }
        sent++
        matchedListings += listings.length
      }

      await pool.query(
        `UPDATE saved_searches
         SET last_notified = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [search.id]
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[search-alerts] Search ${search.id} failed:`, message)
      errors.push(`Search ${search.id}: ${message}`)
    }
  }

  return {
    processed,
    sent,
    matchedListings,
    errors,
    durationMs: Date.now() - startedAt,
  }
}
