import { unstable_cache } from "next/cache"
import { COUNTIES } from "@/lib/counties"
import { isBuildTime } from "@/lib/utils/build-guard"
import { getPool, isDatabaseConfigured } from "@/lib/db"
import CountiesSection from "@/components/CountiesSection"

/**
 * Bulk county-level stats for the homepage.
 *
 * Replaces the previous per-city fan-out (58 counties × N cities × DB query each)
 * with a SINGLE grouped SQL aggregation on `county_or_parish`.
 *
 * Returns { countyListingCounts, countyMedianPrices } keyed by county slug.
 */
async function getCountyHomepageStatsUncached(): Promise<{
  countyListingCounts: Record<string, number>
  countyMedianPrices: Record<string, number>
}> {
  try {
    const pool = await getPool()

    const sql = `
      SELECT
        county_or_parish,
        COUNT(*)::int AS listing_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY list_price)
          FILTER (WHERE list_price IS NOT NULL AND list_price > 0)::numeric AS median_price
      FROM properties
      WHERE standard_status = 'Active'
        AND property_type NOT IN ('Land','ResidentialLease','CommercialLease','CommercialSale','BusinessOpportunity')
        AND LOWER(COALESCE(state_or_province, '')) = 'ca'
        AND county_or_parish IS NOT NULL
      GROUP BY county_or_parish
    `

    const result = await pool.query(sql)

    // Build a lookup: county_or_parish value (e.g. "San Diego") → row data
    const dbLookup = new Map<string, { count: number; median: number | null }>()
    for (const row of result.rows) {
      const name = (row.county_or_parish as string)?.trim()
      if (!name) continue
      dbLookup.set(name.toLowerCase(), {
        count: parseInt(String(row.listing_count), 10) || 0,
        median:
          row.median_price != null && Number.isFinite(Number(row.median_price))
            ? Math.round(Number(row.median_price))
            : null,
      })
    }

    // Map DB county names back to our COUNTIES config slugs
    const countyListingCounts: Record<string, number> = {}
    const countyMedianPrices: Record<string, number> = {}

    for (const county of COUNTIES) {
      // Strip " County" from config name to match DB's county_or_parish
      // e.g. "San Diego County" → "san diego"
      const baseName = county.name.replace(/\s+County$/i, "").trim().toLowerCase()

      const data = dbLookup.get(baseName)
      if (data) {
        countyListingCounts[county.slug] = data.count
        if (data.median != null && data.median > 0) {
          countyMedianPrices[county.slug] = data.median
        }
      } else {
        countyListingCounts[county.slug] = 0
      }
    }

    return { countyListingCounts, countyMedianPrices }
  } catch (error) {
    console.error("Error fetching bulk county homepage stats:", error)
    return { countyListingCounts: {}, countyMedianPrices: {} }
  }
}

/**
 * Cached wrapper — revalidates every 30 minutes.
 * Homepage county cards don't need real-time accuracy.
 */
async function getCountyHomepageStats() {
  return unstable_cache(
    () => getCountyHomepageStatsUncached(),
    ["county-homepage-stats-v1"],
    {
      revalidate: 1800, // 30 minutes
      tags: ["county-homepage-stats"],
    }
  )()
}

/**
 * Server Component that fetches county data and renders the CountiesSection.
 * Intended to be wrapped in a <Suspense> boundary so the page shell
 * can stream immediately without waiting for this DB aggregation.
 */
export default async function CountiesSectionServer() {
  const skipDatabase = isBuildTime() || !!process.env.CI || !isDatabaseConfigured()

  const { countyListingCounts, countyMedianPrices } = skipDatabase
    ? { countyListingCounts: {}, countyMedianPrices: {} }
    : await getCountyHomepageStats()

  return (
    <CountiesSection
      countyListingCounts={countyListingCounts}
      countyMedianPrices={countyMedianPrices}
    />
  )
}
