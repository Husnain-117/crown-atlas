import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { SITE_URL } from "@/lib/constants/site"
import { legacyDiscoverTarget } from "@/lib/seo/location-canonical"

export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>
}): Promise<Metadata> {
  const { city } = await params
  const target = legacyDiscoverTarget(city)

  return {
    title: "Property search moved | Crown Coastal Homes",
    robots: { index: false, follow: true },
    alternates: target ? { canonical: `${SITE_URL}${target}` } : undefined,
  }
}

export default async function LegacyDiscoverPage({
  params,
}: {
  params: Promise<{ city: string }>
}) {
  const { city } = await params
  const target = legacyDiscoverTarget(city)
  if (!target) notFound()
  permanentRedirect(target)
}
