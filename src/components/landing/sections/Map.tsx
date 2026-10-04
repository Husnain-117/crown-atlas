"use client"

import dynamic from "next/dynamic"
import type { LandingPropertyCard } from "@/types/landing"

const CityMap = dynamic(() => import("@/components/city-map"), {
  ssr: false,
  loading: () => (
    <div className="aspect-video w-full animate-pulse rounded-lg bg-[var(--surface-muted)]" role="status">
      <span className="sr-only">Loading property map</span>
    </div>
  ),
})

interface Props {
  city: string
  properties: LandingPropertyCard[]
}

function mapBounds(properties: LandingPropertyCard[]): [number, number, number, number] | null {
  const coordinates = properties
    .map((property) => ({ lat: Number(property.lat), lng: Number(property.lng) }))
    .filter(({ lat, lng }) => Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0)

  if (coordinates.length === 0) return null

  const latitudes = coordinates.map(({ lat }) => lat)
  const longitudes = coordinates.map(({ lng }) => lng)
  let south = Math.min(...latitudes)
  let north = Math.max(...latitudes)
  let west = Math.min(...longitudes)
  let east = Math.max(...longitudes)
  const latPadding = Math.max((north - south) * 0.08, 0.015)
  const lngPadding = Math.max((east - west) * 0.08, 0.015)

  south -= latPadding
  north += latPadding
  west -= lngPadding
  east += lngPadding
  return [south, west, north, east]
}

export default function MapSection({ city, properties }: Props) {
  const visibleProperties = properties.filter((property) => {
    const lat = Number(property.lat)
    const lng = Number(property.lng)
    return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0
  })
  const bounds = mapBounds(visibleProperties)
  if (!bounds || visibleProperties.length === 0) return null

  const mapProperties = visibleProperties.map((property) => ({
    listing_key: property.listingKey,
    address: property.address,
    city: property.city,
    state: property.state || "CA",
    latitude: Number(property.lat),
    longitude: Number(property.lng),
    list_price: property.price,
    bedrooms: property.beds,
    bathrooms: property.baths,
    living_area_sqft: property.sqft,
    property_type: property.propertyType || "Residential",
    status: "FOR SALE",
    images: property.img ? [property.img] : ["/luxury-modern-house-exterior.png"],
    main_image_url: property.img || null,
    photosCount: property.photosCount || (property.img ? 1 : 0),
  }))

  return (
    <section id="map" aria-labelledby="landing-map-title">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="landing-map-title" className="text-xl font-bold text-[var(--coastal-text)]">
          Featured listing locations in {city}
        </h2>
        <span className="text-sm text-[var(--coastal-muted-text)]">
          {visibleProperties.length} shown
        </span>
      </div>
      <CityMap bounds={bounds} properties={mapProperties} />
    </section>
  )
}
