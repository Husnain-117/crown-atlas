import { COUNTIES, getCounty, type CountyCity, type CountyConfig } from "@/lib/counties"
import { normalizeCitySlug } from "@/lib/seo/priority-locations"

export interface CanonicalCityLocation {
  county: CountyConfig
  city: CountyCity
}

/** Resolve aliases such as `carlsbad` and `carlsbad-ca` to one configured city. */
export function resolveCanonicalCityLocation(
  citySlug: string,
  preferredCountySlug?: string
): CanonicalCityLocation | null {
  const requested = citySlug.trim().toLowerCase()
  const normalized = normalizeCitySlug(requested)
  if (!normalized) return null

  const preferredCounty = preferredCountySlug ? getCounty(preferredCountySlug) : undefined
  const counties = preferredCounty
    ? [preferredCounty, ...COUNTIES.filter((county) => county.slug !== preferredCounty.slug)]
    : COUNTIES

  for (const county of counties) {
    const city = county.cities.find((candidate) => candidate.slug.toLowerCase() === requested)
    if (city) return { county, city }
  }

  const aliasMatches = counties.flatMap((county) => county.cities
    .filter((candidate) => normalizeCitySlug(candidate.slug) === normalized)
    .map((city) => ({ county, city })))

  if (preferredCounty) {
    return aliasMatches.find((match) => match.county.slug === preferredCounty.slug) ?? null
  }

  return aliasMatches.length === 1 ? aliasMatches[0] : null
}

export function canonicalCityBuyPath(location: CanonicalCityLocation): string {
  return `/buy/${location.county.slug}/${location.city.slug}`
}

/** Resolve an MLS city name to an existing city page without inventing a URL. */
export function canonicalCityBuyPathFor(cityName?: string | null, countyName?: string | null): string | null {
  if (!cityName?.trim()) return null
  const slug = cityName.trim().toLowerCase().replace(/,?\s+ca$/i, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").replace(/-ca$/, "")
  const countySlug = countyName?.trim().toLowerCase().replace(/\s+county$/i, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const location = resolveCanonicalCityLocation(`${slug}-ca`, countySlug)
  if (!location || (countySlug && location.county.slug !== countySlug)) return null
  return canonicalCityBuyPath(location)
}

export function canonicalCityFacetPath(
  location: CanonicalCityLocation,
  facetSlug: string
): string {
  return `/california/${normalizeCitySlug(location.city.slug)}/${facetSlug}`
}

/** Return the single replacement for a legacy one-segment `/discover` route. */
export function legacyDiscoverTarget(slug: string): string | null {
  const county = getCounty(slug)
  if (county) return `/buy/${county.slug}`

  const location = resolveCanonicalCityLocation(slug)
  return location ? canonicalCityBuyPath(location) : null
}

const LEGACY_CLUSTER_FACETS: Record<string, string | null> = {
  "houses-for-sale": null,
  "condos-for-sale": "condos-for-sale",
  "luxury-homes": "luxury-homes",
  "oceanfront": "ocean-view-homes",
  "new-construction": "new-construction",
  "pool": "homes-with-pool",
  "garage": "homes-with-garage",
  "townhomes": "townhomes-for-sale",
  "under-500k": "homes-under-500k",
}

/** Collapse the legacy `/discover/{city}/{cluster}` family into canonical pages. */
export function legacyClusterTarget(citySlug: string, clusterSlug: string): string | null {
  const location = resolveCanonicalCityLocation(citySlug)
  if (!location) return null

  const facet = LEGACY_CLUSTER_FACETS[clusterSlug]
  return facet ? canonicalCityFacetPath(location, facet) : canonicalCityBuyPath(location)
}
