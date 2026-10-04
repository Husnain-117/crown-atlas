"use client"

import { useMemo, Suspense } from "react"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

import "leaflet/dist/leaflet.css"

const PureLeafletMap = dynamic(() => import("@/components/map/pure-leaflet-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[var(--surface)]/80 animate-pulse rounded-2xl" />,
})

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

interface PropertyMapProps {
  properties?: any[]
  initialLocationQuery?: string | null
  searchLocationType?: string | null
  county?: string | null
  onBoundsChange?: (bounds: MapBounds) => void
  highlightedPropertyId?: string | null
  onMarkerClick?: (propertyId: string) => void
  drawingEnabled?: boolean
  onPolygonComplete?: (latLngs: [number, number][]) => void
  drawnPolygon?: [number, number][] | null
}

function PropertyMapContent({ properties: parentProperties = [], onBoundsChange, highlightedPropertyId, onMarkerClick, drawingEnabled, onPolygonComplete, drawnPolygon }: PropertyMapProps) {
  const pathname = usePathname()
  const mapKey = `property-map-${pathname}`

  const center = useMemo<[number, number]>(() => [36.7783, -119.4179], [])

  const displayedProperties = useMemo(() => {
    if (!parentProperties || parentProperties.length === 0) return []
    return parentProperties.filter((p: any) => p.latitude != null && p.longitude != null)
  }, [parentProperties])

  return (
    <>
      {/* Key by pathname forces React to unmount/remount on route change */}
      {/* This prevents "container is being reused" errors during client-side navigation */}
      <PureLeafletMap
        key={mapKey}
        center={center}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        properties={displayedProperties}
        onBoundsChange={onBoundsChange}
        highlightedPropertyId={highlightedPropertyId}
        onMarkerClick={onMarkerClick}
        drawingEnabled={drawingEnabled}
        onPolygonComplete={onPolygonComplete}
        drawnPolygon={drawnPolygon}
      />
    </>
  )
}

export default function PropertyMap(props: PropertyMapProps) {
  const pathname = usePathname()
  // Key by pathname to force remount on route change - prevents container reuse
  const mapKey = `property-map-wrapper-${pathname}`
  
  // Error boundary to prevent crashes from taking down entire app
  try {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-full w-full">
          <span>Loading map...</span>
        </div>
      }>
        {/* Key by pathname forces React to unmount/remount on route change */}
        {/* This prevents "container is being reused" errors during client-side navigation */}
        <div key={mapKey} style={{ height: "100%", width: "100%" }}>
          <PropertyMapContent {...props} />
        </div>
      </Suspense>
    )
  } catch (error) {
    console.error('PropertyMap: Error rendering map:', error)
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100 dark:bg-slate-800">
        <div className="text-center p-4">
          <p className="text-gray-600 dark:text-gray-400">Map temporarily unavailable</p>
        </div>
      </div>
    )
  }
}
