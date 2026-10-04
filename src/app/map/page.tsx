"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import MapViewHeader, { type FilterValues } from "./map-view-header"
import MapFilterDrawer from "./map-filter-drawer"
import MapLoadingSkeleton from "./map-loading-skeleton"
import { PropertyCard } from "@/components/property-card"
import MapFAQ from "./map-faq"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useTrestlePropertiesIntegrated } from "@/hooks/useTrestlePropertiesIntegrated"
import "@/styles/map-styles.css"
import { useSearchParams, useRouter } from "next/navigation"
import CRMLSDisclaimer from "@/components/crmls-disclaimer"
import SearchBar from "@/components/home/search-bar"
import { MapPin } from "lucide-react"
import booleanPointInPolygon from "@turf/boolean-point-in-polygon"
import { point, polygon } from "@turf/helpers"
import Footer from "@/components/layout/footer"

// Dynamically import the map component with no SSR
const PropertyMap = dynamic(() => import("./property-map"), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
})

// Prevent multiple map instances by using a global flag
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.mapInstanceCount = (window.mapInstanceCount || 0);
}

const DEFAULT_MAP_BOUNDS = { north: 42, south: 32.5, east: -114, west: -124.5 }

function MapViewPage() {
  const [activeFilters, setActiveFilters] = useState<FilterValues>({})
  const [showFAQ, setShowFAQ] = useState(false)
  const [sortBy, setSortBy] = useState<string>("recommended")
  const [mobileView, setMobileView] = useState<'map' | 'properties'>('map')
  const [mapBounds, setMapBounds] = useState(DEFAULT_MAP_BOUNDS)
  const [drawingEnabled, setDrawingEnabled] = useState(false)
  const [drawnPolygon, setDrawnPolygon] = useState<[number, number][] | null>(null)
  const [displayCount, setDisplayCount] = useState(6)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get location from search params (searchParams can be null)
  // Check for both "location" and "city" parameters for backward compatibility
  const locationQuery = searchParams?.get("location") || searchParams?.get("city")
  const propertyType = searchParams?.get("propertyType")
  const searchLocationType = searchParams?.get("searchLocationType") || (searchParams?.get("city") ? "city" : undefined)
  const county = searchParams?.get("county")

  // Sync activeFilters from URL params on mount/change (like buy/rent pages)
  useEffect(() => {
    const filters: FilterValues = {}

    // City from URL
    const cityParam = searchParams?.get("city")
    if (cityParam) {
      filters.city = cityParam
    }

    // Keywords from URL
    const keywordsParam = searchParams?.get("keywords")
    if (keywordsParam) {
      filters.keywords = keywordsParam
    }

    // Property Type from URL
    const propertyTypeParam = searchParams?.get("propertyType")
    if (propertyTypeParam) {
      filters.propertyType = [propertyTypeParam]
    }

    // Status from URL
    const statusParam = searchParams?.get("status")
    if (statusParam) {
      filters.status = [statusParam]
    }

    // Price Range from URL
    const minPriceParam = searchParams?.get("minPrice")
    const maxPriceParam = searchParams?.get("maxPrice")
    if (minPriceParam || maxPriceParam) {
      filters.priceRange = [
        minPriceParam ? Number(minPriceParam) : 0,
        maxPriceParam ? Number(maxPriceParam) : 50000000
      ]
    }

    // Beds from URL
    const bedsParam = searchParams?.get("minBedrooms")
    if (bedsParam) {
      filters.beds = bedsParam + "+"
    }

    // Baths from URL
    const bathsParam = searchParams?.get("minBathrooms")
    if (bathsParam) {
      filters.baths = bathsParam + "+"
    }

    // Area Range from URL
    const minAreaParam = searchParams?.get("minLivingArea")
    const maxAreaParam = searchParams?.get("maxLivingArea")
    if (minAreaParam || maxAreaParam) {
      filters.areaRange = [
        minAreaParam ? Number(minAreaParam) : 0,
        maxAreaParam ? Number(maxAreaParam) : 10000
      ]
    }

    // Features from URL
    const features: string[] = []
    if (searchParams?.get("hasPool") === "true") features.push("Swimming Pool")
    if (searchParams?.get("hasGarage") === "true") features.push("Garage")
    if (searchParams?.get("hasView") === "true") features.push("Garden")
    if (features.length > 0) {
      filters.features = features
    }

    setActiveFilters(filters)
  }, [searchParams])

  // Map property type display names to API values
  const mapPropertyTypeToAPI = (displayType: string): string | null => {
    const mapping: Record<string, string> = {
      "Homes": "house",
      "Condos": "condo",
      "Townhouses": "townhouse",
      "Manufactured": "manufactured",
      "Land": "land",
      "Apartments": "apartment",
      "Villas": "villa",
      "Commercial": "commercial"
    }
    return mapping[displayType] || null
  }

  // Build API params from URL searchParams (like buy/rent pages do with trestleFilters)
  const apiParams = useMemo(() => {
    const params: Record<string, any> = {}

    // Keywords Search from filter
    const keywordsParam = searchParams?.get("keywords")
    if (keywordsParam) {
      params.keywords = keywordsParam
    }

    // Location - check for city filter first, then fallback to location query
    const cityFilterParam = searchParams?.get("city")

    if (cityFilterParam) {
      // City filter from sidebar takes priority
      params.city = cityFilterParam
    } else if (searchLocationType === "county") {
      // County location
      if (locationQuery) params.state = locationQuery
    } else if (locationQuery) {
      // City location from URL
      params.city = locationQuery
    }

    // County parameter
    if (county) params.state = county

    // Property Type from URL
    const propertyTypeParam = searchParams?.get("propertyType")
    if (propertyTypeParam) {
      const mappedType = mapPropertyTypeToAPI(propertyTypeParam)
      if (mappedType) {
        params.propertyCategory = mappedType
        params.propertyType = "Residential"
      }
    } else if (propertyType) {
      params.propertyType = propertyType
    }

    // Status from URL - already in correct format from SearchBar (for_sale/for_rent)
    const statusParam = searchParams?.get("status")
    if (statusParam) {
      params.status = statusParam
    }

    // Price Range from URL
    const minPriceParam = searchParams?.get("minPrice")
    const maxPriceParam = searchParams?.get("maxPrice")
    if (minPriceParam) params.minPrice = Number(minPriceParam)
    if (maxPriceParam) params.maxPrice = Number(maxPriceParam)

    // Beds & Baths from URL
    const bedsParam = searchParams?.get("minBedrooms")
    if (bedsParam) params.minBedrooms = Number(bedsParam)
    
    const bathsParam = searchParams?.get("minBathrooms")
    if (bathsParam) params.minBathrooms = Number(bathsParam)

    // Area Range from URL
    const minAreaParam = searchParams?.get("minLivingArea")
    const maxAreaParam = searchParams?.get("maxLivingArea")
    if (minAreaParam) params.minLivingArea = Number(minAreaParam)
    if (maxAreaParam) params.maxLivingArea = Number(maxAreaParam)

    // Features from URL
    const hasPoolParam = searchParams?.get("hasPool")
    if (hasPoolParam === "true") params.hasPool = true
    
    const hasGarageParam = searchParams?.get("hasGarage")
    if (hasGarageParam === "true") params.hasGarage = true
    
    const hasViewParam = searchParams?.get("hasView")
    if (hasViewParam === "true") params.hasView = true
    
    const isWaterfrontParam = searchParams?.get("isWaterfront")
    if (isWaterfrontParam === "true") params.isWaterfront = true

    return params
  }, [searchParams, searchLocationType, locationQuery, county, propertyType])

  const apiParamsWithBbox = useMemo(() => ({
    ...apiParams,
    minLat: mapBounds.south,
    maxLat: mapBounds.north,
    minLng: mapBounds.west,
    maxLng: mapBounds.east,
  }), [apiParams, mapBounds])

  const { properties: rawProperties, loading: isLoading } = useTrestlePropertiesIntegrated(apiParamsWithBbox, 300, 1)

  // Adapt properties to match PropertyListPanel interface
  const properties = useMemo(() => {
    return rawProperties.map(prop => ({
      ...prop,
      title: prop.address || 'Property',
      square_feet: typeof prop.living_area_sqft === 'number' ? prop.living_area_sqft : (prop.living_area_sqft ? parseInt(prop.living_area_sqft as string) : 0) || 0,
      _id: prop.id || prop.listing_key || '',
      status: prop.status || 'Active',
      location: prop.location || prop.city || '',
      bedrooms: prop.bedrooms || 0,
      bathrooms: prop.bathrooms || 0,
    }))
  }, [rawProperties])
  

  // Sort properties based on sortBy value
  const sortedProperties = useMemo(() => {
    const sorted = [...properties]
    
    switch (sortBy) {
      case "price-asc":
        return sorted.sort((a: any, b: any) => {
          const priceA = a.current_price ?? a.list_price ?? 0
          const priceB = b.current_price ?? b.list_price ?? 0
          return priceA - priceB
        })
      case "price-desc":
        return sorted.sort((a: any, b: any) => {
          const priceA = a.current_price ?? a.list_price ?? 0
          const priceB = b.current_price ?? b.list_price ?? 0
          return priceB - priceA
        })
      case "date-desc":
        return sorted.sort((a: any, b: any) => {
          const dateA = new Date(a.list_date ?? a.created_at ?? 0).getTime()
          const dateB = new Date(b.list_date ?? b.created_at ?? 0).getTime()
          return dateB - dateA
        })
      case "recommended":
      default:
        return sorted
    }
  }, [properties, sortBy])

  const polygonFilteredProperties = useMemo(() => {
    if (!drawnPolygon || drawnPolygon.length < 3) return sortedProperties
    try {
      const ring = [...drawnPolygon, drawnPolygon[0]].map(([lat, lng]) => [lng, lat])
      const poly = polygon([ring])
      return sortedProperties.filter((p: any) => {
        if (!p.latitude || !p.longitude) return false
        const pt = point([p.longitude, p.latitude])
        return booleanPointInPolygon(pt, poly)
      })
    } catch {
      return sortedProperties
    }
  }, [sortedProperties, drawnPolygon])

  const displayProperties = drawnPolygon ? polygonFilteredProperties : sortedProperties
  
  // Paginated properties for display (show 6 at a time)
  const paginatedProperties = displayProperties.slice(0, displayCount)
  const hasMore = displayCount < displayProperties.length
  
  const handleShowMore = () => {
    setDisplayCount(prev => prev + 6)
  }
  
  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(6)
  }, [activeFilters, sortBy, drawnPolygon])

  const handlePolygonComplete = useCallback((latLngs: [number, number][]) => {
    setDrawnPolygon(latLngs)
    setDrawingEnabled(false)
  }, [])

  const handleClearPolygon = useCallback(() => {
    setDrawnPolygon(null)
  }, [])

  const handleFilterChange = (filters: FilterValues) => {
    setActiveFilters(filters)

    // Build URL params from filters (like buy/rent pages do)
    const params = new URLSearchParams(searchParams?.toString() || "")

    // City Search
    if (filters.city && filters.city.trim()) {
      params.set('city', filters.city.trim())
    } else {
      params.delete('city')
    }

    // Keywords Search
    if (filters.keywords && filters.keywords.trim()) {
      params.set('keywords', filters.keywords.trim())
    } else {
      params.delete('keywords')
    }

    // Property Types
    if (filters.propertyType && filters.propertyType.length > 0) {
      // Only set first property type for now
      params.set('propertyType', filters.propertyType[0])
    } else {
      params.delete('propertyType')
    }

    // Status
    if (filters.status && filters.status.length > 0) {
      params.set('status', filters.status[0])
    } else {
      params.delete('status')
    }

    // Price Range
    if (filters.priceRange && filters.priceRange[0] > 0) {
      params.set('minPrice', filters.priceRange[0].toString())
    } else {
      params.delete('minPrice')
    }
    if (filters.priceRange && filters.priceRange[1] < 50000000) {
      params.set('maxPrice', filters.priceRange[1].toString())
    } else {
      params.delete('maxPrice')
    }

    // Beds & Baths
    if (filters.beds && filters.beds !== "Any") {
      params.set('minBedrooms', filters.beds.replace('+', ''))
    } else {
      params.delete('minBedrooms')
    }
    if (filters.baths && filters.baths !== "Any") {
      params.set('minBathrooms', filters.baths.replace('+', ''))
    } else {
      params.delete('minBathrooms')
    }

    // Area Range
    if (filters.areaRange && filters.areaRange[0] > 0) {
      params.set('minLivingArea', filters.areaRange[0].toString())
    } else {
      params.delete('minLivingArea')
    }
    if (filters.areaRange && filters.areaRange[1] < 10000) {
      params.set('maxLivingArea', filters.areaRange[1].toString())
    } else {
      params.delete('maxLivingArea')
    }

    // Features
    if (filters.features && filters.features.length > 0) {
      if (filters.features.includes("Swimming Pool")) params.set('hasPool', 'true')
      else params.delete('hasPool')

      if (filters.features.includes("Garage")) params.set('hasGarage', 'true')
      else params.delete('hasGarage')

      if (filters.features.includes("Garden")) params.set('hasView', 'true')
      else params.delete('hasView')
    } else {
      params.delete('hasPool')
      params.delete('hasGarage')
      params.delete('hasView')
    }

    // Update URL without scroll
    const newUrl = `/map${params.toString() ? '?' + params.toString() : ''}`
    router.replace(newUrl, { scroll: false })
  }

  const handleClearFilters = () => {
    setActiveFilters({})
    
    // Keep only location-related params
    const params = new URLSearchParams()
    if (locationQuery) {
      if (searchLocationType === "city") {
        params.set('city', locationQuery)
      } else {
        params.set('location', locationQuery)
      }
    }
    if (searchLocationType) params.set('searchLocationType', searchLocationType)
    if (county) params.set('county', county)
    
    const newUrl = `/map${params.toString() ? '?' + params.toString() : ''}`
    router.replace(newUrl, { scroll: false })
  }

  const toggleFAQ = () => {
    setShowFAQ(!showFAQ)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  return (
    <div className="flex flex-col bg-[var(--bg)] min-h-screen">

      {/* Filter Header - sticky just below the navbar */}
      <div className="sticky top-20 lg:top-24 z-30 bg-[var(--surface)] shadow-sm border-b border-[var(--coastal-border)]">
        <MapViewHeader
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onToggleFAQ={toggleFAQ}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />
      </div>

      {/* Full-Width Map Section */}
      <div
        className={`relative w-full overflow-hidden bg-[var(--surface-muted)] ${
          isMobile && mobileView === 'properties' ? 'hidden' : ''
        }`}
        style={{ height: isMobile ? '60vh' : '580px' }}
      >
        {/* Map with z-index isolation */}
        <div className="absolute inset-0 w-full h-full z-0" style={{ isolation: 'isolate' }}>
          <Suspense fallback={<MapLoadingSkeleton />}>
            <PropertyMap
              properties={displayProperties}
              onBoundsChange={setMapBounds}
              initialLocationQuery={locationQuery}
              searchLocationType={searchLocationType}
              county={county}
              drawingEnabled={drawingEnabled}
              onPolygonComplete={handlePolygonComplete}
              drawnPolygon={drawnPolygon}
            />
          </Suspense>
        </div>

        {/* Draw Area Controls */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
          <div className="bg-[var(--surface)]/95 backdrop-blur-xl rounded-xl shadow-lg border border-[var(--coastal-border)]/50 p-3">
            <h4 className="text-xs font-semibold text-[var(--coastal-text)] mb-2">Draw Search Area</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  if (drawingEnabled) {
                    setDrawingEnabled(false)
                  } else {
                    setDrawnPolygon(null)
                    setDrawingEnabled(true)
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  drawingEnabled
                    ? "bg-[var(--coastal-primary)] text-white"
                    : "bg-[var(--surface-muted)] text-[var(--coastal-text)] hover:bg-[var(--coastal-border)]"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                {drawingEnabled ? "Drawing..." : "Draw Area"}
              </button>
              {drawnPolygon && (
                <button
                  onClick={handleClearPolygon}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Area
                </button>
              )}
            </div>
            {drawnPolygon && (
              <div className="mt-2 pt-2 border-t border-[var(--coastal-border)]">
                <p className="text-xs text-[var(--coastal-muted-text)]">
                  <span className="font-semibold text-[var(--coastal-text)]">{displayProperties.length}</span> properties in area
                </p>
              </div>
            )}
            {drawingEnabled && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Click on the map to draw a polygon. Double-click to finish.
              </p>
            )}
          </div>
        </div>

        {/* Mobile Filter + Search overlay */}
        {(!isMobile || mobileView === 'map') && (
          <div className="md:hidden absolute top-3 left-3 right-3 z-20 flex gap-2 items-start">
            <MapFilterDrawer
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
            <div className="flex-1 bg-[var(--surface)]/95 backdrop-blur-xl rounded-xl shadow-lg border border-[var(--coastal-border)]/50 p-1.5">
              <SearchBar defaultSearchMethod="map" compact />
            </div>
          </div>
        )}
      </div>

      {/* Properties Section - Full width below map */}
      <div className={`bg-[var(--bg)] ${isMobile && mobileView === 'map' ? 'hidden' : ''}`}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">

          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--coastal-border)]">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--coastal-text)]">
              Properties
            </h2>
            <span className="text-sm text-[var(--coastal-muted-text)] bg-[var(--surface-muted)] px-3 py-1.5 rounded-full font-medium">
              {displayProperties.length} found
            </span>
          </div>

          {/* Loading skeleton */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="h-64 w-full rounded-3xl bg-[var(--surface-muted)]" />
                  <div className="space-y-3 px-2">
                    <div className="h-5 w-3/4 bg-[var(--surface-muted)] rounded" />
                    <div className="h-4 w-1/2 bg-[var(--surface-muted)] rounded" />
                    <div className="h-6 w-1/3 bg-[var(--surface-muted)] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayProperties.length === 0 ? (
            <div className="text-center py-20">
              <MapPin className="h-12 w-12 text-[var(--coastal-muted-text)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--coastal-text)] mb-2">No properties found</h3>
              <p className="text-sm text-[var(--coastal-muted-text)] max-w-md mx-auto">
                No properties match your current filters. Try adjusting your search criteria or moving the map.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {paginatedProperties.map((property) => (
                  <PropertyCard
                    key={property.listing_key || property.id}
                    property={property}
                    showCompareButton={false}
                  />
                ))}
              </div>
              
              {/* Show More Button */}
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={handleShowMore}
                    className="px-8 py-4 bg-[var(--coastal-primary)] text-white rounded-xl font-semibold hover:bg-[var(--coastal-secondary)] transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 group"
                  >
                    <span>Show More Properties</span>
                    <svg 
                      className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
      
      {/* CRMLS Disclaimer */}
      <div className="w-full">
        <CRMLSDisclaimer compact={true} />
      </div>

      {/* Mobile Toggle Button - Fixed at bottom */}
      {isMobile && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 bg-[var(--surface)] rounded-full shadow-lg border-2 border-[var(--coastal-border)] p-1">
          <button
            onClick={() => setMobileView('map')}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
              mobileView === 'map'
                ? 'bg-[var(--coastal-primary)] text-white shadow-md'
                : 'text-[var(--coastal-text)] hover:bg-[var(--surface-muted)]'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setMobileView('properties')}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
              mobileView === 'properties'
                ? 'bg-[var(--coastal-primary)] text-white shadow-md'
                : 'text-[var(--coastal-text)] hover:bg-[var(--surface-muted)]'
            }`}
          >
            Properties ({properties.length})
          </button>
        </div>
      )}

      {/* FAQ Modal */}
      {showFAQ && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--surface)] rounded-[16px] shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <MapFAQ onClose={toggleFAQ} />
          </div>
        </div>
      )}
    </div>
  )
}


export default function MapViewPageWrapper() {
  return (
    // You could have a loading skeleton as the `fallback` too
    <Suspense>
      <MapViewPage />
    </Suspense>
  )
}
