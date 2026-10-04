import type { Metadata } from "next"
import PropertyListingHeader from "../../properties/property-header"
import CategoryClient from "../_components/category-client"
import { mapDbRowToProperty } from "../../buy/_utils/mapDbRowToProperty"

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = params && Object.keys(params).length > 0
  const productionUrl = 'https://crowncoastalhomes.com'

  return {
    title: "Commercial Space for Rent in California | Crown Coastal Homes",
    description: "Browse commercial properties and office space for rent across California. Retail, office, and industrial spaces available in San Diego, Los Angeles and more.",
    openGraph: {
      title: "Commercial Space for Rent in California",
      description: "Browse commercial properties for rent across California.",
      url: `${productionUrl}/rent/commercial`,
    },
    alternates: { canonical: `${productionUrl}/rent/commercial` },
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
  }
}

// ISR: revalidate every 5 minutes — allows CDN caching while keeping listings fresh
export const revalidate = 300

export default async function CommercialRentPage() {
  let initialProperties: ReturnType<typeof mapDbRowToProperty>[] = []
  try {
    const { searchProperties } = await import('@/lib/db/property-repo')
    const result = await searchProperties({
      keywords: 'commercial,office,retail,industrial',
      limit: 18,
      offset: 0,
      sort: 'updated',
    })
    initialProperties = (result.properties || []).map((p: any) => ({
      ...mapDbRowToProperty(p),
      status: p.status === 'Active' ? 'FOR RENT' : (p.status || 'UNKNOWN'),
    }))
  } catch (error) {
    console.warn('Error fetching commercial rentals:', error instanceof Error ? error.message : error)
  }

  return (
    <>
      <PropertyListingHeader
        title="Commercial Space for Rent in California"
        subtitle="Discover commercial properties and office spaces available across California"
      />
      <CategoryClient
        initialProperties={initialProperties}
        propertyCategory={[]}
        categoryName="commercial"
      />
    </>
  )
}
