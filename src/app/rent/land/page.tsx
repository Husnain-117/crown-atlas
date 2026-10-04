import type { Metadata } from "next"
import PropertyListingHeader from "../../properties/property-header"
import CategoryClient from "../_components/category-client"
import { mapDbRowToProperty } from "../../buy/_utils/mapDbRowToProperty"

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = params && Object.keys(params).length > 0
  const productionUrl = 'https://crowncoastalhomes.com'

  return {
    title: "Land for Rent in California | Crown Coastal Homes",
    description: "Browse land and lots available for rent or lease across California. Agricultural, residential, and commercial land in San Diego, Los Angeles and more.",
    openGraph: {
      title: "Land for Rent in California",
      description: "Browse land and lots available for rent or lease across California.",
      url: `${productionUrl}/rent/land`,
    },
    alternates: { canonical: `${productionUrl}/rent/land` },
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
  }
}

// ISR: revalidate every 5 minutes — allows CDN caching while keeping listings fresh
export const revalidate = 300

export default async function LandRentPage() {
  let initialProperties: ReturnType<typeof mapDbRowToProperty>[] = []
  try {
    const { searchProperties } = await import('@/lib/db/property-repo')
    const result = await searchProperties({
      status: 'for_rent',
      propertyCategory: 'land',
      limit: 18,
      offset: 0,
      sort: 'updated',
    })
    initialProperties = (result.properties || []).map((p: any) => ({
      ...mapDbRowToProperty(p),
      status: p.status === 'Active' ? 'FOR RENT' : (p.status || 'UNKNOWN'),
    }))
  } catch (error) {
    console.warn('Error fetching land rentals:', error instanceof Error ? error.message : error)
  }

  return (
    <>
      <PropertyListingHeader
        title="Land for Rent in California"
        subtitle="Discover land parcels and lots available for rent across California"
      />
      <CategoryClient
        initialProperties={initialProperties}
        propertyCategory={["land"]}
        categoryName="land"
      />
    </>
  )
}
