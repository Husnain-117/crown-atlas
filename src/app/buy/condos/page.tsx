import type { Metadata } from "next"
import PropertyListingHeader from "../../properties/property-header"
import CategoryClient from "../_components/category-client"
import { Property } from "@/interfaces"

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = params && Object.keys(params).length > 0

  return {
    title: "Luxury Condos for Sale in California | Crown Coastal",
    description: "Explore current condos for sale across California, including coastal units, high-rises, and townhomes in San Diego, Los Angeles, and San Francisco.",
    openGraph: {
      title: "Luxury Condos for Sale in California | Crown Coastal",
      description: "Explore current condos for sale across California coastal cities and request guidance from a licensed agent.",
    },
    alternates: {
      canonical: '/buy/condos',
    },
    // Noindex filtered pages to prevent crawl budget waste
    robots: hasFilters
      ? { index: false, follow: true }
      : { index: true, follow: true },
  }
}

// ISR: revalidate every 5 minutes — allows CDN caching while keeping listings fresh
export const revalidate = 300

async function getInitialProperties(): Promise<Property[]> {
  try {
    // Direct server-side DB access — avoids the HTTP round-trip and no-store overhead
    const { searchProperties } = await import('@/lib/db/property-repo')

    const result = await searchProperties({
      propertyCategory: 'condo',
      propertyType: 'Residential',
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
    console.warn('Error fetching condos (returning empty array):', error instanceof Error ? error.message : error)
    return []
  }
}

export default async function CondosPage() {
  const initialProperties = await getInitialProperties()

  return (
    <>
      <PropertyListingHeader
        title="Luxury Condos for Sale in California"
        subtitle="Compare current California condo listings, including property details, HOA information when provided, photos, and prices."
      />
      <CategoryClient
        initialProperties={initialProperties}
        propertyCategory={["condo"]}
        categoryName="condo"
      />
    </>
  )
}
