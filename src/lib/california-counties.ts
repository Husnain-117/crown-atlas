import { CALIFORNIA_COUNTY_IMAGE_MAP } from "@/lib/california-location-images"
import { COUNTIES } from "@/lib/counties"

export interface CaliforniaCountyDisplay {
  slug: string
  name: string
  image: string
  blurb?: string
}

export const CALIFORNIA_COUNTIES_DISPLAY: CaliforniaCountyDisplay[] = COUNTIES.map(
  (county) => ({
    slug: county.slug,
    name: county.name,
    image: CALIFORNIA_COUNTY_IMAGE_MAP[county.slug],
  })
)
