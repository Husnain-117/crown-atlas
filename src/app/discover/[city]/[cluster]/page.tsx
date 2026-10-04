import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { getClusterConfig } from "@/lib/clusters/cluster-config"
import { SITE_URL } from "@/lib/constants/site"
import {
  legacyClusterTarget,
  resolveCanonicalCityLocation,
} from "@/lib/seo/location-canonical"

export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; cluster: string }>
}): Promise<Metadata> {
  const { city, cluster } = await params
  const location = resolveCanonicalCityLocation(city)
  const clusterConfig = getClusterConfig(cluster)
  const target = legacyClusterTarget(city, cluster)

  if (!location || !clusterConfig || !target) {
    return {
      title: "Page Not Found | Crown Coastal Homes",
      robots: { index: false, follow: true },
    }
  }

  return {
    title: `${clusterConfig.name} in ${location.city.name}, CA | Crown Coastal Homes`,
    alternates: { canonical: `${SITE_URL}${target}` },
    robots: { index: false, follow: true },
  }
}

export default async function LegacyClusterPage({
  params,
}: {
  params: Promise<{ city: string; cluster: string }>
}) {
  const { city, cluster } = await params
  if (!getClusterConfig(cluster)) notFound()

  const target = legacyClusterTarget(city, cluster)
  if (!target) notFound()
  permanentRedirect(target)
}
