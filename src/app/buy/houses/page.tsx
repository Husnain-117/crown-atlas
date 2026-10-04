import type { Metadata } from "next"
import PropertyListingHeader from "../../properties/property-header"
import CategoryClient from "../_components/category-client"
import { Property } from "@/interfaces"

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = params && Object.keys(params).length > 0
  const isPreview = process.env.VERCEL && process.env.VERCEL_ENV !== 'production'
  const productionUrl = 'https://crowncoastalhomes.com'

  return {
  title: "Homes for Sale in California | Crown Coastal Homes",
  description: "Browse current houses for sale across California, including San Diego, Los Angeles, San Francisco, and other coastal markets.",
  openGraph: {
    title: "Homes for Sale in California",
    description: "Browse luxury houses for sale across California coastal cities.",
      url: `${productionUrl}/buy/houses`,
  },
  alternates: {
      canonical: `${productionUrl}/buy/houses`,
  },
    // Block indexing on preview/staging, and on filtered pages
    robots: isPreview || hasFilters
      ? { index: false, follow: !isPreview }
      : { index: true, follow: true },
  }
}

// Force dynamic rendering to avoid build-time fetch issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getInitialProperties(): Promise<Property[]> {
  try {
    // Use database directly instead of API route (server-side only, secure)
    const { searchProperties } = await import('@/lib/db/property-repo')
    
    const result = await searchProperties({
      propertyCategory: 'house', // Single category value
      propertyType: 'Residential', // Filter for residential properties
      limit: 18,
      offset: 0,
      sort: 'updated',
    })

    // Convert database properties to canonical Property format
    return (result.properties || []).map((p: any) => ({
      _id: p.listing_key,
      id: p.listing_key,
      listing_key: p.listing_key,
      address: p.unparsed_address || p.cleaned_address || '',
      city: p.city,
      county: p.county || p.county_or_parish || p.state || '', // required by Property interface
      state: p.state || p.state_or_province,
      postal_code: p.postal_code || '',
      latitude: p.latitude || 0,
      longitude: p.longitude || 0,
      list_price: p.list_price || 0,
      current_price: p.list_price || 0,
      bedrooms: p.bedrooms_total ?? null,
      bathrooms: p.bathrooms_total ?? null,
      living_area_sqft: p.living_area ?? null,
      property_type: p.property_type,
      status: p.status === 'Active' ? 'FOR SALE' : (p.status || 'UNKNOWN'),
      images: p.media_urls
        ? (typeof p.media_urls === 'string' ? JSON.parse(p.media_urls) : p.media_urls)
        : (p.main_photo_url ? [p.main_photo_url] : []),
      main_image_url: p.main_photo_url || '',
      image: p.main_photo_url || '',
      location: p.city,
    }))
  } catch (error) {
    console.warn('Error fetching houses (returning empty array):', error instanceof Error ? error.message : error)
    return []
  }
}

export default async function HousesPage() {
  const initialProperties = await getInitialProperties()

  return (
    <>
      <PropertyListingHeader
        title="Homes for Sale in California"
        subtitle="Compare current single-family home listings across California by location, price, size, and features."
      />
      <CategoryClient
        initialProperties={initialProperties}
        propertyCategory={["house", "single-family"]}
        categoryName="house"
      />
    </>
  )
}
