import type { Metadata } from "next"
import PropertyListingHeader from "../../properties/property-header"
import CategoryClient from "../_components/category-client"
import { mapDbRowToProperty } from "../../buy/_utils/mapDbRowToProperty"

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = params && Object.keys(params).length > 0
  const productionUrl = 'https://crowncoastalhomes.com'

  return {
    title: "Manufactured Homes for Rent in California | Crown Coastal Homes",
    description: "Browse manufactured and mobile homes for rent across California. Affordable rental housing options in San Diego, Los Angeles and throughout California.",
    openGraph: {
      title: "Manufactured Homes for Rent in California",
      description: "Browse manufactured and mobile homes for rent across California.",
      url: `${productionUrl}/rent/manufactured`,
    },
    alternates: { canonical: `${productionUrl}/rent/manufactured` },
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
  }
}

// ISR: revalidate every 5 minutes — allows CDN caching while keeping listings fresh
export const revalidate = 300

export default async function ManufacturedRentPage() {
  let initialProperties: ReturnType<typeof mapDbRowToProperty>[] = []
  try {
    const { searchProperties } = await import('@/lib/db/property-repo')
    const result = await searchProperties({
      status: 'for_rent',
      propertyCategory: 'manufactured',
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
    console.warn('Error fetching manufactured rentals:', error instanceof Error ? error.message : error)
  }

  return (
    <>
      <PropertyListingHeader
        title="Manufactured Homes for Rent in California"
        subtitle="Discover affordable manufactured and mobile home rentals across California"
      />
      <CategoryClient
        initialProperties={initialProperties}
        propertyCategory={["manufactured", "mobile"]}
        categoryName="manufactured"
      />
    </>
  )
}
