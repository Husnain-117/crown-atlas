import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import LandingTemplate from '@/components/landing/LandingTemplate'
import { isCACitySlug } from '@/lib/seo/cities'
import { LANDINGS_BY_SLUG, type LandingSlug } from '@/lib/landing/defs'
import { getLandingData } from '@/lib/landing/query'
import { getLandingStats } from '@/lib/landing/query'
import { getOrGenerateFaqs } from '@/lib/faqs'
import {
  isPriorityCitySlug,
  isPriorityLanding,
} from '@/lib/seo/priority-locations'
import {
  canonicalCityBuyPath,
  canonicalCityFacetPath,
  resolveCanonicalCityLocation,
} from '@/lib/seo/location-canonical'
import { shouldIndexLandingPage } from '@/lib/seo/landing-indexing'

// ISR: regenerate at most once per hour.
// Only priority markets are built up front. Other valid combinations are
// generated on demand and retained by ISR.
export const revalidate = 3600
export const dynamicParams = true

// Generate data-heavy city pages on the first request, then retain them in the
// ISR cache. Building them up front would persist the intentional build-time
// database fallback (empty listings) for the full revalidation window.
export async function generateStaticParams() {
  return [] as Array<{ city: string; landing: LandingSlug }>
}

const PROD_URL = 'https://crowncoastalhomes.com'

/**
 * Build the URL for the dynamically-generated OG image for this landing page.
 * The /api/og edge route renders a branded 1200×630 image at the CDN layer so
 * social previews on Facebook, LinkedIn, Twitter/X, and iMessage are always
 * populated — critical for click-through rate on shared links.
 */
function buildOgImageUrl(cityName: string, landingTitle: string): { url: string; width: number; height: number; alt: string } {
  const qs = new URLSearchParams({
    city: cityName,
    landing: landingTitle,
    tag: 'Luxury Real Estate · Southern California',
  })
  return {
    url: `${PROD_URL}/api/og?${qs.toString()}`,
    width: 1200,
    height: 630,
    alt: `${cityName} ${landingTitle} — Crown Coastal Homes`,
  }
}

export async function generateMetadata({ params }: { params: Promise<{ city: string; landing: LandingSlug }> }): Promise<Metadata> {
  const { city, landing } = await params
  const citySlug = String(city).toLowerCase()
  if (!isCACitySlug(citySlug)) notFound()
  const location = resolveCanonicalCityLocation(citySlug)
  if (!location) notFound()
  const cityName = location.city.name
  const def = LANDINGS_BY_SLUG[landing]
  if (!def) notFound()
  const baseTitle = def.title(cityName)
  const canonicalPath = landing === 'homes-for-sale'
    ? canonicalCityBuyPath(location)
    : canonicalCityFacetPath(location, landing)
  const canonical = `${PROD_URL}${canonicalPath}`
  const desc = def.description(cityName)
  const stats = landing === 'homes-for-sale' ? {} : await getLandingStats(cityName, landing)
  const shouldIndex = shouldIndexLandingPage({
    priorityCity: isPriorityCitySlug(citySlug),
    priorityLanding: isPriorityLanding(landing),
    activeListings: stats.totalActive,
  })

  // Stable OG image for this city × landing combination (edge-rendered, CDN-cached)
  const ogImage = buildOgImageUrl(cityName, def.title(cityName))

  return {
    title: baseTitle,
    description: desc,
    alternates: { canonical },
    robots: {
      index: shouldIndex,
      follow: true,
    },
    openGraph: {
      title: baseTitle,
      description: desc,
      url: canonical,
      type: 'website',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: baseTitle,
      description: desc,
      images: [ogImage.url],
    },
  }
}

export default async function Page({ params }: { params: Promise<{ city: string; landing: LandingSlug }> }) {
  const { city, landing } = await params
  const citySlug = String(city).toLowerCase()
  if (!isCACitySlug(citySlug)) notFound()
  const location = resolveCanonicalCityLocation(citySlug)
  if (!location) notFound()
  const cityName = location.city.name
  const def = LANDINGS_BY_SLUG[landing]
  if (!def) notFound()

  if (landing === 'homes-for-sale') {
    permanentRedirect(canonicalCityBuyPath(location))
  }

  const canonicalFacetPath = canonicalCityFacetPath(location, landing)
  if (`/california/${citySlug}/${landing}` !== canonicalFacetPath) {
    permanentRedirect(canonicalFacetPath)
  }

  // ============================================================================
  // NOTE: AI generation is DISABLED for page rendering.
  // getLandingData() now only fetches cached AI content from database.
  // To generate new AI content, use:
  // - POST /api/admin/landing-pages/generate-content
  // - CLI scripts with ALLOW_AI_GENERATION=true
  // ============================================================================

  const data = await getLandingData(cityName, def.slug as any, { landingDef: def })
  // FAQs: fetch cached only - no generation at runtime
  const faqBundle = await getOrGenerateFaqs(cityName, def.slug)
  return <LandingTemplate data={data} faqItems={faqBundle?.faqs} />
}
