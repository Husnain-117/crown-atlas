import {
  CALIFORNIA_CITY_IMAGE_MAP,
  CALIFORNIA_COUNTY_IMAGE_MAP,
} from "@/lib/california-location-images"

export type ImageMap = Record<string, string>
export type StringMap = Map<string, string>

export const CITY_CARD_IMAGE_MAPPING: ImageMap = {
  ...CALIFORNIA_CITY_IMAGE_MAP,
  "mission-district-ca": CALIFORNIA_CITY_IMAGE_MAP.mission,
  "nob-hill-ca": CALIFORNIA_CITY_IMAGE_MAP["nob-hill"],
}

export const COUNTY_HERO_IMAGE_MAP: ImageMap = CALIFORNIA_COUNTY_IMAGE_MAP
