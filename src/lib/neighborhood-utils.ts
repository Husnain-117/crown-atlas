/**
 * neighborhood-utils.ts
 *
 * Central utility layer for all 107 neighborhoods across 18 California cities.
 *
 * Key responsibilities:
 *  - Slug derivation from city-data href fields
 *  - Canonical URL generation for neighborhood detail pages
 *  - Data lookups (by city + slug)
 *  - Related neighborhood suggestions
 *  - generateStaticParams-ready flat manifest
 */

import { citiesData, type CityData, type Neighborhood } from "@/lib/city-data"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NeighborhoodWithMeta {
  neighborhood: Neighborhood
  category: string
  city: CityData
}

export interface NeighborhoodManifestItem {
  /** City key in citiesData, e.g. "san-diego" */
  cityId: string
  cityName: string
  category: string
  neighborhood: Neighborhood
  /** URL slug derived from href, e.g. "la-jolla" */
  slug: string
  /** Canonical detail page URL, e.g. "/neighborhoods/san-diego/la-jolla" */
  pageHref: string
}

// ─── Slug helpers ─────────────────────────────────────────────────────────────

/**
 * Derives the neighborhood URL slug from its buy-page href.
 * Example: "/buy/san-diego/la-jolla" → "la-jolla"
 */
export function getNeighborhoodSlug(href: string): string {
  return href.split("/").pop() ?? ""
}

/**
 * Builds the canonical neighborhood detail page URL.
 * Example: ("san-diego", "/buy/san-diego/la-jolla") → "/neighborhoods/san-diego/la-jolla"
 */
export function getNeighborhoodPageHref(cityId: string, buyHref: string): string {
  const slug = getNeighborhoodSlug(buyHref)
  return `/neighborhoods/${cityId}/${slug}`
}

// ─── Data lookups ─────────────────────────────────────────────────────────────

/**
 * Finds a neighborhood by its city ID and detail-page slug.
 * Returns null if not found (triggers notFound() in pages).
 */
export function getNeighborhoodData(
  cityId: string,
  neighborhoodSlug: string
): NeighborhoodWithMeta | null {
  const city = citiesData[cityId]
  if (!city) return null

  for (const category of city.neighborhoodCategories) {
    for (const hood of category.neighborhoods) {
      if (getNeighborhoodSlug(hood.href) === neighborhoodSlug) {
        return { neighborhood: hood, category: category.name, city }
      }
    }
  }

  return null
}

// ─── Manifest ─────────────────────────────────────────────────────────────────

/**
 * Returns a flat array of ALL neighborhoods across all cities.
 * Used by /neighborhoods listing page and generateStaticParams.
 */
export function getAllNeighborhoodsManifest(): NeighborhoodManifestItem[] {
  const result: NeighborhoodManifestItem[] = []

  for (const [cityId, city] of Object.entries(citiesData)) {
    for (const category of city.neighborhoodCategories) {
      for (const hood of category.neighborhoods) {
        const slug = getNeighborhoodSlug(hood.href)
        result.push({
          cityId,
          cityName: city.name,
          category: category.name,
          neighborhood: hood,
          slug,
          pageHref: `/neighborhoods/${cityId}/${slug}`,
        })
      }
    }
  }

  return result
}

// ─── Related neighborhoods ─────────────────────────────────────────────────────

/**
 * Returns up to `limit` related neighborhoods from the same city,
 * prioritising the same category first, then other categories.
 *
 * The current neighborhood (identified by its buy href) is excluded.
 */
export function getRelatedNeighborhoods(
  cityId: string,
  currentBuyHref: string,
  limit = 4
): Array<{
  name: string
  description: string
  image?: string
  pageHref: string
  category: string
}> {
  const city = citiesData[cityId]
  if (!city) return []

  const sameCategory: ReturnType<typeof getRelatedNeighborhoods> = []
  const others: ReturnType<typeof getRelatedNeighborhoods> = []

  // Determine current neighborhood's category for same-category preference
  let currentCategory = ""
  for (const cat of city.neighborhoodCategories) {
    if (cat.neighborhoods.some((n) => n.href === currentBuyHref)) {
      currentCategory = cat.name
      break
    }
  }

  for (const cat of city.neighborhoodCategories) {
    for (const hood of cat.neighborhoods) {
      if (hood.href === currentBuyHref) continue
      const item = {
        name: hood.name,
        description: hood.description,
        image: hood.image,
        pageHref: getNeighborhoodPageHref(cityId, hood.href),
        category: cat.name,
      }
      if (cat.name === currentCategory) {
        sameCategory.push(item)
      } else {
        others.push(item)
      }
    }
  }

  return [...sameCategory, ...others].slice(0, limit)
}
