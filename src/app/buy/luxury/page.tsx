import type { Metadata } from "next"
import PropertyListingHeader from "../../properties/property-header"
import CategoryClient from "../_components/category-client"
import { mapDbRowToProperty } from "../_utils/mapDbRowToProperty"

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = params && Object.keys(params).length > 0

  return {
    title: "Luxury Homes for Sale in California | Crown Coastal Homes",
    description: "Browse exclusive luxury homes and estates for sale across California. High-end properties in San Diego, Los Angeles, San Francisco and coastal communities.",
    openGraph: {
      title: "Luxury Homes for Sale in California",
      description: "Browse exclusive luxury homes and estates across California.",
    },
    alternates: { canonical: '/buy/luxury' },
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
  }
}

// ISR: revalidate every 5 minutes — allows CDN caching while keeping listings fresh
export const revalidate = 300

export default async function LuxuryPage() {
  let initialProperties: ReturnType<typeof mapDbRowToProperty>[] = []
  try {
    const { searchProperties } = await import('@/lib/db/property-repo')
    const result = await searchProperties({ minPrice: 1_000_000, limit: 18, offset: 0, sort: 'updated' })
    initialProperties = (result.properties || []).map(mapDbRowToProperty)
  } catch (error) {
    console.warn('Error fetching luxury homes:', error instanceof Error ? error.message : error)
  }

  return (
    <>
      <PropertyListingHeader
        title="Luxury Homes for Sale in California"
        subtitle="Discover exclusive luxury estates and high-end properties across California"
      />
      <CategoryClient
        initialProperties={initialProperties}
        propertyCategory={[]}
        categoryName="luxury"
      />
    </>
  )
}
