/**
 * CountyCityGridServer — async Server Component
 * 
 * Fetches buy/rent counts for a paginated subset of county cities.
 * The parent page wraps this in <Suspense> so the rest of the page
 * renders instantly while city metrics stream in.
 */

import { CountyConfig, CountyCity } from "@/lib/counties"
import { getCountyCityCounts, CityCountStats } from "@/lib/county-stats"

const CITIES_PER_PAGE = 12

export interface CountyCityGridData {
  buyCounts: CityCountStats[]
  rentCounts: CityCountStats[]
  displayCities: CountyCity[]
  sortedCountyCities: CountyCity[]
  cityPage: number
  cityTotalPages: number
  cityBasePath: string
}

export async function getCountyCityGridData(
  county: CountyConfig,
  page: number
): Promise<CountyCityGridData> {
  // Fetch all buy/rent counts (cached with unstable_cache inside getCountyCityCounts)
  const [buyCounts, rentCounts] = await Promise.all([
    getCountyCityCounts(county.slug, "buy"),
    getCountyCityCounts(county.slug, "rent"),
  ])

  const buyCountBySlug = new Map(buyCounts.map((c) => [c.slug, c.count ?? 0]))
  const rentCountBySlug = new Map(rentCounts.map((c) => [c.slug, c.count ?? 0]))

  // Hide cards with both saleCount=0 and rentCount=0
  const activeCountyCities = county.cities.filter((c) => {
    const buy = buyCountBySlug.get(c.slug) ?? 0
    const rent = rentCountBySlug.get(c.slug) ?? 0
    return buy > 0 || rent > 0
  })

  const sortedCountyCities = [...activeCountyCities].sort(
    (a, b) => (buyCountBySlug.get(b.slug) ?? 0) - (buyCountBySlug.get(a.slug) ?? 0)
  )

  const cityPage = Math.max(1, page || 1)
  const cityTotalPages = Math.ceil(sortedCountyCities.length / CITIES_PER_PAGE)
  const displayCities = sortedCountyCities.slice(
    (cityPage - 1) * CITIES_PER_PAGE,
    cityPage * CITIES_PER_PAGE
  )
  const cityBasePath = `/discover/${county.slug}`

  return {
    buyCounts,
    rentCounts,
    displayCities,
    sortedCountyCities,
    cityPage,
    cityTotalPages,
    cityBasePath,
  }
}
