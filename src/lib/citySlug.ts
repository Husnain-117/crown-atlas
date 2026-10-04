import { cityToSlug as toSlug, slugToCityName, slugToDisplay, getAllCitySlugsForCounty } from "@/lib/counties"

export function cityToSlug(city: string): string {
  return toSlug(city)
}

export function slugToCity(slug: string): { city: string; state: string; display: string } {
  return {
    city: slugToCityName(slug),
    state: "CA",
    display: slugToDisplay(slug)
  }
}

export function getAllCitySlugs(county: string): string[] {
  return getAllCitySlugsForCounty(county)
}
