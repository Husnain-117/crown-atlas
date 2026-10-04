/**
 * CountyMarketTrendsServer — async Server Component
 * 
 * Fetches and computes county-level market trends (active listings, weighted median,
 * price/sqft, days on market, etc.) in a Suspense-friendly way.
 * 
 * The parent page wraps this in <Suspense> so the hero + shell render instantly
 * while this heavy computation streams in.
 */

import { CountyConfig } from "@/lib/counties"
import { getCountyMetrics } from "@/lib/city-metrics"

export interface CountyMarketTrendsResult {
  marketTrends: Array<{ metric: string; value: string }>
  lastUpdated?: string
  totalActive: number
  weightedMedian: number | null
  totalRent: number
}

export async function getCountyMarketTrendsData(county: CountyConfig): Promise<CountyMarketTrendsResult> {
  try {
    const metrics = await getCountyMetrics(county.name)
    const marketTrends: Array<{ metric: string; value: string }> = []

    const addCount = (metric: string, value?: number) => {
      if (typeof value === "number" && value > 0) {
        marketTrends.push({ metric, value: value.toLocaleString("en-US") })
      }
    }

    addCount("Active Listings", metrics.activeListings)
    addCount("New Listings (7 Days)", metrics.newListings7d)
    addCount("Homes for Sale", metrics.housesCount)
    addCount("Condos for Sale", metrics.condosCount)
    addCount("Homes Under $1M", metrics.under1mCount)
    addCount("Properties with Pool", metrics.poolCount)

    const hasData = marketTrends.length > 0 || metrics.medianPrice != null || (metrics.totalRent ?? 0) > 0

    return {
      marketTrends,
      lastUpdated: hasData ? new Date().toISOString() : undefined,
      totalActive: metrics.activeListings || 0,
      weightedMedian: metrics.medianPrice,
      totalRent: metrics.totalRent || 0,
    }
  } catch (error) {
    console.error(`[CountyMarketTrends] Failed for ${county.slug}:`, error)
    return {
      marketTrends: [],
      totalActive: 0,
      weightedMedian: null,
      totalRent: 0,
    }
  }
}
