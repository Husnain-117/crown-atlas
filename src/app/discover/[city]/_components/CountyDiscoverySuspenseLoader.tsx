/**
 * CountyDiscoverySuspenseLoader — async Server Component
 *
 * Fetches all the heavy county data (city counts + market trends) and renders
 * the fully-hydrated CountyDiscoveryPage. The parent wraps this in <Suspense>
 * so the page shell renders instantly.
 */

import React from "react"
import { CountyConfig } from "@/lib/counties"
import CountyDiscoveryPage from "./CountyDiscoveryPage"
import { getCountyCityGridData } from "./CountyCityGridServer"
import { getCountyMarketTrendsData } from "./CountyMarketTrendsServer"

interface Props {
  county: CountyConfig
  page: number
  /** Inline <style> block passed from parent (dark-mode overrides). */
  styleHtml: string
}

export default async function CountyDiscoverySuspenseLoader({ county, page, styleHtml }: Props) {
  // Run the two heavy fetches in parallel
  const [gridData, trendsData] = await Promise.all([
    getCountyCityGridData(county, page),
    getCountyMarketTrendsData(county),
  ])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styleHtml }} />
      <CountyDiscoveryPage
        county={county}
        buyCounts={gridData.buyCounts}
        rentCounts={gridData.rentCounts}
        featuredProperties={[]}
        marketTrends={trendsData.marketTrends}
        lastUpdated={trendsData.lastUpdated}
        totalActive={trendsData.totalActive}
        totalRent={trendsData.totalRent}
        avgMedian={trendsData.weightedMedian}
        displayCities={gridData.displayCities}
        cityPage={gridData.cityPage}
        cityTotalPages={gridData.cityTotalPages}
        cityBasePath={gridData.cityBasePath}
      />
    </>
  )
}
