import type { Metadata } from "next"
import PropertyListingHeader from "../../properties/property-header"
import CategoryClient from "../_components/category-client"
import { mapDbRowToProperty } from "../_utils/mapDbRowToProperty"

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams
  const city = params?.city
  const hasFilters = params && Object.keys(params).length > 0
  const location = city ? `${city}, California` : 'California'
  const locationShort = city || 'California'

  return {
    title: `Homes Under $1M for Sale in ${location} | Crown Coastal Homes`,
    description: `Browse affordable homes under $1 million for sale in ${locationShort}. Find your dream home within budget.`,
    openGraph: {
      title: `Homes Under $1M for Sale in ${location}`,
      description: `Browse affordable homes under $1 million in ${locationShort}.`,
    },
    alternates: { canonical: '/buy/under-1m' },
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
  }
}

// ISR: revalidate every 5 minutes — allows CDN caching while keeping listings fresh
export const revalidate = 300

export default async function Under1MPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams
  const city = params?.city

  let initialProperties: ReturnType<typeof mapDbRowToProperty>[] = []
  try {
    const { searchProperties } = await import('@/lib/db/property-repo')
    const result = await searchProperties({
      maxPrice: 1_000_000,
      ...(city ? { city } : {}),
      limit: 18,
      offset: 0,
      sort: 'updated',
    })
    initialProperties = (result.properties || []).map(mapDbRowToProperty)
  } catch (error) {
    console.warn('Error fetching homes under 1M:', error instanceof Error ? error.message : error)
  }

  const location = city ? `${city}, California` : 'California'
  const locationArea = city ? `${city}` : "California's coastal communities"

  return (
    <>
      <PropertyListingHeader
        title={`Homes Under $1M for Sale in ${location}`}
        subtitle={`Discover affordable homes under $1 million in ${locationArea}`}
      />
      <CategoryClient
        initialProperties={initialProperties}
        propertyCategory={[]}
        categoryName="home"
        defaultFilters={{ maxPrice: 1_000_000, city }}
      />
    </>
  )
}
