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
  title: "Homes for Rent in California | Crown Coastal Homes",
  description: "Browse current houses for rent across California, including San Diego, Los Angeles, San Francisco, and other coastal markets.",
  openGraph: {
    title: "Homes for Rent in California",
    description: "Browse luxury houses for rent across California coastal cities.",
      url: `${productionUrl}/rent/houses`,
  },
  alternates: {
      canonical: `${productionUrl}/rent/houses`,
  },
    // Block indexing on preview/staging, and on filtered pages
    robots: isPreview || hasFilters
      ? { index: false, follow: !isPreview }
      : { index: true, follow: true },
  }
}

// ISR: revalidate every 5 minutes — allows CDN caching while keeping listings fresh
export const revalidate = 300

async function getInitialProperties(): Promise<Property[]> {
  try {
    // Use database directly instead of API route (server-side only, secure)
    const { searchProperties } = await import('@/lib/db/property-repo')
    
    const result = await searchProperties({
      status: 'for_rent',
      propertyCategory: 'house', // Single category value
      propertyType: 'ResidentialLease', // Filter for residential properties
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
      status: p.status === 'Active' ? 'FOR RENT' : (p.status || 'UNKNOWN'),
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
        title="Homes for Rent in California"
        subtitle="Compare current single-family rental listings across California by location, monthly price, size, and features."
      />
      <CategoryClient
        initialProperties={initialProperties}
        propertyCategory={["house", "single-family"]}
        categoryName="house"
      />
    </>
  )
}
