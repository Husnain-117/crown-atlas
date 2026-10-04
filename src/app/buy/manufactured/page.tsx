import type { Metadata } from "next"
import PropertyListingHeader from "../../properties/property-header"
import CategoryClient from "../_components/category-client"
import { mapDbRowToProperty } from "../_utils/mapDbRowToProperty"

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = params && Object.keys(params).length > 0

  return {
    title: "Manufactured Homes for Sale in California | Crown Coastal Homes",
    description: "Browse manufactured and mobile homes for sale across California. Affordable housing options in San Diego, Los Angeles and throughout California.",
    openGraph: {
      title: "Manufactured Homes for Sale in California",
      description: "Browse manufactured and mobile homes for sale across California.",
    },
    alternates: { canonical: '/buy/manufactured' },
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
  }
}

// ISR: revalidate every 5 minutes — allows CDN caching while keeping listings fresh
export const revalidate = 300

export default async function ManufacturedPage() {
  let initialProperties: ReturnType<typeof mapDbRowToProperty>[] = []
  try {
    const { searchProperties } = await import('@/lib/db/property-repo')
    const result = await searchProperties({ propertyCategory: 'manufactured', limit: 18, offset: 0, sort: 'updated' })
    initialProperties = (result.properties || []).map(mapDbRowToProperty)
  } catch (error) {
    console.warn('Error fetching manufactured homes:', error instanceof Error ? error.message : error)
  }

  return (
    <>
      <PropertyListingHeader
        title="Manufactured Homes for Sale in California"
        subtitle="Discover affordable manufactured and mobile homes across California"
      />
      <CategoryClient
        initialProperties={initialProperties}
        propertyCategory={["manufactured", "mobile"]}
        categoryName="manufactured"
      />
    </>
  )
}
