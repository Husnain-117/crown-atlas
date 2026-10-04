import type { Metadata } from "next"
import { CityData } from "@/lib/city-data"
import { ClusterConfig } from "./cluster-config"
import { SITE_URL } from "@/lib/constants/site"

export function generateClusterMetadata(
  cityData: CityData,
  clusterConfig: ClusterConfig
): Metadata {
  const cityName = cityData.name
  const clusterName = clusterConfig.name
  const canonical = `${SITE_URL}/discover/${cityData.id}/${clusterConfig.id}`
  
  // Generate SEO-optimized title
  const title = `${clusterName} in ${cityName}, CA | Crown Coastal Homes`
  
  // Generate description
  const description = `Browse ${clusterName.toLowerCase()} in ${cityName}, California. ${clusterConfig.description}. View listings, market insights, and connect with local real estate experts.`

  const ogImage = {
    url: cityData.heroImage,
    width: 1200,
    height: 630,
    alt: `${clusterName} in ${cityName}, California`,
  }
  
  return {
    title: title.length <= 60 ? title : `${clusterName} in ${cityName} | Crown Coastal Homes`,
    description: description.length <= 160 ? description : description.substring(0, 157) + '...',
    alternates: {
      canonical: canonical,
    },
    robots: {
      index: !process.env.VERCEL || process.env.VERCEL_ENV === 'production',
      follow: true,
    },
    openGraph: {
      title: title,
      description: description,
      url: canonical,
      images: [ogImage],
    },
    // Twitter card — without this Next.js does not emit twitter:image meta tags
    // which causes blank previews on Twitter/X, iMessage, and Slack unfurls.
    twitter: {
      card: 'summary_large_image',
      title: title.length <= 60 ? title : `${clusterName} in ${cityName} | Crown Coastal Homes`,
      description: description.length <= 160 ? description : description.substring(0, 157) + '...',
      images: [cityData.heroImage],
    },
  }
}

