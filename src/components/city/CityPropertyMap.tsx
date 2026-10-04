"use client"

import dynamic from "next/dynamic"

const LazyCityMap = dynamic(() => import("@/components/lazy-city-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-xl bg-[var(--surface-muted)] flex items-center justify-center">
      <div className="text-[var(--coastal-muted-text)]">Loading map...</div>
    </div>
  ),
})

interface CityPropertyMapProps {
  properties: any[]
  cityName: string
  action: "buy" | "rent"
}

function parseMediaUrls(raw: any): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

const SD_FALLBACK_BOUNDS: [number, number, number, number] = [32.53, -117.28, 33.11, -116.90]

export default function CityPropertyMap({ properties, cityName, action }: CityPropertyMapProps) {
  const mapProperties = (properties || [])
    .filter((p) => {
      const lat = typeof p.latitude === "string" ? parseFloat(p.latitude) : p.latitude
      const lng = typeof p.longitude === "string" ? parseFloat(p.longitude) : p.longitude
      return typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
    })
    .map((p) => ({
      listing_key: p.listing_key,
      latitude: typeof p.latitude === "string" ? parseFloat(p.latitude) : p.latitude,
      longitude: typeof p.longitude === "string" ? parseFloat(p.longitude) : p.longitude,
      list_price: p.list_price,
      current_price: p.list_price,
      address: p.unparsed_address || p.address || p.city || "Property",
      city: p.city || "",
      status: action === "buy" ? "FOR SALE" : "FOR RENT",
      property_type: p.property_type || "Residential",
      bedrooms: p.bedrooms_total ?? p.bedrooms ?? 0,
      bathrooms: p.bathrooms_total ?? p.bathrooms ?? 0,
      living_area_sqft: p.living_area ?? p.living_area_sqft ?? 0,
      images: parseMediaUrls(p.media_urls).length > 0
        ? parseMediaUrls(p.media_urls)
        : p.main_photo_url
          ? [p.main_photo_url]
          : [],
      main_image_url: p.main_photo_url || "",
    }))

  let bounds: [number, number, number, number]
  if (mapProperties.length > 0) {
    const lats = mapProperties.map((p) => p.latitude)
    const lngs = mapProperties.map((p) => p.longitude)
    bounds = [
      Math.min(...lats) - 0.005,
      Math.min(...lngs) - 0.005,
      Math.max(...lats) + 0.005,
      Math.max(...lngs) + 0.005,
    ]
  } else {
    bounds = SD_FALLBACK_BOUNDS
  }

  return <LazyCityMap bounds={bounds} properties={mapProperties} cityName={cityName} />
}
