import { getCityBySlug, getCounty, getCountyCities } from "../counties"
import type { PropertySearchParams } from "../db/property-repo"

/** City pages use MLS city + county, never ZIPs that can cross city limits. */
export function citySearchFilters(citySlug: string, countySlug: string, action: "buy" | "rent"): PropertySearchParams | null {
  const city = getCityBySlug(citySlug)
  const county = getCounty(countySlug)
  if (!city || !county || !getCountyCities(countySlug).some(item => item.slug === city.slug)) return null
  const isSfNeighborhood = county.slug === "san-francisco" && !city.zipCodes?.length && city.slug !== "san-francisco-ca"
  return {
    city: isSfNeighborhood ? "San Francisco" : city.name,
    county: county.name,
    neighborhood: isSfNeighborhood ? city.name.split(",")[0].trim() : undefined,
    state: "CA",
    status: action === "buy" ? "for_sale" : "for_rent",
    ...(action === "rent" ? { propertyType: "ResidentialLease" } : {}),
  }
}

export function firstQueryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export function positiveQueryNumber(value: string | string[] | undefined): number | undefined {
  const number = Number(firstQueryValue(value))
  return Number.isFinite(number) && number > 0 ? number : undefined
}

export function citySearchPage(value: string | string[] | undefined): number {
  return Math.max(1, Math.min(10000, Math.floor(positiveQueryNumber(value) ?? 1)))
}
