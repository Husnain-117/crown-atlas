import "server-only"
import CityPropertyMap from "@/components/city/CityPropertyMap"
import { searchProperties } from "@/lib/db/property-repo"
import { citySearchFilters } from "@/lib/landing/city-search"

export default async function CityPropertyMapServer({
  citySlug,
  countySlug,
  action,
  displayName
}: {
  citySlug: string
  countySlug: string
  action: "buy" | "rent"
  displayName: string
}) {
  const filters = citySearchFilters(citySlug, countySlug, action)
  const listings = filters
    ? await searchProperties({ ...filters, sort: "updated", limit: 50, offset: 0 })
    : { properties: [], total: 0 }

  return <CityPropertyMap properties={listings.properties} cityName={displayName} action={action} />
}
