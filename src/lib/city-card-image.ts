const CITY_IMAGE_FALLBACK = "/placeholder.svg"

/**
 * Keep client-provided image values constrained to local paths or HTTP(S).
 * Static city paths are verified separately against public/ during QA.
 */
export function getSafeCityCardImageUrl(url: string | undefined | null): string {
  if (typeof url !== "string") return CITY_IMAGE_FALLBACK

  const trimmed = url.trim()
  if (trimmed.startsWith("/") || /^https?:\/\//i.test(trimmed)) return trimmed

  return CITY_IMAGE_FALLBACK
}
