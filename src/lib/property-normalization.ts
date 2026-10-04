type PropertyMediaSource = {
  listingKey?: unknown
  mainPhotoUrl?: unknown
  mediaUrls?: unknown
  photosCount?: unknown
  listing_key?: unknown
  main_photo_url?: unknown
  media_urls?: unknown
  photos_count?: unknown
  images?: unknown
  image?: unknown
  main_image_url?: unknown
  listing_photos?: unknown
}

export function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function toNullableBoolean(value: unknown): boolean | null {
  if (value === null || value === undefined || value === "") return null
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value !== 0

  const normalized = String(value).trim().toLowerCase()
  if (["true", "t", "yes", "y", "1"].includes(normalized)) return true
  if (["false", "f", "no", "n", "0"].includes(normalized)) return false
  return null
}

export function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const normalized = String(value).trim()
  return normalized ? normalized : null
}

export function isUsablePropertyImage(value: unknown): value is string {
  if (typeof value !== "string") return false
  const normalized = value.trim()
  return Boolean(normalized) && normalized !== "/placeholder.svg" &&
    !normalized.startsWith('/api/media') &&
    !/^https:\/\/(?:api-trestle\.corelogic\.com|api\.cotality\.com)\//i.test(normalized) &&
    (normalized.startsWith('/') && !normalized.startsWith('//') || normalized.startsWith('https://'))
}

function parseMediaUrls(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(isUsablePropertyImage)
  if (typeof value !== "string" || !value.trim()) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter(isUsablePropertyImage) : []
  } catch {
    return isUsablePropertyImage(value) ? [value] : []
  }
}

export function buildPropertyMediaUrls(
  source: PropertyMediaSource,
  _maxFallbackImages = 20,
): string[] {
  const direct = [source.mainPhotoUrl, source.main_photo_url,
    ...parseMediaUrls(source.mediaUrls), ...parseMediaUrls(source.media_urls),
    ...parseMediaUrls(source.images), ...parseMediaUrls(source.listing_photos),
    source.main_image_url, source.image]
    .filter(isUsablePropertyImage)
  const unique = Array.from(new Set(direct))
  return unique
}
