import type { Metadata } from "next"
import PropertyListingHeader from "../../properties/property-header"
import CategoryClient from "../_components/category-client"
import { mapDbRowToProperty } from "../_utils/mapDbRowToProperty"

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = params && Object.keys(params).length > 0

  return {
    title: "Waterfront Homes for Sale in California | Crown Coastal Homes",
    description: "Browse luxury waterfront and beachfront homes for sale across California. Ocean view properties in San Diego, Malibu, San Francisco and coastal cities.",
    openGraph: {
      title: "Waterfront Homes for Sale in California",
      description: "Browse luxury waterfront and beachfront homes across California.",
    },
    alternates: { canonical: '/buy/waterfront' },
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
  }
}

// ISR: revalidate every 5 minutes — allows CDN caching while keeping listings fresh
export const revalidate = 300

export default async function WaterfrontPage() {
  let initialProperties: ReturnType<typeof mapDbRowToProperty>[] = []
  try {
    const { searchProperties } = await import('@/lib/db/property-repo')
    const result = await searchProperties({
      keywords: 'waterfront,ocean,beach,bay',
      limit: 18,
      offset: 0,
      sort: 'updated',
    })
    initialProperties = (result.properties || []).map(mapDbRowToProperty)
  } catch (error) {
    console.warn('Error fetching waterfront homes:', error instanceof Error ? error.message : error)
  }

  return (
    <>
      <PropertyListingHeader
        title="Waterfront Homes for Sale in California"
        subtitle="Discover exclusive waterfront and beachfront properties across California's stunning coastline"
      />
      <CategoryClient
        initialProperties={initialProperties}
        propertyCategory={[]}
        categoryName="waterfront"
      />
    </>
  )
}
