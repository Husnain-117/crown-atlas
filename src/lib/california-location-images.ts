import imageData from "@/lib/california-location-image-data.json"
import type { CityImage } from "@/lib/city-image"
import { LOS_ANGELES_CITY_IMAGES } from "@/lib/los-angeles-city-images"
import { SAN_DIEGO_CITY_IMAGES } from "@/lib/san-diego-city-images"

export interface CaliforniaLocationImageRecord {
  kind: "city" | "county"
  slug: string
  name: string
  countySlug: string
  countyName: string
  src: string
  alt: string
  attractionLabel: string
  creator: string
  license: string
  licenseUrl: string
  sourceUrl: string
  wikipediaUrl: string
  fileTitle: string
}

export interface CountyImage extends Omit<CityImage, "city"> {
  county: string
}

export const CALIFORNIA_LOCATION_IMAGE_RECORDS =
  imageData as CaliforniaLocationImageRecord[]

const generatedCityImages = Object.fromEntries(
  CALIFORNIA_LOCATION_IMAGE_RECORDS
    .filter(
      (record) =>
        record.kind === "city" &&
        record.countySlug !== "los-angeles" &&
        record.countySlug !== "san-diego"
    )
    .map((record) => [
      record.slug,
      {
        city: record.name,
        src: record.src,
        alt: record.alt,
        attractionLabel: record.attractionLabel,
        creator: record.creator,
        license: record.license,
        licenseUrl: record.licenseUrl,
        sourceUrl: record.sourceUrl,
      } satisfies CityImage,
    ])
) as Record<string, CityImage>

export const CALIFORNIA_CITY_IMAGES: Record<string, CityImage> = {
  ...generatedCityImages,
  ...LOS_ANGELES_CITY_IMAGES,
  ...SAN_DIEGO_CITY_IMAGES,
}

export const CALIFORNIA_CITY_IMAGE_MAP = Object.fromEntries(
  Object.entries(CALIFORNIA_CITY_IMAGES).map(([slug, image]) => [slug, image.src])
) as Record<string, string>

export const CALIFORNIA_COUNTY_IMAGES = Object.fromEntries(
  CALIFORNIA_LOCATION_IMAGE_RECORDS
    .filter((record) => record.kind === "county")
    .map((record) => [
      record.slug,
      {
        county: record.name,
        src: record.src,
        alt: record.alt,
        attractionLabel: record.attractionLabel,
        creator: record.creator,
        license: record.license,
        licenseUrl: record.licenseUrl,
        sourceUrl: record.sourceUrl,
      } satisfies CountyImage,
    ])
) as Record<string, CountyImage>

export const CALIFORNIA_COUNTY_IMAGE_MAP = Object.fromEntries(
  Object.entries(CALIFORNIA_COUNTY_IMAGES).map(([slug, image]) => [slug, image.src])
) as Record<string, string>

export function getCaliforniaCityImage(citySlug: string): CityImage | null {
  return CALIFORNIA_CITY_IMAGES[citySlug.toLowerCase()] ?? null
}

export function getCaliforniaCountyImage(countySlug: string): CountyImage | null {
  return CALIFORNIA_COUNTY_IMAGES[countySlug.toLowerCase()] ?? null
}
