import { unstable_cache } from "next/cache"
import { getCountyCities } from "@/lib/counties"
import { getCityListingMetrics } from "@/lib/city-metrics"

export interface CityCountStats {
  city: string
  slug: string
  count: number
  medianPrice?: number
}

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) return [items]
  const out: T[][] = []
  for (let i = 0; i < items.length; i += chunkSize) {
    out.push(items.slice(i, i + chunkSize))
  }
  return out
}

/** Cached result: both buy and rent in one computation so city card and detail page never mismatch. */
async function getCountyCityCountsUncached(countySlug: string): Promise<{ buy: CityCountStats[]; rent: CityCountStats[] }> {
  const cities = getCountyCities(countySlug)
  if (cities.length === 0) return { buy: [], rent: [] }

  // Important: limit concurrency.
  // `getCityListingMetrics` now uses semaphore internally, but we still batch to avoid
  // overwhelming the system with too many concurrent requests at the county level.
  // Increased from 2 to 5 since semaphore handles global coordination.
  const cityConcurrency = Number(process.env.COUNTY_CITY_METRICS_CONCURRENCY ?? 5)
  const results: Array<
    | {
        city: string
        slug: string
        buyCount: number
        rentCount: number
        medianSalePrice: number | undefined
        medianRentPrice: number | undefined
      }
    | null
  > = []

  for (const batch of chunkArray(cities, cityConcurrency)) {
    const batchResults = await Promise.allSettled(
      batch.map(async (city) => {
        try {
          const m = await getCityListingMetrics({ citySlug: city.slug, countySlug })
          return {
            city: city.name,
            slug: city.slug,
            buyCount: m.totalSales,
            rentCount: m.totalRentals,
            medianSalePrice: m.medianSalePrice ?? undefined,
            medianRentPrice: m.medianRentPrice ?? undefined,
          }
        } catch (error) {
          const errorMessage = (error as Error).message?.toLowerCase() || ''
          // Suppress verbose logging for circuit breaker/semaphore errors (expected under load)
          if (errorMessage.includes('circuit breaker') || errorMessage.includes('semaphore')) {
            console.warn(`[getCountyCityCounts] ${city.slug}: ${errorMessage.slice(0, 60)}...`)
          } else {
            console.error(`[getCountyCityCounts] Error fetching metrics for ${city.slug}:`, error)
          }
          return {
            city: city.name,
            slug: city.slug,
            buyCount: 0,
            rentCount: 0,
            medianSalePrice: undefined,
            medianRentPrice: undefined,
          }
        }
      })
    )

    for (const r of batchResults) {
      results.push(r.status === "fulfilled" ? r.value : null)
    }
  }

  // Extract successful results and failed fallbacks
  const validResults = results.filter(Boolean) as Array<{
    city: string
    slug: string
    buyCount: number
    rentCount: number
    medianSalePrice: number | undefined
    medianRentPrice: number | undefined
  }>

  const buy: CityCountStats[] = validResults.map((r) => ({
    city: r.city,
    slug: r.slug,
    count: r.buyCount,
    medianPrice: r.medianSalePrice,
  }))
  const rent: CityCountStats[] = validResults.map((r) => ({
    city: r.city,
    slug: r.slug,
    count: r.rentCount,
    medianPrice: r.medianRentPrice,
  }))
  return { buy, rent }
}

/**
 * Single source of truth: city card and city detail page use the same metrics.
 * Buy and rent come from one cached computation (getCityListingMetrics per city) so counts never mismatch.
 */
export async function getCountyCityCounts(
  countySlug: string,
  action: "buy" | "rent"
): Promise<CityCountStats[]> {
  try {
    // If there are no cities configured for this county, avoid the expensive
    // "cache empty -> fetch fresh" fallback loop during build/CI.
    // (This is also consistent with what getCountyCityCountsUncached would return.)
    const configuredCities = getCountyCities(countySlug)
    if (configuredCities.length === 0) return []

    const cached = await unstable_cache(
      () => getCountyCityCountsUncached(countySlug),
      ["county-city-counts-v7", countySlug], // Bumped version for semaphore integration
      { 
        revalidate: 300, // 5 minutes for fresher data
        tags: ["county-city-counts", `county-${countySlug}`] 
      }
    )()
    
    const result = action === "buy" ? cached.buy : cached.rent
    
    // If cache returns an empty array, we intentionally do NOT do an uncached
    // re-fetch here. In CI/build, repeated uncached fetches for "empty-config"
    // counties can cause build timeouts. Revalidation will refresh at runtime.
    if (!result || result.length === 0) return []

    return result
  } catch (error) {
    console.error(`[getCountyCityCounts] Cache error for ${countySlug}:`, error)
    // Fallback to uncached fetch on cache failure
    const fresh = await getCountyCityCountsUncached(countySlug)
    return action === "buy" ? fresh.buy : fresh.rent
  }
}
