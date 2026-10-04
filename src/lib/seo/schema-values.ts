import { SITE_URL } from "@/lib/constants/site"

/** Publish valid ISO timestamps; omit absent or malformed source dates. */
export function schemaDate(value: string | Date | null | undefined): string | undefined {
  if (!value || (typeof value === "string" && !value.trim())) return undefined
  const date = value instanceof Date ? value : new Date(value)
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined
}

/** JSON-LD image URLs must be absolute HTTP(S) URLs, not data/blob values. */
export function schemaImageUrls(values: readonly string[]): string[] {
  const urls = values.flatMap((value) => {
    if (typeof value !== "string" || !value.trim()) return []
    try {
      const url = new URL(value.trim(), SITE_URL)
      return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password
        ? [url.href]
        : []
    } catch {
      return []
    }
  })
  return [...new Set(urls)]
}
