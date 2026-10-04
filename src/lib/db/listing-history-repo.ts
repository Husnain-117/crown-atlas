import { cache } from "react"
import { getPgPool } from "@/lib/db"

export interface ListingHistoryEvent {
  id: string
  eventType: string
  fieldName: string
  oldValue: unknown
  newValue: unknown
  observedAt: string
  source: string
}

export interface PropertyListingEpisode {
  listingKey: string
  status: string | null
  originalListPrice: number | null
  latestListPrice: number | null
  closePrice: number | null
  onMarketDate: string | null
  closeDate: string | null
}

export const getListingHistoryEvents = cache(
  async (listingKey: string, limit = 40, propertyEntityKey?: string | null): Promise<ListingHistoryEvent[]> => {
    if (!listingKey) return []

    try {
      const pool = await getPgPool()
      const result = await pool.query(
        `SELECT id, event_type, field_name, old_value, new_value, observed_at, source
         FROM listing_history_events
         WHERE listing_key = $1
            OR (
              $3::text IS NOT NULL
              AND listing_key IN (
                SELECT episode.listing_key
                FROM property_listing_episodes AS episode
                WHERE episode.entity_key = $3
              )
            )
         ORDER BY observed_at DESC, id DESC
         LIMIT $2`,
        [listingKey, Math.min(Math.max(limit, 1), 100), propertyEntityKey || null]
      )

      return result.rows.map((row) => ({
        id: String(row.id),
        eventType: String(row.event_type),
        fieldName: String(row.field_name),
        oldValue: row.old_value,
        newValue: row.new_value,
        observedAt: String(row.observed_at),
        source: String(row.source || "CRMLS/Trestle"),
      }))
    } catch (error) {
      if ((error as { code?: string })?.code !== "42P01") {
        console.error("[listing-history] Read failed", error)
      }
      return []
    }
  }
)

export const getPropertyListingEpisodes = cache(
  async (propertyEntityKey?: string | null): Promise<PropertyListingEpisode[]> => {
    if (!propertyEntityKey || process.env.CRMLS_PUBLISH_HISTORICAL_LISTINGS !== "true") return []

    try {
      const pool = await getPgPool()
      const result = await pool.query(
        `SELECT
           listing_key,
           standard_status,
           original_list_price,
           latest_list_price,
           close_price,
           COALESCE(on_market_date, listing_contract_date) AS on_market_date,
           close_date
         FROM property_listing_episodes
         WHERE entity_key = $1
         ORDER BY COALESCE(on_market_date, listing_contract_date, first_seen_at::date) DESC, listing_key DESC
         LIMIT 20`,
        [propertyEntityKey]
      )

      return result.rows.map((row) => ({
        listingKey: String(row.listing_key),
        status: row.standard_status ? String(row.standard_status) : null,
        originalListPrice: finiteNumber(row.original_list_price),
        latestListPrice: finiteNumber(row.latest_list_price),
        closePrice: finiteNumber(row.close_price),
        onMarketDate: row.on_market_date ? String(row.on_market_date) : null,
        closeDate: row.close_date ? String(row.close_date) : null,
      }))
    } catch (error) {
      if ((error as { code?: string })?.code !== "42P01") {
        console.error("[listing-history] Episode read failed", error)
      }
      return []
    }
  }
)

function finiteNumber(value: unknown): number | null {
  if (value == null || value === "") return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}
