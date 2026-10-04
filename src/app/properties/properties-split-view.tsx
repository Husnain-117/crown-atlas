"use client"

import { useState, useMemo, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { useTrestlePropertiesIntegrated, type TrestlePropertyFilters } from "@/hooks/useTrestlePropertiesIntegrated"
import { PropertyCard } from "@/components/property-card"
import { MapPin, Loader2 } from "lucide-react"

const PropertyMap = dynamic(() => import("../map/property-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[var(--surface-muted)] animate-pulse rounded-2xl flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--coastal-muted-text)]" />
    </div>
  ),
})

const DEFAULT_BOUNDS = { north: 42, south: 32.5, east: -114, west: -124.5 }

export default function PropertiesSplitView() {
  const searchParams = useSearchParams()
  const [mapBounds, setMapBounds] = useState(DEFAULT_BOUNDS)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const apiParams = useMemo<TrestlePropertyFilters>(() => {
    const p: TrestlePropertyFilters = {}
    const city = searchParams?.get("city")
    const county = searchParams?.get("county")
    const location = searchParams?.get("location")
    const searchLocationType = searchParams?.get("searchLocationType")

    if (location && searchLocationType === "city") p.city = location
    else if (location && searchLocationType === "county") p.state = location
    else if (city) p.city = city
    if (county) p.state = county

    const minPrice = searchParams?.get("minPrice")
    const maxPrice = searchParams?.get("maxPrice")
    if (minPrice) p.minPrice = parseInt(minPrice)
    if (maxPrice) p.maxPrice = parseInt(maxPrice)

    const beds = searchParams?.get("beds")
    const baths = searchParams?.get("baths")
    if (beds) p.minBedrooms = parseInt(beds.replace("+", ""))
    if (baths) p.minBathrooms = parseInt(baths.replace("+", ""))

    const propertyType = searchParams?.get("propertyType")
    if (propertyType) p.propertyType = propertyType
    const propertyCategory = searchParams?.get("propertyCategory")
    if (propertyCategory) p.propertyCategory = propertyCategory
    const status = searchParams?.get("status")
    if (status === "for_rent" && !propertyType) p.propertyType = "ResidentialLease"

    const sortBy = searchParams?.get("sortBy") as TrestlePropertyFilters["sortBy"]
    if (sortBy) p.sortBy = sortBy

    const keywords = searchParams?.get("keywords") || searchParams?.get("search")
    if (keywords) p.keywords = keywords

    const minSqft = searchParams?.get("minSqft")
    const maxSqft = searchParams?.get("maxSqft")
    if (minSqft) p.minLivingArea = parseInt(minSqft)
    if (maxSqft) p.maxLivingArea = parseInt(maxSqft)

    p.minLat = mapBounds.south
    p.maxLat = mapBounds.north
    p.minLng = mapBounds.west
    p.maxLng = mapBounds.east

    return p
  }, [searchParams, mapBounds])

  const { properties, loading, total } = useTrestlePropertiesIntegrated(apiParams, 300, 1)

  const handleMarkerClick = useCallback((propertyId: string) => {
    setHighlightedId(propertyId)
    const card = cardRefs.current.get(propertyId)
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    setTimeout(() => setHighlightedId(null), 3000)
  }, [])

  const setCardRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) cardRefs.current.set(id, el)
    else cardRefs.current.delete(id)
  }, [])

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] min-h-[500px] gap-0 rounded-[1rem] overflow-hidden border border-[var(--coastal-border)] bg-[var(--surface)]">
      {/* Map - left side */}
      <div className="w-full lg:w-1/2 h-[300px] lg:h-full relative">
        <PropertyMap
          properties={properties}
          onBoundsChange={setMapBounds}
          highlightedPropertyId={highlightedId}
          onMarkerClick={handleMarkerClick}
        />
      </div>

      {/* List - right side */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto border-l border-[var(--coastal-border)]">
        <div className="sticky top-0 z-10 bg-[var(--surface)] border-b border-[var(--coastal-border)] px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-[var(--coastal-text)]">Properties</h3>
          <span className="text-sm text-[var(--coastal-muted-text)] bg-[var(--surface-muted)] px-2 py-1 rounded-full">
            {loading ? "Loading..." : `${properties.length} of ${total}`}
          </span>
        </div>

        {loading && properties.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--coastal-muted-text)]" />
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
            <MapPin className="h-12 w-12 text-[var(--coastal-muted-text)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--coastal-text)] mb-2">No properties found</h3>
            <p className="text-sm text-[var(--coastal-muted-text)]">
              Try adjusting your filters or zoom out on the map.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
            {properties.map((property) => {
              const id = property.listing_key || property.id || ""
              return (
                <div
                  key={id}
                  ref={(el) => setCardRef(id, el)}
                  onMouseEnter={() => setHighlightedId(id)}
                  onMouseLeave={() => setHighlightedId(null)}
                  className={`transition-all duration-200 rounded-2xl ${
                    highlightedId === id
                      ? "ring-2 ring-[var(--coastal-primary)] shadow-lg"
                      : ""
                  }`}
                >
                  <PropertyCard property={property} showCompareButton={false} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
