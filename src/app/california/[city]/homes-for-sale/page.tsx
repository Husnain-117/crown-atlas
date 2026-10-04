import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { absoluteUrl } from "@/lib/constants/site"
import { isCACitySlug } from "@/lib/seo/cities"
import { canonicalCityBuyPath, resolveCanonicalCityLocation } from "@/lib/seo/location-canonical"

export const dynamicParams = true

function targetFor(city: string) {
  if (!isCACitySlug(city)) notFound()
  const location = resolveCanonicalCityLocation(city)
  if (!location) notFound()
  return { location, path: canonicalCityBuyPath(location) }
}

export async function generateMetadata({ params }: {
  params: Promise<{ city: string }>
}): Promise<Metadata> {
  const { city } = await params
  const { location, path } = targetFor(city)
  return {
    title: `${location.city.name} Homes for Sale | Crown Coastal Homes`,
    alternates: { canonical: absoluteUrl(path) },
    robots: { index: false, follow: true },
  }
}

export default async function Page({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  permanentRedirect(targetFor(city).path)
}
