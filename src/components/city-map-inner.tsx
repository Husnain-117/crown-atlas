"use client"

import { buildPropertyMediaUrls } from '@/lib/property-normalization'
import { propertyPhotoAtWidth } from '@/lib/property-photo'
import { useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "@/styles/map-styles.css"
import { createCustomIcon } from "@/app/map/icons"
import { propertyPathFor } from "@/lib/property-url"
import { labelLeafletMarker } from "@/lib/leaflet-accessibility"

const FALLBACK_IMAGE = "/luxury-modern-house-exterior.png"

function mapDebug(...args: unknown[]) {
  if (process.env.NODE_ENV !== "production") console.debug(...args)
}

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character)
}

function safeImageUrl(value: unknown): string {
  const raw = String(value ?? "").trim()
  if (raw.startsWith("/") && !raw.startsWith("//")) return escapeHtml(raw)

  try {
    const parsed = new URL(raw)
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return escapeHtml(parsed.toString())
    }
  } catch {
    // Invalid and non-web URLs intentionally fall through to the local image.
  }

  return FALLBACK_IMAGE
}

// TypeScript declarations for global carousel functions
declare global {
  interface Window {
    mapPopupCarousels: Record<string, { currentIndex: number }>;
    updatePopupImages: (id: string) => void;
    changePopupImage: (id: string, direction: number) => boolean;
    setPopupImage: (id: string, index: number) => boolean;
    togglePopupFavorite: (listingKey: string, button: HTMLElement) => boolean;
  }
}

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

// Initialize global carousel functions ONCE at module level
if (typeof window !== 'undefined' && !window.mapPopupCarousels) {
  window.mapPopupCarousels = {};

  // Global function to update images for a specific popup
  window.updatePopupImages = function(id) {
    const state = window.mapPopupCarousels[id];
    if (!state) {
      console.warn('updatePopupImages: No state for', id);
      return;
    }

    const images = document.querySelectorAll('.' + id + '-img') as NodeListOf<HTMLElement>;
    const dots = document.querySelectorAll('.' + id + '-dot') as NodeListOf<HTMLElement>;

    mapDebug('Updating images:', { id, currentIndex: state.currentIndex, imagesFound: images.length, dotsFound: dots.length });

    images.forEach((img, idx) => {
      if (idx === state.currentIndex) {
        img.style.display = 'block';
        img.style.opacity = '1';
      } else {
        img.style.display = 'none';
        img.style.opacity = '0';
      }
    });

    dots.forEach((dot, idx) => {
      if (idx === state.currentIndex) {
        dot.style.width = '24px';
        dot.style.background = 'white';
      } else {
        dot.style.width = '8px';
        dot.style.background = 'rgba(255,255,255,0.6)';
      }
    });
  };

  // Global function to change image
  window.changePopupImage = function(id, direction) {
    mapDebug('changePopupImage called:', { id, direction });
    const state = window.mapPopupCarousels[id];
    if (!state) {
      console.error('changePopupImage: No carousel state for:', id);
      return false;
    }
    const images = document.querySelectorAll('.' + id + '-img');
    const total = images.length;
    if (total === 0) {
      console.error('changePopupImage: No images found for', id);
      return false;
    }
    const oldIndex = state.currentIndex;
    state.currentIndex = (state.currentIndex + direction + total) % total;
    mapDebug('Changed index:', { oldIndex, newIndex: state.currentIndex, total });
    window.updatePopupImages(id);
    return false;
  };

  // Global function to set image
  window.setPopupImage = function(id, index) {
    mapDebug('setPopupImage called:', { id, index });
    const state = window.mapPopupCarousels[id];
    if (!state) {
      console.error('setPopupImage: No carousel state for:', id);
      return false;
    }
    state.currentIndex = index;
    window.updatePopupImages(id);
    return false;
  };

  // Favorite toggle function
  window.togglePopupFavorite = function(listingKey, button) {
    const svg = button.querySelector('svg') as SVGElement | null;
    if (!svg) return false;
    const isFavorited = svg.getAttribute('fill') === 'currentColor';
    if (isFavorited) {
      svg.setAttribute('fill', 'none');
      svg.style.color = '#334155';
    } else {
      svg.setAttribute('fill', 'currentColor');
      svg.style.color = '#ef4444';
    }
    mapDebug('Toggle favorite:', listingKey, !isFavorited);
    return false;
  };
}

export default function CityMapInner({ bounds, properties }: { bounds: [number, number, number, number], properties: any[] }) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Guard against React StrictMode double invocation
  const hasInitializedRef = useRef(false)
  const initialBoundsRef = useRef(bounds)

  const validProperties = useMemo(() => Array.isArray(properties)
    ? properties.filter(
        (property) => {
          if (!property) return false

          // Convert to numbers if they're strings
          const lat = typeof property.latitude === 'string' ? parseFloat(property.latitude) : property.latitude
          const lng = typeof property.longitude === 'string' ? parseFloat(property.longitude) : property.longitude

          return typeof lat === "number" &&
                 typeof lng === "number" &&
                 !isNaN(lat) &&
                 !isNaN(lng)
        }
      ).map(property => ({
        ...property,
        // Ensure latitude/longitude are numbers
        latitude: typeof property.latitude === 'string' ? parseFloat(property.latitude) : property.latitude,
        longitude: typeof property.longitude === 'string' ? parseFloat(property.longitude) : property.longitude
      }))
    : [], [properties])

  // Debug: Log property data structure (dev only)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      mapDebug('CityMapInner: Properties received:', {
        total: properties?.length || 0,
        firstProperty: properties?.[0],
        hasLatLng: properties?.[0] ? {
          lat: properties[0].latitude,
          lng: properties[0].longitude,
          latType: typeof properties[0].latitude,
          lngType: typeof properties[0].longitude
        } : null
      })
    }
  }, [properties])

  const swLat = typeof bounds[0] === "number" ? bounds[0] : 0
  const swLng = typeof bounds[1] === "number" ? bounds[1] : 0
  const neLat = typeof bounds[2] === "number" ? bounds[2] : 0
  const neLng = typeof bounds[3] === "number" ? bounds[3] : 0

  // Initialize map ONCE - prevent reinitialization
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      mapDebug('CityMapInner: Initialization effect running', {
        hasContainer: !!containerRef.current,
        hasMap: !!mapRef.current,
        hasInitialized: hasInitializedRef.current
      })
    }

    // Prevent initialization if already done (including StrictMode double invocation)
    if (!containerRef.current) {
      if (process.env.NODE_ENV !== 'production') console.warn('CityMapInner: No container ref available')
      return
    }

    if (mapRef.current) {
      if (process.env.NODE_ENV !== 'production') console.warn('CityMapInner: Map already exists')
      return
    }

    if (hasInitializedRef.current) {
      if (process.env.NODE_ENV !== 'production') console.warn('CityMapInner: Already initialized')
      return
    }

    try {
      mapDebug('CityMapInner: Starting map initialization...')

      const [initialSwLat, initialSwLng, initialNeLat, initialNeLng] = initialBoundsRef.current
      const initialCenterLat = (initialSwLat + initialNeLat) / 2
      const initialCenterLng = (initialSwLng + initialNeLng) / 2

      // Mark as initialized before creating map
      hasInitializedRef.current = true

      // Check if container already has a map instance (prevent reuse)
      if ((containerRef.current as any)._leaflet_id) {
        console.warn('CityMapInner: Container already has Leaflet instance, clearing...')
        ;(containerRef.current as any)._leaflet_id = undefined
      }

      // Create map with Leaflet directly - ONLY ONCE
      mapDebug('CityMapInner: Creating Leaflet map...', { centerLat: initialCenterLat, centerLng: initialCenterLng })
      const map = L.map(containerRef.current, {
        center: [initialCenterLat, initialCenterLng],
        zoom: 10,
        zoomControl: true,
        scrollWheelZoom: false,
        preferCanvas: true
      })

      // Add tile layer
      mapDebug('CityMapInner: Adding tile layer...')
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      // Fit bounds
      mapDebug('CityMapInner: Fitting bounds...', {
        swLat: initialSwLat,
        swLng: initialSwLng,
        neLat: initialNeLat,
        neLng: initialNeLng,
      })
      map.fitBounds([
        [initialSwLat, initialSwLng],
        [initialNeLat, initialNeLng],
      ], { padding: [20, 20] })

      mapRef.current = map
      mapDebug('CityMapInner: Map initialized successfully!')
      setIsReady(true)
    } catch (err: any) {
      console.error('CityMapInner: Error creating map:', err)
      setError(err?.message || 'Failed to initialize map')
      hasInitializedRef.current = false
    }
  }, []) // Initialize ONCE - no dependencies

  // Update bounds when they change (without reinitializing map)
  useEffect(() => {
    if (!mapRef.current || !isReady) return

    try {
      mapRef.current.fitBounds([
        [swLat, swLng],
        [neLat, neLng]
      ], { padding: [20, 20] })
    } catch (error) {
      console.warn('CityMapInner: Error updating bounds:', error)
    }
  }, [swLat, swLng, neLat, neLng, isReady])

  // Update markers when properties change
  useEffect(() => {
    if (!mapRef.current || !isReady) {
      mapDebug('CityMapInner: Markers effect - not ready', { hasMap: !!mapRef.current, isReady })
      return
    }

    mapDebug('CityMapInner: Updating markers', {
      totalProperties: validProperties.length,
      validProperties: validProperties.length
    })

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker)
    })
    markersRef.current = []

    // Add new markers for valid properties
    validProperties.forEach((property, index) => {
      if (!mapRef.current) return

      mapDebug(`CityMapInner: Creating marker ${index + 1}/${validProperties.length}`, {
        address: property.address,
        lat: property.latitude,
        lng: property.longitude,
        price: property.current_price ?? property.list_price
      })

      // Normalize status for icon color
      const normalizedStatus = property.status === 'FOR SALE' || property.status === 'For Sale' ? 'For Sale' : property.status
      
      const marker = L.marker(
        [property.latitude, property.longitude],
        {
          icon: createCustomIcon(
            property.current_price ?? property.list_price ?? 0,
            normalizedStatus || 'For Sale',
            property.property_type || 'Residential'
          )
        }
      )

      // Build proper address and URL
      const displayAddress = property.address || property.location || property.city || 'Property'
      const propertyUrl = propertyPathFor(property)

      // Format price
      const formattedPrice = property.current_price || property.list_price
      const priceDisplay = formattedPrice ? `$${Number(formattedPrice).toLocaleString()}` : 'Price Available'

      const storedImages = buildPropertyMediaUrls(property).map(src => propertyPhotoAtWidth(src, 768));
      const allImages = storedImages.length ? storedImages : ['/property-photo-pending.svg'];

      // Sanitize popup ID to avoid special characters in selectors
      const listingId = (property.listing_key || index).toString().replace(/[^a-zA-Z0-9]/g, '_');
      const popupId = `popup-${listingId}`;
      const safeImages = allImages.map(safeImageUrl)
      const safeDisplayAddress = escapeHtml(displayAddress)
      const safeStatus = escapeHtml(property.status === "FOR SALE" ? "FOR SALE" : (property.status || "FOR RENT"))
      const safeCity = escapeHtml(property.city || property.location || "")
      const safePropertyUrl = escapeHtml(propertyUrl.startsWith("/") ? propertyUrl : "/properties")
      const bedrooms = Number(property.bedrooms ?? property.bedrooms_total) || 0
      const bathrooms = Number(property.bathrooms ?? property.bathrooms_total) || 0
      const livingArea = Number(property.living_area_sqft ?? property.living_area) || 0
      const showCarousel = safeImages.length > 1;

      mapDebug('Creating popup for:', { listing_key: property.listing_key, popupId, imagesCount: allImages.length });

      // Build popup content with image carousel
      const popupContent = `
        <div class="property-popup-card" style="width: 300px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <!-- Image Container with Carousel -->
          <div class="relative" style="height: 200px; position: relative; overflow: hidden;">
            <!-- FOR SALE Badge -->
            <div style="position: absolute; top: 12px; left: 12px; z-index: 10; background: ${property.status === "FOR SALE" ? "#0d9488" : "#0891b2"}; color: white; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; text-transform: uppercase;">
              ${safeStatus}
            </div>

            <!-- Favorite Button - positioned at bottom-right of image -->
            <button
              type="button"
              aria-label="Save ${safeDisplayAddress}"
              class="favorite-btn-${popupId}"
              onclick="window.togglePopupFavorite && window.togglePopupFavorite('${popupId}', this)"
              style="position: absolute; bottom: 12px; right: 12px; z-index: 20; width: 40px; height: 40px; background: white; border: 2px solid rgba(0,0,0,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.15);"
              onmouseover="this.style.background='white'; this.style.transform='scale(1.15)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'"
              onmouseout="this.style.background='white'; this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.15)'"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: #334155;">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            <!-- Image Carousel -->
            <div id="${popupId}-images" style="position: relative; height: 100%; width: 100%;">
              ${safeImages.map((img, idx) => `
                <img
                  class="${popupId}-img"
                  src="${img}"
                  alt="${safeDisplayAddress}"
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; display: ${idx === 0 ? 'block' : 'none'}; transition: opacity 0.3s;"
                  onerror="this.src='${FALLBACK_IMAGE}'"
                />
              `).join('')}
            </div>

            ${showCarousel ? `
              <!-- Previous Button -->
              <button
                type="button"
                aria-label="Previous photo of ${safeDisplayAddress}"
                onclick="event.stopPropagation(); window.changePopupImage && window.changePopupImage('${popupId}', -1); return false;"
                style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); z-index: 30; width: 36px; height: 36px; background: white; border: 2px solid rgba(0,0,0,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 12px rgba(0,0,0,0.2); opacity: 0.7; transition: all 0.3s;"
                class="carousel-btn-${popupId}"
                onmouseover="this.style.opacity='1'; this.style.transform='translateY(-50%) scale(1.15)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.3)'"
                onmouseout="this.style.opacity='0.7'; this.style.transform='translateY(-50%) scale(1)'; this.style.boxShadow='0 2px 12px rgba(0,0,0,0.2)'"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: #334155;">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <!-- Next Button -->
              <button
                type="button"
                aria-label="Next photo of ${safeDisplayAddress}"
                onclick="event.stopPropagation(); window.changePopupImage && window.changePopupImage('${popupId}', 1); return false;"
                style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); z-index: 30; width: 36px; height: 36px; background: white; border: 2px solid rgba(0,0,0,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 12px rgba(0,0,0,0.2); opacity: 0.7; transition: all 0.3s;"
                class="carousel-btn-${popupId}"
                onmouseover="this.style.opacity='1'; this.style.transform='translateY(-50%) scale(1.15)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.3)'"
                onmouseout="this.style.opacity='0.7'; this.style.transform='translateY(-50%) scale(1)'; this.style.boxShadow='0 2px 12px rgba(0,0,0,0.2)'"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: #334155;">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              <!-- Dots Indicator -->
              <div style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); z-index: 30; display: flex; gap: 6px; opacity: 0.8; transition: opacity 0.3s;" class="carousel-dots-${popupId}">
                ${safeImages.slice(0, 5).map((_, idx) => `
                  <button
                    type="button"
                    aria-label="Show photo ${idx + 1} of ${safeDisplayAddress}"
                    onclick="event.stopPropagation(); window.setPopupImage && window.setPopupImage('${popupId}', ${idx}); return false;"
                    class="${popupId}-dot"
                    style="width: ${idx === 0 ? '24px' : '8px'}; height: 8px; background: ${idx === 0 ? 'white' : 'rgba(255,255,255,0.6)'}; border: none; border-radius: 4px; cursor: pointer; transition: all 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"
                    onmouseover="this.style.background='white'"
                    onmouseout="this.style.background='${idx === 0 ? 'white' : 'rgba(255,255,255,0.6)'}'"
                  ></button>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Content -->
          <div style="padding: 16px;">
            <!-- Price -->
            <div style="font-size: 24px; font-weight: 700; color: #0d9488; margin-bottom: 8px;">
              ${priceDisplay}
            </div>

            <!-- Beds, Baths, Sqft -->
            <div style="display: flex; gap: 12px; margin-bottom: 12px; font-size: 14px; color: #64748b;">
              <span style="font-weight: 500;">${bedrooms} beds</span>
              <span>•</span>
              <span style="font-weight: 500;">${bathrooms} baths</span>
              <span>•</span>
              <span style="font-weight: 500;">${livingArea ? livingArea.toLocaleString() : 'N/A'} sqft</span>
            </div>

            <!-- Address -->
            <div style="font-size: 14px; color: #334155; margin-bottom: 4px; font-weight: 500; line-height: 1.4;">
              ${safeDisplayAddress}
            </div>

            <!-- City -->
            <div style="font-size: 13px; color: #64748b; margin-bottom: 16px;">
              ${safeCity}
            </div>

            <!-- View Details Button -->
            <button
              type="button"
              aria-label="View details for ${safeDisplayAddress}"
              onclick="window.location.href='${safePropertyUrl}'"
              style="width: 100%; background: #0f172a; color: white; padding: 12px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
              onmouseover="this.style.background='#1e293b'"
              onmouseout="this.style.background='#0f172a'"
            >
              View Details
            </button>
          </div>
        </div>
      `

      marker.bindPopup(popupContent, {
        className: "property-popup-enhanced",
        closeButton: true,
        closeOnClick: false,
        maxWidth: 320,
        minWidth: 300
      })

      labelLeafletMarker(marker, `${displayAddress}, ${priceDisplay}`)

      // Initialize carousel when popup opens
      marker.on('popupopen', () => {
        mapDebug('Popup opened, initializing carousel for:', popupId);

        // Initialize carousel state
        if (typeof window !== 'undefined') {
          window.mapPopupCarousels[popupId] = { currentIndex: 0 };

          // Set up hover effects
          setTimeout(() => {
            const imageContainer = document.getElementById(popupId + '-images');
            if (imageContainer) {
              mapDebug('Setting up hover for:', popupId);

              // Remove any existing listeners
              const newContainer = imageContainer.cloneNode(true);
              imageContainer.parentNode?.replaceChild(newContainer, imageContainer);

              // Add new listeners
              newContainer.addEventListener('mouseenter', () => {
                const buttons = document.querySelectorAll('.carousel-btn-' + popupId);
                const dots = document.querySelector('.carousel-dots-' + popupId);
                buttons.forEach(btn => (btn as HTMLElement).style.opacity = '1');
                if (dots) (dots as HTMLElement).style.opacity = '1';
              });

              newContainer.addEventListener('mouseleave', () => {
                const buttons = document.querySelectorAll('.carousel-btn-' + popupId);
                const dots = document.querySelector('.carousel-dots-' + popupId);
                buttons.forEach(btn => (btn as HTMLElement).style.opacity = '0.7');
                if (dots) (dots as HTMLElement).style.opacity = '0.8';
              });
            } else {
              console.warn('Image container not found for:', popupId);
            }
          }, 100);
        }
      });

      // Clean up carousel state when popup closes
      marker.on('popupclose', () => {
        mapDebug('Popup closed, cleaning up:', popupId);
        if (typeof window !== 'undefined' && window.mapPopupCarousels) {
          delete window.mapPopupCarousels[popupId];
        }
      });

      marker.addTo(mapRef.current)
      markersRef.current.push(marker)
    })

    mapDebug(`CityMapInner: Added ${markersRef.current.length} markers to map`)
  }, [validProperties, isReady])

  // Cleanup - properly destroy map instance
  useEffect(() => {
    const container = containerRef.current

    return () => {
      if (mapRef.current) {
        try {
          mapDebug('CityMapInner: Cleaning up map')
          // Remove all markers first
          markersRef.current.forEach(marker => {
            try {
              mapRef.current?.removeLayer(marker)
            } catch {
              // Ignore errors
            }
          })
          markersRef.current = []

          // Remove map instance
          mapRef.current.remove()
          mapRef.current = null

          // Clear container reference
          if (container) {
            (container as any)._leaflet_id = null
            container.innerHTML = ''
          }

          setIsReady(false)
          hasInitializedRef.current = false
        } catch (error) {
          console.warn('CityMapInner: Error during cleanup:', error)
        }
      }
    }
  }, [])

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {/* Always render the map container so the ref is available */}
      <div
        ref={containerRef}
        style={{
          height: "100%",
          width: "100%",
          visibility: isReady && !error ? "visible" : "hidden"
        }}
        className="leaflet-container"
      />

      {/* Show error overlay */}
      {error && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: "100%",
            width: "100%"
          }}
          className="flex items-center justify-center bg-red-50 dark:bg-red-900/20"
        >
          <div className="text-center p-4">
            <p className="text-red-600 dark:text-red-400 font-medium mb-2">Failed to load map</p>
            <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Check browser console for details</p>
          </div>
        </div>
      )}

      {/* Show loading overlay */}
      {!isReady && !error && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: "100%",
            width: "100%"
          }}
          className="flex items-center justify-center bg-gray-100 dark:bg-slate-800"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 rounded-xl mx-auto mb-4 animate-spin flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 font-medium">Loading Map...</p>
          </div>
        </div>
      )}
    </div>
  )
}
