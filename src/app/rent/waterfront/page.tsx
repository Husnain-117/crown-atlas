import type { Metadata } from "next"
import PropertyListingHeader from "../../properties/property-header"
import CategoryClient from "../_components/category-client"
import { mapDbRowToProperty } from "../../buy/_utils/mapDbRowToProperty"

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = params && Object.keys(params).length > 0
  const productionUrl = 'https://crowncoastalhomes.com'

  return {
    title: "Waterfront Homes for Rent in California | Crown Coastal Homes",
    description: "Browse luxury waterfront and beachfront homes for rent across California. Ocean view rentals in San Diego, Malibu, San Francisco and coastal cities.",
    openGraph: {
      title: "Waterfront Homes for Rent in California",
      description: "Browse luxury waterfront and beachfront homes for rent across California.",
      url: `${productionUrl}/rent/waterfront`,
    },
    alternates: { canonical: `${productionUrl}/rent/waterfront` },
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
  }
}

// ISR: revalidate every 5 minutes — allows CDN caching while keeping listings fresh
export const revalidate = 300

export default async function WaterfrontRentPage() {
  let initialProperties: ReturnType<typeof mapDbRowToProperty>[] = []
  try {
    const { searchProperties } = await import('@/lib/db/property-repo')
    const result = await searchProperties({
      status: 'for_rent',
      keywords: 'waterfront,ocean,beach,bay',
      propertyType: 'ResidentialLease',
      limit: 18,
      offset: 0,
      sort: 'updated',
    })
    initialProperties = (result.properties || []).map((p: any) => ({
      ...mapDbRowToProperty(p),
      status: p.status === 'Active' ? 'FOR RENT' : (p.status || 'UNKNOWN'),
    }))
  } catch (error) {
    console.warn('Error fetching waterfront rentals:', error instanceof Error ? error.message : error)
  }

  return (
    <>
      <PropertyListingHeader
        title="Waterfront Homes for Rent in California"
        subtitle="Discover exclusive waterfront and beachfront rental properties along California's coast"
      />
      <CategoryClient
        initialProperties={initialProperties}
        propertyCategory={[]}
        categoryName="waterfront"
      />
    </>
  )
}
