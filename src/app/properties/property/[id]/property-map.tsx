"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { MapPin } from "lucide-react"
import { normalizePropertyCoordinates } from "@/lib/property-coordinates"
import { labelLeafletMarker } from "@/lib/leaflet-accessibility"

// Dynamically import Leaflet only on client side
const useLeaflet = () => {
  const [L, setL] = useState<typeof import("leaflet") | null>(null)
  
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== "undefined") {
        const leaflet = await import("leaflet")
        
        // Manually inject Leaflet CSS if not already present
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
          link.crossOrigin = ''
          document.head.appendChild(link)
        }
        
        setL(leaflet.default)
      }
    }
    loadLeaflet()
  }, [])
  
  return L
}

interface PropertyMapProps {
  location: {
    lat: number | string | null | undefined
    lng: number | string | null | undefined
  }
  address: string
}

export default function PropertyMap({ location, address }: PropertyMapProps) {
  const pathname = usePathname()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null)
  const markerRef = useRef<import("leaflet").Marker | null>(null)
  const [isClient, setIsClient] = useState(false)
  const L = useLeaflet()
  const coordinates = normalizePropertyCoordinates(location)
  const latitude = coordinates?.lat
  const longitude = coordinates?.lng
  // Key by pathname to force remount on route change - prevents container reuse
  // This ensures map is destroyed and recreated when navigating between routes
  // Combining pathname with location ensures unique key per property page
  const locationKey = coordinates
    ? `${pathname}-${coordinates.lat}-${coordinates.lng}`
    : `${pathname}-unavailable`

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize map ONLY ONCE when component mounts
  // The key prop on the container ensures React unmounts/remounts when location changes
  // This prevents container reuse errors
  useEffect(() => {
    if (!isClient || !L || !mapContainerRef.current) {
      return
    }

    if (latitude === undefined || longitude === undefined) {
      return
    }

    const lat = latitude
    const lng = longitude

    // CRITICAL: Prevent reinitialization - only initialize once per mount
    if (mapInstanceRef.current) {
      return
    }

    // Initialize map only if it doesn't exist
    try {
      // Clear any existing content
      mapContainerRef.current.innerHTML = ''
      
      // Create custom professional marker with DivIcon for better visibility
      const customIcon = L.divIcon({
        className: 'custom-property-marker',
        html: `
          <div class="w-[30px] h-[35px] sm:w-[50px] sm:h-[55px] flex flex-col items-center" style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <!-- Pin/Marker SVG -->
            <svg class="w-[30px] h-[35px] sm:w-[50px] sm:h-[55px]" viewBox="0 0 50 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
              <!-- Shadow ellipse -->
              <ellipse cx="25" cy="57" rx="10" ry="3" fill="rgba(0,0,0,0.2)"/>
              <!-- Main pin shape -->
              <path d="M25 0C14.5066 0 6 8.50659 6 19C6 29.4934 25 55 25 55C25 55 44 29.4934 44 19C44 8.50659 35.4934 0 25 0Z" fill="#0D47A1"/>
              <!-- Inner circle -->
              <circle cx="25" cy="19" r="10" fill="white"/>
              <!-- Center dot -->
              <circle cx="25" cy="19" r="5" fill="#0D47A1"/>
            </svg>
          </div>
        `,
        iconSize: [50, 55],
        iconAnchor: [25, 55],
        popupAnchor: [0, -55]
      })

      // Initialize map - ONLY ONCE
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        scrollWheelZoom: true,
        zoomControl: true,
        preferCanvas: false,
        attributionControl: true
      })

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map)

      // Add custom marker with popup
      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
      const popup = document.createElement("div")
      popup.style.cssText = "text-align:center;padding:8px"

      const title = document.createElement("strong")
      title.style.cssText = "font-size:14px;color:#0D47A1"
      title.textContent = address
      popup.appendChild(title)

      const details = document.createElement("div")
      details.style.cssText = "margin-top:6px;font-size:12px;color:#666"
      details.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      popup.appendChild(details)

      marker.bindPopup(popup)
      labelLeafletMarker(marker, `Property location: ${address}`)
      markerRef.current = marker

      mapInstanceRef.current = map

      // Use fitBounds to ensure marker is visible with proper padding
      // This is more reliable than setView for ensuring visibility
      const markerLatLng = L.latLng(lat, lng)
      const bounds = L.latLngBounds([markerLatLng])
      
      // Fit bounds with padding to ensure marker is centered and visible
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16
      })

      // Force resize and re-center after delays to handle async rendering
      setTimeout(() => {
        if (map && mapInstanceRef.current === map) {
          map.invalidateSize()
          map.setView([lat, lng], 16, { animate: false })
        }
      }, 100)

      setTimeout(() => {
        if (map && mapInstanceRef.current === map) {
          map.invalidateSize()
          map.setView([lat, lng], 16, { animate: false })
        }
      }, 300)

      setTimeout(() => {
        if (map && mapInstanceRef.current === map) {
          map.invalidateSize()
          map.setView([lat, lng], 16, { animate: false })
        }
      }, 800)

    } catch (error) {
      console.error('PropertyMap: Error initializing map:', error)
    }

    // Cleanup function - runs when component unmounts
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
          markerRef.current = null
        } catch {
          // Ignore cleanup errors - container might already be removed
        }
      }
    }
  }, [address, isClient, L, latitude, longitude])

  if (!coordinates) {
    return (
      <div className="flex h-full min-h-64 w-full items-center justify-center rounded-2xl bg-[var(--surface-muted)] px-6 text-center">
        <div>
          <MapPin className="mx-auto mb-3 h-8 w-8 text-[var(--coastal-primary)]" aria-hidden="true" />
          <p className="font-semibold text-[var(--coastal-text)]">Map unavailable</p>
          <p className="mt-1 text-sm text-[var(--coastal-muted-text)]">{address}</p>
        </div>
      </div>
    )
  }

  // Show loading state if Leaflet is not loaded yet
  // Use skeleton UI instead of visible text to prevent SEO issues
  if (!L || !isClient) {
    return (
      <div className="w-full h-full bg-[var(--surface-muted)] rounded-[1rem] flex items-center justify-center animate-pulse">
        <div className="text-center">
          <div className="w-12 h-12 bg-[var(--coastal-primary)] rounded-[var(--radius)] mx-auto mb-4 animate-spin flex items-center justify-center">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          {/* Screen reader only - not visible to users or search engines */}
          <span className="sr-only">Loading interactive map</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full rounded-[1rem] overflow-hidden z-0">
      {/* Key by pathname forces React to unmount/remount on route change */}
      {/* This prevents "container is being reused" errors during client-side navigation */}
      <div
        key={locationKey}
        ref={mapContainerRef}
        role="region"
        aria-label={`Interactive map for ${address}`}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  )
}
