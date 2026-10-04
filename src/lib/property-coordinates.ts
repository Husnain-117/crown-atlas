export interface PropertyCoordinatesInput {
  lat: number | string | null | undefined
  lng: number | string | null | undefined
}

export interface PropertyCoordinates {
  lat: number
  lng: number
}

/**
 * PostgreSQL numeric columns can arrive as strings. Normalize them once at the
 * UI boundary and reject values Leaflet cannot plot.
 */
export function normalizePropertyCoordinates(
  location: PropertyCoordinatesInput,
): PropertyCoordinates | null {
  const rawLat = typeof location.lat === "string" ? location.lat.trim() : location.lat
  const rawLng = typeof location.lng === "string" ? location.lng.trim() : location.lng

  if (rawLat === "" || rawLng === "") return null

  const lat = typeof rawLat === "string" ? Number(rawLat) : rawLat
  const lng = typeof rawLng === "string" ? Number(rawLng) : rawLng

  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180 ||
    (lat === 0 && lng === 0)
  ) {
    return null
  }

  return { lat, lng }
}
