import type { Metadata } from "next"
import PropertyListingHeader from "../../properties/property-header"
import CategoryClient from "../_components/category-client"
import { mapDbRowToProperty } from "../_utils/mapDbRowToProperty"

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = params && Object.keys(params).length > 0

  return {
    title: "Townhouses for Sale in California | Crown Coastal Homes",
    description: "Browse townhouses and townhomes for sale across California. Find your perfect townhouse in San Diego, Los Angeles, San Francisco and more.",
    openGraph: {
      title: "Townhouses for Sale in California",
      description: "Browse townhouses and townhomes for sale across California.",
    },
    alternates: { canonical: '/buy/townhouses' },
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
  }
}

// ISR: revalidate every 5 minutes — allows CDN caching while keeping listings fresh
export const revalidate = 300

export default async function TownhousesPage() {
  let initialProperties: ReturnType<typeof mapDbRowToProperty>[] = []
  try {
    const { searchProperties } = await import('@/lib/db/property-repo')
    const result = await searchProperties({ propertyCategory: 'townhouse', limit: 18, offset: 0, sort: 'updated' })
    initialProperties = (result.properties || []).map(mapDbRowToProperty)
  } catch (error) {
    console.warn('Error fetching townhouses:', error instanceof Error ? error.message : error)
  }

  return (
    <>
      <PropertyListingHeader
        title="Townhouses for Sale in California"
        subtitle="Discover beautiful townhouses and townhomes across California's coastal communities"
      />
      <CategoryClient
        initialProperties={initialProperties}
        propertyCategory={["townhouse", "townhome"]}
        categoryName="townhouse"
      />
    </>
  )
}
