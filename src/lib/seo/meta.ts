export function normalizeMetadataText(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

export function truncateMetadataText(value: string, maxLength: number): string {
  const clean = normalizeMetadataText(value)
  if (clean.length <= maxLength) return clean

  const suffix = "..."
  const candidate = clean.slice(0, Math.max(0, maxLength - suffix.length)).trimEnd()
  const lastSpace = candidate.lastIndexOf(" ")
  const boundary = lastSpace >= Math.floor(maxLength * 0.65) ? lastSpace : candidate.length

  return `${candidate.slice(0, boundary).trimEnd()}${suffix}`
}

export function buildMetadataTitle(
  title: string,
  brand: string,
  maxLength = 65,
): string {
  const cleanTitle = normalizeMetadataText(title)
  const cleanBrand = normalizeMetadataText(brand)

  if (cleanTitle.toLowerCase().includes(cleanBrand.toLowerCase())) {
    return truncateMetadataText(cleanTitle, maxLength)
  }

  const branded = `${cleanTitle} | ${cleanBrand}`
  if (branded.length <= maxLength) return branded
  if (cleanTitle.length <= maxLength) return cleanTitle

  return truncateMetadataText(cleanTitle, maxLength)
}
