import { Property } from "@/interfaces"

/**
 * Maps a raw DB row from `searchProperties` / `searchPropertiesCursor`
 * to the canonical `Property` interface used by UI components.
 * Centralised here so every buy/ and rent/ category page uses the same mapping logic.
 */
export function mapDbRowToProperty(p: any): Property {
  return {
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
  }
}
