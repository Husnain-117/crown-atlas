import { NextRequest, NextResponse } from "next/server"

import {
  getCaliforniaCityImage,
  getCaliforniaCountyImage,
} from "@/lib/california-location-images"
import { COUNTIES } from "@/lib/counties"

export const runtime = "nodejs"
export const revalidate = 86_400

export async function GET(request: NextRequest) {
  const countyQuery = request.nextUrl.searchParams.get("county")?.trim()
  if (!countyQuery) {
    return NextResponse.json({ error: "County parameter is required" }, { status: 400 })
  }

  const normalized = countyQuery
    .toLowerCase()
    .replace(/\s+county$/i, "")
    .replace(/\s+/g, "-")

  const county = COUNTIES.find(
    (entry) =>
      entry.slug === normalized ||
      entry.name.toLowerCase() === countyQuery.toLowerCase()
  )
  if (!county) {
    return NextResponse.json({ error: "County not found" }, { status: 404 })
  }

  const countyHero = getCaliforniaCountyImage(county.slug)
  const cityImages = county.cities
    .map((city) => ({ city, image: getCaliforniaCityImage(city.slug) }))
    .filter((entry) => entry.image)

  const images = [
    ...(countyHero
      ? [
          {
            id: `county-${county.slug}`,
            county: county.name,
            city: null,
            image_url: countyHero.src,
            description: countyHero.alt,
            source_url: countyHero.sourceUrl,
          },
        ]
      : []),
    ...cityImages.map(({ city, image }) => ({
      id: `city-${city.slug}`,
      county: county.name,
      city: city.name,
      image_url: image!.src,
      description: image!.alt,
      source_url: image!.sourceUrl,
    })),
  ]

  return NextResponse.json(images, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}
