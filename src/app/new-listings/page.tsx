import type { Metadata } from "next"
import PropertyListingHeader from "../properties/property-header"
import CategoryClient from "../buy/_components/category-client"
import { Property } from "@/interfaces"

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = params && Object.keys(params).length > 0
  const isPreview = process.env.VERCEL && process.env.VERCEL_ENV !== 'production'
  const productionUrl = 'https://crowncoastalhomes.com'

  return {
    title: "New Listings in California | Just Listed Homes | Crown Coastal Homes",
    description: "Browse new listings and just listed homes in California. Find the latest properties in San Diego, Los Angeles, Orange County, and the Bay Area.",
    openGraph: { 
      title: "New Listings in California | Crown Coastal Homes", 
      description: "Just listed homes and new listings across California.",
      url: `${productionUrl}/new-listings`,
    },
    alternates: { canonical: `${productionUrl}/new-listings` },
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
    const { searchProperties } = await import('@/lib/db/property-repo')
    
    const result = await searchProperties({
      status: 'for_sale',
      state: 'CA',
      sort: 'newest',
      daysListed: 21, // Properties listed within 21 days
      limit: 18,
      offset: 0,
    })

    return (result.properties || []).map((p: any) => ({
      _id: p.listing_key,
      id: p.listing_key,
      listing_key: p.listing_key,
      address: p.unparsed_address || p.cleaned_address || '',
      city: p.city,
      county: p.county || p.county_or_parish || p.state || '',
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
    console.warn('Error fetching new listings (returning empty array):', error instanceof Error ? error.message : error)
    return []
  }
}

export default async function NewListingsPage() {
  const initialProperties = await getInitialProperties()

  return (
    <>
      <PropertyListingHeader
        title="New Listings in California"
        subtitle="Recently listed homes and current properties for sale across California's coastal markets"
      />
      <CategoryClient
        initialProperties={initialProperties}
        propertyCategory={[]}
        categoryName="new listing"
        defaultFilters={{ daysListed: 21 }}
      />
    </>
  )
}
