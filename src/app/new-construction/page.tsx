import type { Metadata } from "next"
import PropertyListingHeader from "../properties/property-header"
import CategoryClient from "../buy/_components/category-client"
import { Property } from "@/interfaces"

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = params && Object.keys(params).length > 0

  return {
    title: "New Construction Homes in California | New Builds | Crown Coastal Homes",
    description: "Find new construction homes in California. Browse new builds in San Diego, Los Angeles, Orange County, and the Bay Area. Crown Coastal Homes.",
    openGraph: {
      title: "New Construction Homes in California | Crown Coastal Homes",
      description: "Browse new construction and new build homes across California's coastal markets.",
    },
    alternates: { canonical: "/new-construction" },
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getInitialProperties(): Promise<Property[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://crowncoastalhomes.com')

    const keywords = encodeURIComponent('new construction,new build,newly built,newly constructed')
    const response = await fetch(`${baseUrl}/api/properties?limit=18&offset=0&keywords=${keywords}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch new construction homes:', response.statusText)
      return []
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.warn('Error fetching new construction homes (returning empty array):', error instanceof Error ? error.message : error)
    return []
  }
}

export default async function NewConstructionPage() {
  const initialProperties = await getInitialProperties()

  return (
    <>
      <PropertyListingHeader
        title="New Construction Homes in California"
        subtitle="Discover new build homes and newly constructed listings across California's coastal communities"
      />
      <CategoryClient
        initialProperties={initialProperties}
        propertyCategory={[]}
        categoryName="new construction"
        defaultFilters={{ keywords: "new construction,new build,newly built" }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: "New Construction Homes in California | Crown Coastal Homes", url: "https://crowncoastalhomes.com/new-construction", publisher: { "@type": "Organization", name: "Crown Coastal Homes" } }) }} />
    </>
  )
}
