"use client"

import { useEffect, useRef, useState } from 'react'
import { formatPriceWithCommasAndDecimals } from "@/lib/utils"
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import { propertyPathFor } from '@/lib/property-url'
import { labelLeafletMarker } from '@/lib/leaflet-accessibility'

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png", 
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

// Format property type by adding spaces before capital letters (e.g., "CommercialSale" -> "Commercial Sale")
const formatPropertyType = (type: string | undefined) => {
  if (!type) return "For Sale";
  return type.replace(/([a-z])([A-Z])/g, "$1 $2");
};

// Short price label for pins (e.g. $1.8M, $450k)
function formatPriceShort(price: number | undefined | null): string {
  if (price == null || !Number.isFinite(price)) return 'N/A';
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}k`;
  return `$${Math.round(price)}`;
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

interface PureLeafletMapProps {
  center: [number, number]
  zoom?: number
  style?: React.CSSProperties
  properties?: any[]
  onMapReady?: (map: L.Map) => void
  onBoundsChange?: (bounds: MapBounds) => void
  highlightedPropertyId?: string | null
  onMarkerClick?: (propertyId: string) => void
  drawingEnabled?: boolean
  onPolygonComplete?: (latLngs: [number, number][]) => void
  drawnPolygon?: [number, number][] | null
}

const BOUNDS_DEBOUNCE_MS = 280

export default function PureLeafletMap({
  center,
  zoom = 7,
  style = { height: "100%", width: "100%" },
  properties = [],
  onMapReady,
  onBoundsChange,
  highlightedPropertyId,
  onMarkerClick,
  drawingEnabled,
  onPolygonComplete,
  drawnPolygon
}: PureLeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])
  const markerByIdRef = useRef<Map<string, L.Marker>>(new Map())
  const clusterGroupRef = useRef<L.LayerGroup | null>(null)
  const drawControlRef = useRef<any>(null)
  const drawnLayerRef = useRef<L.Polygon | null>(null)
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null)
  const [isReady, setIsReady] = useState(false)
  const hasInitializedRef = useRef(false)
  const initialCenterRef = useRef(center)
  const initialZoomRef = useRef(zoom)
  const onMapReadyRef = useRef(onMapReady)

  // Initialize map ONCE - prevent reinitialization on center/zoom changes
  useEffect(() => {
    // Prevent initialization if already done (including StrictMode double invocation)
    if (!containerRef.current || mapRef.current || hasInitializedRef.current) return

    try {
      // Mark as initialized before creating map
      hasInitializedRef.current = true
      
      // Check if container already has a map instance (prevent reuse)
      if ((containerRef.current as any)._leaflet_id) {
        console.warn('PureLeafletMap: Container already has Leaflet instance, skipping')
        hasInitializedRef.current = false
        return
      }
      
      // Create map with Leaflet directly - ONLY ONCE
      const map = L.map(containerRef.current, {
        center: initialCenterRef.current,
        zoom: initialZoomRef.current,
        maxZoom: 19,
        zoomControl: false,
        preferCanvas: true
      })

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Add zoom control to bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      mapRef.current = map
      setIsReady(true)

      onMapReadyRef.current?.(map)
    } catch (error) {
      hasInitializedRef.current = false
      console.error('PureLeafletMap: Error creating map:', error)
    }
  }, []) // Initialize ONCE - no dependencies

  // Update map center and zoom when props change (without reinitializing)
  useEffect(() => {
    if (!mapRef.current || !isReady) return
    
    try {
      mapRef.current.setView(center, zoom)
    } catch (error) {
      console.warn('PureLeafletMap: Error updating view:', error)
    }
  }, [center, zoom, isReady])

  // Track current zoom level for marker switching
  const [currentZoom, setCurrentZoom] = useState(7)

  // Update markers when properties change or zoom changes
  useEffect(() => {
    if (!mapRef.current || !isReady) return

    // Remove existing cluster group from map
    if (clusterGroupRef.current) {
      mapRef.current.removeLayer(clusterGroupRef.current)
      clusterGroupRef.current.clearLayers()
      clusterGroupRef.current = null
    }
    markersRef.current = []
    markerByIdRef.current.clear()

    const mappableProperties = properties.filter((property: any) => property.latitude && property.longitude)
    const createClusterGroup = (L as any).markerClusterGroup
    const clusterGroup = mappableProperties.length > 0 && typeof createClusterGroup === 'function'
      ? createClusterGroup({
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
        })
      : null

    mappableProperties.forEach((property: any) => {
        const priceShort = formatPriceShort(property.list_price)
        let marker

        // Use image markers for zoom level 12 and above, price markers for lower zoom
        if (currentZoom >= 12) {
          const imageIcon = L.divIcon({
            className: 'property-image-marker',
            html: `
              <div class="relative group cursor-pointer">
                <div class="w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-lg hover:scale-110 transition-transform duration-200">
                  <img 
                    src="${property.images?.[0] || property.main_image_url || '/luxury-modern-house-exterior.png'}" 
                    alt="${property.address || 'Property'}"
                    class="w-full h-full object-cover"
                    onError="this.src='/luxury-modern-house-exterior.png'"
                  />
                </div>
                <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-full shadow-md border text-xs font-semibold whitespace-nowrap min-w-max">
                  ${priceShort}
                </div>
              </div>
            `,
            iconSize: [64, 64],
            iconAnchor: [32, 40],
            popupAnchor: [0, -40]
          })
          marker = L.marker([property.latitude, property.longitude], { icon: imageIcon })
        } else {
          const pinColor = property.property_type?.includes('Sale') ? '#2563eb' : '#0891b2'
          const priceIcon = L.divIcon({
            className: 'property-pin-marker',
            html: `
              <div style="position: relative; width: 48px; height: 58px; display: flex; flex-direction: column; align-items: center;">
                <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
                  <ellipse cx="20" cy="47" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
                  <path d="M20 0C11.7157 0 5 6.71573 5 15C5 23.2843 20 45 20 45C20 45 35 23.2843 35 15C35 6.71573 28.2843 0 20 0Z" fill="${pinColor}"/>
                  <circle cx="20" cy="15" r="8" fill="white"/>
                  <circle cx="20" cy="15" r="4" fill="${pinColor}"/>
                </svg>
                <div style="
                  margin-top: -4px;
                  background: rgba(0, 0, 0, 0.85);
                  color: white;
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-size: 10px;
                  font-weight: 600;
                  white-space: nowrap;
                  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
                ">${priceShort}</div>
              </div>
            `,
            iconSize: [48, 58],
            iconAnchor: [24, 58],
            popupAnchor: [0, -58]
          })
          marker = L.marker([property.latitude, property.longitude], { icon: priceIcon })
        }

        const propertyId = property.listing_key || property.id || 'unknown';
        const propertyUrl = propertyPathFor({ ...property, listing_key: propertyId });

        const formattedPrice = property.list_price
          ? formatPriceWithCommasAndDecimals(Number(property.list_price))
          : 'N/A';

        // Enhanced popup with image and better styling
        marker.bindPopup(`
          <div class="property-popup-content w-72">
            <div class="relative h-32 w-full mb-3">
              <img
                src="${property.images?.[0] || property.main_image_url || '/placeholder.svg'}"
                alt="${property.address || 'Property'}"
                class="h-full w-full object-cover rounded-lg"
                onError="this.src='/placeholder.svg'"
              />
              <div class="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium text-white ${
                property.property_type?.includes('Lease') ? 'bg-blue-600' : 'bg-green-600'
              }">
                ${formatPropertyType(property.property_type)}
              </div>
            </div>
            <h3 class="font-semibold text-base mb-2">${property.address || property.title || 'Property'}</h3>
            <p class="text-slate-600 text-sm mb-2">${property.city || ''}</p>
            <p class="font-bold text-lg text-blue-600 mb-3">${formattedPrice}</p>
            <div class="flex justify-between text-sm text-slate-600 mb-3">
              <span><strong>${property.bedrooms || '-'}</strong> beds</span>
              <span><strong>${property.bathrooms || '-'}</strong> baths</span>
              <span><strong>${property.living_area_sqft?.toLocaleString() || '-'}</strong> sq ft</span>
            </div>
            <button 
              onclick="window.location.href='${propertyUrl}'"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              View Details
            </button>
          </div>
        `, {
          maxWidth: 300,
          closeButton: true,
          closeOnClick: false
        })

        labelLeafletMarker(
          marker,
          `${property.address || property.city || "Property"}, ${formattedPrice}`
        )

        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(propertyId))
        }

        markerByIdRef.current.set(propertyId, marker)

        if (clusterGroup) {
          clusterGroup.addLayer(marker)
        } else {
          marker.addTo(mapRef.current!)
        }
        markersRef.current.push(marker)
    })

    if (clusterGroup) {
      clusterGroup.addTo(mapRef.current!)
      clusterGroupRef.current = clusterGroup
    }
  }, [properties, isReady, currentZoom, onMarkerClick])

  // Listen for zoom changes
  useEffect(() => {
    if (!mapRef.current || !isReady) return

    const handleZoomEnd = () => {
      const zoom = mapRef.current!.getZoom()
      setCurrentZoom(zoom)
    }

    mapRef.current.on('zoomend', handleZoomEnd)

    return () => {
      if (mapRef.current) {
        mapRef.current.off('zoomend', handleZoomEnd)
      }
    }
  }, [isReady])

  // Highlight marker when highlightedPropertyId changes
  useEffect(() => {
    if (!isReady) return
    markerByIdRef.current.forEach((marker, id) => {
      const el = (marker as any)._icon as HTMLElement | undefined
      if (!el) return
      if (id === highlightedPropertyId) {
        el.style.filter = 'drop-shadow(0 0 6px rgba(37,99,235,.8)) brightness(1.15)'
        el.style.zIndex = '10000'
        el.style.transform = (el.style.transform || '').replace(/scale\([^)]*\)/, '') + ' scale(1.25)'
      } else {
        el.style.filter = ''
        el.style.zIndex = ''
        el.style.transform = (el.style.transform || '').replace(/scale\([^)]*\)/, '')
      }
    })
  }, [highlightedPropertyId, isReady, properties])

  // Report bounds to parent (viewport-based loading)
  useEffect(() => {
    if (!mapRef.current || !isReady || !onBoundsChange) return

    const emitBounds = () => {
      const map = mapRef.current
      if (!map) return
      const b = map.getBounds()
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      })
    }

    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    const debouncedEmit = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        debounceTimer = null
        emitBounds()
      }, BOUNDS_DEBOUNCE_MS)
    }

    emitBounds()
    mapRef.current.on('moveend', debouncedEmit)
    mapRef.current.on('zoomend', debouncedEmit)

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      if (mapRef.current) {
        mapRef.current.off('moveend', debouncedEmit)
        mapRef.current.off('zoomend', debouncedEmit)
      }
    }
  }, [isReady, onBoundsChange])

  // Drawing mode: add/remove Leaflet.draw polygon control
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isReady) return

    if (drawingEnabled) {
      if (!drawnItemsRef.current) {
        drawnItemsRef.current = new L.FeatureGroup()
        map.addLayer(drawnItemsRef.current)
      }

      if (!drawControlRef.current) {
        const LDraw = (L as any).Control.Draw
        if (LDraw) {
          drawControlRef.current = new LDraw({
            position: 'topright',
            draw: {
              polygon: {
                allowIntersection: false,
                shapeOptions: { color: '#2563eb', weight: 2, fillOpacity: 0.1 },
              },
              polyline: false,
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
            },
            edit: { featureGroup: drawnItemsRef.current, remove: false, edit: false },
          })
          map.addControl(drawControlRef.current)
        }
      }

      const onCreated = (e: any) => {
        if (drawnItemsRef.current) drawnItemsRef.current.clearLayers()
        const layer = e.layer as L.Polygon
        drawnItemsRef.current?.addLayer(layer)
        const latLngs = (layer.getLatLngs()[0] as L.LatLng[]).map(
          (ll) => [ll.lat, ll.lng] as [number, number]
        )
        onPolygonComplete?.(latLngs)
      }

      map.on((L as any).Draw.Event.CREATED, onCreated)

      return () => {
        map.off((L as any).Draw.Event.CREATED, onCreated)
      }
    } else {
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current)
        drawControlRef.current = null
      }
    }
  }, [drawingEnabled, isReady, onPolygonComplete])

  // Display drawn polygon from parent state
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isReady) return

    if (drawnLayerRef.current) {
      map.removeLayer(drawnLayerRef.current)
      drawnLayerRef.current = null
    }
    if (drawnItemsRef.current) drawnItemsRef.current.clearLayers()

    if (drawnPolygon && drawnPolygon.length >= 3) {
      const layer = L.polygon(drawnPolygon, {
        color: '#2563eb',
        weight: 2,
        fillOpacity: 0.1,
      })
      layer.addTo(map)
      drawnLayerRef.current = layer
    }
  }, [drawnPolygon, isReady])

  // Cleanup - properly destroy map instance
  useEffect(() => {
    const container = containerRef.current

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.stop()
          if (clusterGroupRef.current) {
            try {
              mapRef.current.removeLayer(clusterGroupRef.current)
              clusterGroupRef.current.clearLayers()
            } catch {
              // Ignore
            }
            clusterGroupRef.current = null
          }
          markersRef.current.forEach(marker => {
            try {
              mapRef.current?.removeLayer(marker)
            } catch {
              // Ignore errors
            }
          })
          markersRef.current = []
          
          mapRef.current.remove()
          mapRef.current = null
          
          // Clear container reference
          if (container) {
            (container as any)._leaflet_id = null
            container.innerHTML = ''
          }
        } catch (error) {
          console.warn('PureLeafletMap: Error during cleanup:', error)
        }
      }
      hasInitializedRef.current = false
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      style={style}
      className="leaflet-container"
    />
  )
}
