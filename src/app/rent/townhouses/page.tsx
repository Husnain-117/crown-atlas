import type { Metadata } from "next"
import PropertyListingHeader from "../../properties/property-header"
import CategoryClient from "../_components/category-client"
import { mapDbRowToProperty } from "../../buy/_utils/mapDbRowToProperty"

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = params && Object.keys(params).length > 0
  const productionUrl = 'https://crowncoastalhomes.com'

  return {
    title: "Townhouses for Rent in California | Crown Coastal Homes",
    description: "Browse townhouses and townhomes for rent across California. Find your perfect rental townhome in San Diego, Los Angeles, San Francisco and more.",
    openGraph: {
      title: "Townhouses for Rent in California",
      description: "Browse townhouses and townhomes for rent across California.",
      url: `${productionUrl}/rent/townhouses`,
    },
    alternates: { canonical: `${productionUrl}/rent/townhouses` },
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
  }
}

// ISR: revalidate every 5 minutes — allows CDN caching while keeping listings fresh
export const revalidate = 300

export default async function TownhousesRentPage() {
  let initialProperties: ReturnType<typeof mapDbRowToProperty>[] = []
  try {
    const { searchProperties } = await import('@/lib/db/property-repo')
    const result = await searchProperties({
      status: 'for_rent',
      propertyCategory: 'townhouse',
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
    console.warn('Error fetching rental townhouses:', error instanceof Error ? error.message : error)
  }

  return (
    <>
      <PropertyListingHeader
        title="Townhouses for Rent in California"
        subtitle="Discover beautiful rental townhouses across California's coastal communities"
      />
      <CategoryClient
        initialProperties={initialProperties}
        propertyCategory={["townhouse", "townhome"]}
        categoryName="townhouse"
      />
    </>
  )
}
