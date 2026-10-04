import type { Metadata } from "next"
import PropertyListingHeader from "../../properties/property-header"
import CategoryClient from "../_components/category-client"
import { Property } from "@/interfaces"

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams
  const city = params?.city
  const hasFilters = params && Object.keys(params).length > 0

  const location = city ? `${city}, California` : 'California'
  const locationShort = city || 'California'

  return {
    title: `Homes Under $1M for Rent in ${location} | Crown Coastal Homes`,
    description: `Browse affordable homes under $1 million for rent in ${locationShort}. Find your dream home within budget.`,
    openGraph: {
      title: `Homes Under $1M for Rent in ${location}`,
      description: `Browse affordable homes under $1 million in ${locationShort}.`,
    },
    alternates: {
      canonical: '/rent/under-1m',
    },
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
  }
}

// ISR: revalidate every 5 minutes — allows CDN caching while keeping listings fresh
export const revalidate = 300

async function getInitialProperties(city?: string): Promise<Property[]> {
  try {
    // Direct server-side DB access — avoids the HTTP round-trip and no-store overhead
    const { searchProperties } = await import('@/lib/db/property-repo')

    const result = await searchProperties({
      maxPrice: 1000000,
      ...(city ? { city } : {}),
      limit: 18,
      offset: 0,
      sort: 'updated',
    })

    return (result.properties || []).map((p: any) => ({
      _id: p.listing_key,
      id: p.listing_key,
      listing_key: p.listing_key,
      address: p.address || p.unparsed_address || p.cleaned_address || '',
      city: p.city,
      county: p.county_or_parish || p.state || '',
      state: p.state || p.state_or_province,
      postal_code: p.postal_code || '',
      latitude: p.latitude || 0,
      longitude: p.longitude || 0,
      list_price: p.list_price || 0,
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
    console.warn('Error fetching homes under 1M (returning empty array):', error instanceof Error ? error.message : error)
    return []
  }
}

export default async function Under1MPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams
  const city = params?.city
  const initialProperties = await getInitialProperties(city)

  const location = city ? `${city}, California` : 'California'
  const locationArea = city ? `${city}` : "California's coastal communities"

  return (
    <>
      <PropertyListingHeader
        title={`Homes Under $1M for Rent in ${location}`}
        subtitle={`Discover affordable homes under $1 million in ${locationArea}`}
      />
      <CategoryClient
        initialProperties={initialProperties}
        propertyCategory={[]}
        categoryName="home"
        defaultFilters={{
          maxPrice: 1000000,
          city: city,
        }}
      />
    </>
  )
}
