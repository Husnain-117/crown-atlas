export const PROPERTY_PHOTO_CDN = 'https://3ohoto.sfo3.cdn.digitaloceanspaces.com'
export const PROPERTY_PHOTO_WIDTHS = [320, 768, 1600] as const

export function isStoredPropertyPhoto(src: unknown): src is string {
  if (typeof src !== 'string') return false
  try {
    const url = new URL(src)
    return url.origin === PROPERTY_PHOTO_CDN &&
      /^\/(?:properties|property-photos\/v1)\//.test(url.pathname) && !url.search && !url.hash && !url.username && !url.password
  } catch { return false }
}

export function isPreparedPropertyPhoto(src: unknown): src is string {
  return isStoredPropertyPhoto(src) && /\/property-photos\/v1\/[^/]+\/[a-f0-9]{24}\/w(320|768|1600)\.webp$/.test(src)
}

export function propertyPhotoAtWidth(src: string, width: number): string {
  if (!isPreparedPropertyPhoto(src)) return src
  const size = PROPERTY_PHOTO_WIDTHS.find(value => value >= width) || 1600
  return src.replace(/\/w\d+\.webp$/, `/w${size}.webp`)
}

export function propertyPhotoLoader({ src, width }: { src: string; width: number }): string {
  return propertyPhotoAtWidth(src, width)
}
