export type SeoPageType =
  | "property"
  | "neighborhood"
  | "city"
  | "county"
  | "facet"
  | "guide"
  | "international_buyers"
  | "search"
  | "contact"
  | "other"

export function classifySeoPage(pathname: string): SeoPageType {
  const path = normalizePath(pathname)
  if (/^\/international-buyers(?:\/|$)/.test(path)) return "international_buyers"
  if (/^\/properties\/[^/]+\/[^/]+$/.test(path)) return "property"
  if (/^\/discover\/[^/]+\/neighborhoods(?:\/|$)/.test(path) || /^\/neighborhoods(?:\/|$)/.test(path)) return "neighborhood"
  if (/^\/buy\/[^/]+\/[^/]+$/.test(path)) return "city"
  if (/^\/buy\/[^/]+$/.test(path)) return "county"
  if (/^\/california\/[^/]+\/[^/]+$/.test(path)) return "facet"
  if (/^\/blogs\/[^/]+$/.test(path) || ["/buyers-guide", "/market-reports", "/faq"].includes(path)) return "guide"
  if (["/properties", "/map", "/new-listings", "/open-homes", "/sold"].includes(path)) return "search"
  if (path === "/contact") return "contact"
  return "other"
}

export function pathnameFromUrl(value?: string | null): string {
  if (!value) return "/"
  try {
    return new URL(value, "https://crowncoastalhomes.com").pathname
  } catch {
    return "/"
  }
}

function normalizePath(value: string): string {
  const path = pathnameFromUrl(value).toLowerCase().replace(/\/+$/, "")
  return path || "/"
}
