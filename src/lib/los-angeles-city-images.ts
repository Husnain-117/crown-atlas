import type { CityImage } from "@/lib/city-image"
import imageData from "@/lib/los-angeles-city-image-data.json"

export const LOS_ANGELES_CITY_IMAGES = Object.fromEntries(
  Object.entries(imageData).map(([slug, image]) => [
    slug,
    {
      ...image,
      licenseUrl: image.licenseUrl.replace(/^http:/, "https:"),
    },
  ]),
) as Record<string, CityImage>

export const LOS_ANGELES_CITY_IMAGE_MAP = Object.fromEntries(
  Object.entries(LOS_ANGELES_CITY_IMAGES).map(([slug, image]) => [slug, image.src]),
)

export function getLosAngelesCityImage(citySlug: string): CityImage | null {
  return LOS_ANGELES_CITY_IMAGES[citySlug] ?? null
}
