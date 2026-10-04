import { getCaliforniaCityImage } from "@/lib/california-location-images"

export interface CityHeroImage {
  imageUrl: string
  attractionLabel: string
}

const CITY_SLUG_ALIASES: Record<string, string> = {
  "mission-district-ca": "mission",
  "nob-hill-ca": "nob-hill",
}

export function resolveCityHeroImage(citySlug: string): CityHeroImage | null {
  const normalizedSlug = CITY_SLUG_ALIASES[citySlug.toLowerCase()] ?? citySlug.toLowerCase()
  const cityImage = getCaliforniaCityImage(normalizedSlug)
  if (!cityImage) return null

  return {
    imageUrl: cityImage.src,
    attractionLabel: cityImage.attractionLabel,
  }
}
