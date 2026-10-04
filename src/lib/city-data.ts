import { HomeIcon, MapPin, MessageSquare } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { getCountyAndCitySlugForCityName, getCounty } from "./counties"
import { resolveCityHeroImage } from "./city-hero-images"
import citySeedsJson from "./city-seeds.json"

export interface Neighborhood {
  name: string
  description: string
  href: string
  image?: string
  detailedDescription?: string
}

export interface NeighborhoodCategory {
  name: string
  neighborhoods: Neighborhood[]
}

export interface Fact {
  icon: LucideIcon
  title: string
  value: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface MarketTrend {
  metric: string
  value: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon?: LucideIcon
}

export interface CityData {
  id: string
  name: string
  fullName: string
  heroImage: string
  heroTitle: string
  heroSubtitle: string
  introText: string
  mapPlaceholderImage: string
  neighborhoodCategories: NeighborhoodCategory[]
  facts: Fact[]
  faqs: FAQItem[]
  marketTrends?: MarketTrend[]
  metaTitle: string
  metaDescription: string
  osmBoundingBox?: [number, number, number, number]
  county: string
}

interface CitySeed {
  id: string
  name: string
  fullName: string
  heroImage: string
  mapPlaceholderImage: string
  neighborhoodCategories: Array<{
    name: string
    neighborhoods: Array<{
      name: string
      href: string
      image?: string
    }>
  }>
  osmBoundingBox?: [number, number, number, number]
  county: string
}

const citySeeds = citySeedsJson as unknown as Record<string, CitySeed>

function buildPublicCityData(seed: CitySeed): CityData {
  const locationName = seed.fullName || `${seed.name}, California`
  const cityRoute = getCountyAndCitySlugForCityName(seed.name)
  const verifiedHero = cityRoute
    ? resolveCityHeroImage(cityRoute.citySlug)
    : resolveCityHeroImage(seed.id)
  const listingDisclaimer =
    "Listing status, price, and property details come from CRMLS and can change. Verify material facts, neighborhood priorities, and property-specific information before making a decision."

  return {
    ...seed,
    heroImage: verifiedHero?.imageUrl ?? seed.heroImage,
    heroTitle: `${seed.name} Real Estate`,
    heroSubtitle: `Browse current listings and compare neighborhoods in ${seed.name}.`,
    introText: `Explore current homes and local real estate information for ${locationName}. ${listingDisclaimer}`,
    neighborhoodCategories: seed.neighborhoodCategories.map((category) => ({
      name: category.name,
      neighborhoods: category.neighborhoods.map((neighborhood) => ({
        ...neighborhood,
        description: `Explore current homes and property details in ${neighborhood.name}, ${seed.name}.`,
        detailedDescription: `Review active listings, property details, and location information for ${neighborhood.name}, ${seed.name}. ${listingDisclaimer}`,
      })),
    })),
    facts: [
      { icon: MapPin, title: "Location", value: locationName },
      { icon: HomeIcon, title: "Listing data", value: "CRMLS" },
      { icon: MessageSquare, title: "Next step", value: "Request a consultation" },
    ],
    faqs: [
      {
        question: `How current are the ${seed.name} listings?`,
        answer: "Listing data is refreshed from CRMLS. Availability, price, status, and property details can change, so confirm current information before scheduling a tour or preparing an offer.",
      },
      {
        question: `How should I compare neighborhoods in ${seed.name}?`,
        answer: "Compare the factors that matter to your household, such as property type, monthly costs, commute options, insurance, HOA terms, and access to services. Verify schools, boundaries, and public services with the responsible official sources.",
      },
      {
        question: `What should I verify before buying in ${seed.name}?`,
        answer: "Review disclosures, inspections, title, taxes, insurance availability, HOA documents when applicable, and financing terms with qualified professionals. Crown Coastal Homes can help coordinate the real estate process but does not replace legal, tax, lending, or inspection advice.",
      },
    ],
    metaTitle: `Homes for Sale in ${seed.name}, CA | Crown Coastal Homes`,
    metaDescription: `Browse current homes for sale in ${seed.name}. Compare CRMLS listings, review property details, and request a tour with Crown Coastal Homes.`,
  }
}

export const citiesData: Record<string, CityData> = Object.fromEntries(
  Object.entries(citySeeds).map(([slug, seed]) => [slug, buildPublicCityData(seed)])
)

function titleCaseSlug(value: string): string {
  return value
    .replace(/-ca$/i, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export const getCityData = (cityId: string): CityData | undefined => {
  const normalizedId = cityId.toLowerCase()
  const existing = citiesData[normalizedId]
  if (existing) return existing

  const cityInfo = getCountyAndCitySlugForCityName(titleCaseSlug(normalizedId))
  if (!cityInfo) return undefined

  const county = getCounty(cityInfo.countySlug)
  if (!county) return undefined

  const name = titleCaseSlug(cityInfo.citySlug)
  return buildPublicCityData({
    id: normalizedId,
    name,
    fullName: `${name}, California`,
    heroImage: "/placeholder.svg",
    mapPlaceholderImage: "/placeholder.svg",
    neighborhoodCategories: [],
    county: `${county.slug}-county`,
  })
}

const cityNames: Record<string, string> = {
  "san-diego": "San Diego",
  "los-angeles": "Los Angeles",
  "san-francisco": "San Francisco",
  "san-jose": "San Jose",
  "san-mateo": "San Mateo",
  "redwood-city": "Redwood City",
  "palm-springs": "Palm Springs",
  "palm-beach": "Palm Beach",
  "palm-beach-gardens": "Palm Beach Gardens",
  malibu: "Malibu",
  orange: "Orange",
  ventura: "Ventura",
  "santa-barbara": "Santa Barbara",
  "santa-monica": "Santa Monica",
  "santa-rosa": "Santa Rosa",
  sonoma: "Sonoma",
  napa: "Napa",
  yosemite: "Yosemite",
  "san-bernardino": "San Bernardino",
}

export const MappingCityIdToCityName = (cityId: string): string =>
  cityNames[cityId.toLowerCase()] ?? titleCaseSlug(cityId)
