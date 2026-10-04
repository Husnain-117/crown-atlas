import "server-only"
import { cache } from "react"
import { searchProperties } from "@/lib/db/property-repo"
import { citySearchFilters } from "@/lib/landing/city-search"

// Reuse the same initial cards in the visible listing grid and its ItemList.
export const getInitialCityListings = cache(async (citySlug: string, countySlug: string, action: "buy" | "rent") => {
  const filters = citySearchFilters(citySlug, countySlug, action)
  if (!filters) return { properties: [], total: 0 }
  return searchProperties({ ...filters, sort: "updated", limit: 12, offset: 0 })
})
