"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { MapPin, ExternalLink } from "lucide-react"

// Dynamically import the map only when needed
const CityMapInner = dynamic(() => import("./city-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800">
      <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
    </div>
  )
})

interface LazyCityMapProps {
  bounds: [number, number, number, number]
  properties: any[]
  cityName?: string
}

/**
 * Generates a Google Maps URL from bounding box coordinates
 */
function getGoogleMapsUrl(bounds: [number, number, number, number]): string {
  const [swLat, swLng, neLat, neLng] = bounds
  const centerLat = (swLat + neLat) / 2
  const centerLng = (swLng + neLng) / 2
  return `https://www.google.com/maps?q=${centerLat},${centerLng}&z=11`
}

/**
 * Lazy-loading map component that only loads when:
 * 1. User scrolls into view (Intersection Observer)
 * 2. User clicks "Show map" button
 * 
 * Shows a fallback with static image and Google Maps link until loaded.
 */
export default function LazyCityMap({ bounds, properties, cityName = "this area" }: LazyCityMapProps) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer to detect when map section is in viewport
  // Auto-loads when user scrolls near the map section (200px before)
  useEffect(() => {
    if (!containerRef.current || shouldLoad) return
    const container = containerRef.current

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoad) {
            // Auto-load when scrolled into view
            setShouldLoad(true)
          }
        })
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0.1
      }
    )

    observer.observe(container)

    return () => {
      observer.unobserve(container)
    }
  }, [shouldLoad])

  const handleShowMap = () => {
    setShouldLoad(true)
  }

  const googleMapsUrl = getGoogleMapsUrl(bounds)

  // Show fallback until user clicks "Show map" or scrolls into view (if auto-load enabled)
  // Fixed height to prevent CLS (Cumulative Layout Shift)
  if (!shouldLoad) {
    return (
      <div
        ref={containerRef}
        className="w-full h-[500px] bg-gray-200 dark:bg-slate-800 rounded-xl shadow-medium overflow-hidden relative"
        style={{ minHeight: '500px' }}
      >
        {/* Static fallback with gradient background */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, var(--surface-muted) 0%, var(--surface) 100%)",
          }}
        >
          <div className="text-center p-8 max-w-md">
            <div 
              className="h-20 w-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: "var(--coastal-secondary)",
                opacity: 0.1,
              }}
            >
              <MapPin 
                className="h-10 w-10"
                style={{ color: "var(--coastal-secondary)" }}
              />
            </div>
            <div 
              className="text-2xl font-bold mb-3"
              style={{ color: "var(--coastal-text)" }}
            >
              Interactive Property Map
            </div>
            <p 
              className="mb-8 text-base leading-relaxed"
              style={{ color: "var(--coastal-muted-text)" }}
            >
              Load the interactive map to explore property locations in {cityName}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={handleShowMap}
                className="px-8 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-white"
                style={{
                  background: "var(--coastal-primary)",
                }}
              >
                <MapPin className="h-5 w-5" />
                Show Map
              </button>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 border"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--coastal-border)",
                  color: "var(--coastal-text)",
                }}
              >
                <ExternalLink className="h-5 w-5" />
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Load the actual map component
  // Fixed height to prevent CLS (Cumulative Layout Shift)
  return (
    <div 
      className="w-full h-[500px] bg-gray-200 dark:bg-slate-800 rounded-xl shadow-medium overflow-hidden relative"
      style={{ minHeight: '500px' }}
    >
      <CityMapInner bounds={bounds} properties={properties} />
    </div>
  )
}

