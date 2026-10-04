import { PropertyFilters } from '@/types/filters'

// Supported landing slugs (city-focused variants)
export type LandingSlug =
  | 'homes-for-sale'
  | 'condos-for-sale'
  | 'homes-with-pool'
  | 'luxury-homes'
  | 'homes-under-500k'
  | 'homes-over-1m'
  | '2-bedroom-apartments'
  // New landing types
  | '3-bedroom-homes'
  | '4-bedroom-homes'
  | 'single-family-homes'
  | 'new-construction'
  | 'townhomes-for-sale'
  | 'ocean-view-homes'
  | 'gated-community'
  | 'homes-with-garage'

export interface LandingDef {
  slug: LandingSlug
  title: (city: string) => string
  description: (city: string) => string
  canonicalPath: (citySlug: string) => string
  aiPromptKey: string
  faqKey: string
  filters: (city: string) => Partial<PropertyFilters>
}

const up = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase())

export const LANDINGS: LandingDef[] = [
  {
    slug: 'homes-for-sale',
    title: (city) => `${up(city)}, CA Homes For Sale`,
    description: (city) => `Explore homes for sale in ${up(city)}, CA with photos, prices, and local insights.`,
    canonicalPath: (citySlug) => `/california/${citySlug}/homes-for-sale`,
    aiPromptKey: 'ai_city_homes_for_sale',
    faqKey: 'faq_homes_for_sale',
    filters: (city) => ({ city: up(city) })
  },
  {
    slug: 'condos-for-sale',
    title: (city) => `${up(city)}, CA Condos For Sale`,
    description: (city) => `Browse current condos for sale in ${up(city)}, CA with photos, prices, and property details.`,
    canonicalPath: (citySlug) => `/california/${citySlug}/condos-for-sale`,
    aiPromptKey: 'ai_city_condos_for_sale',
    faqKey: 'faq_condos_for_sale',
    filters: (city) => ({ city: up(city), propertyType: ['condo', 'condominium'] })
  },
  {
    slug: 'homes-with-pool',
    title: (city) => `${up(city)}, CA Homes With Pool`,
    description: (city) => `See homes with pools in ${up(city)}, CA — perfect for warm days and outdoor living.`,
    canonicalPath: (citySlug) => `/california/${citySlug}/homes-with-pool`,
    aiPromptKey: 'ai_city_homes_with_pool',
    faqKey: 'faq_homes_with_pool',
    filters: (city) => ({ city: up(city), hasPool: true })
  },
  {
    slug: 'luxury-homes',
    title: (city) => `${up(city)}, CA Luxury Homes`,
    description: (city) => `Discover luxury homes in ${up(city)}, CA — high-end finishes and premier locations.`,
    canonicalPath: (citySlug) => `/california/${citySlug}/luxury-homes`,
    aiPromptKey: 'ai_city_luxury_homes',
    faqKey: 'faq_luxury_homes',
    filters: (city) => ({ city: up(city), priceRange: [1_000_000, Number.MAX_SAFE_INTEGER] })
  },
  {
    slug: 'homes-under-500k',
    title: (city) => `${up(city)}, CA Homes Under $500k`,
    description: (city) => `Affordable homes under $500k in ${up(city)}, CA — start your search here.`,
    canonicalPath: (citySlug) => `/california/${citySlug}/homes-under-500k`,
    aiPromptKey: 'ai_city_homes_under_500k',
    faqKey: 'faq_homes_under_500k',
    filters: (city) => ({ city: up(city), priceRange: [0, 500_000] })
  },
  {
    slug: 'homes-over-1m',
    title: (city) => `${up(city)}, CA Homes Over $1M`,
    description: (city) => `Explore homes over $1M in ${up(city)}, CA — premium properties and locations.`,
    canonicalPath: (citySlug) => `/california/${citySlug}/homes-over-1m`,
    aiPromptKey: 'ai_city_homes_over_1m',
    faqKey: 'faq_homes_over_1m',
    filters: (city) => ({ city: up(city), priceRange: [1_000_000, Number.MAX_SAFE_INTEGER] })
  },
  {
    slug: '2-bedroom-apartments',
    title: (city) => `2-Bedroom Apartments in ${up(city)}, CA`,
    description: (city) => `Find 2-bedroom apartments in ${up(city)}, CA — space, convenience, and great locations.`,
    canonicalPath: (citySlug) => `/california/${citySlug}/2-bedroom-apartments`,
    aiPromptKey: 'ai_city_2_bed_apartments',
    faqKey: 'faq_2_bed_apartments',
    filters: (city) => ({ city: up(city), propertyType: ['apartment', 'condo'], beds: '2+' })
  },
  // ─────────────────── New Landing Types ───────────────────
  {
    slug: '3-bedroom-homes',
    title: (city) => `3-Bedroom Homes for Sale in ${up(city)}, CA`,
    description: (city) => `Browse 3-bedroom homes for sale in ${up(city)}, CA — ideal for growing families.`,
    canonicalPath: (citySlug) => `/california/${citySlug}/3-bedroom-homes`,
    aiPromptKey: 'ai_city_3_bed_homes',
    faqKey: 'faq_3_bed_homes',
    filters: (city) => ({ city: up(city), beds: '3+' })
  },
  {
    slug: '4-bedroom-homes',
    title: (city) => `4-Bedroom Homes for Sale in ${up(city)}, CA`,
    description: (city) => `Find spacious 4-bedroom homes in ${up(city)}, CA — room for the whole family.`,
    canonicalPath: (citySlug) => `/california/${citySlug}/4-bedroom-homes`,
    aiPromptKey: 'ai_city_4_bed_homes',
    faqKey: 'faq_4_bed_homes',
    filters: (city) => ({ city: up(city), beds: '4+' })
  },
  {
    slug: 'single-family-homes',
    title: (city) => `Single Family Homes in ${up(city)}, CA`,
    description: (city) => `Explore single family homes for sale in ${up(city)}, CA — yards, privacy, and space.`,
    canonicalPath: (citySlug) => `/california/${citySlug}/single-family-homes`,
    aiPromptKey: 'ai_city_single_family',
    faqKey: 'faq_single_family',
    filters: (city) => ({ city: up(city), propertyType: ['single family', 'single family residence'] })
  },
  {
    slug: 'new-construction',
    title: (city) => `New Construction Homes in ${up(city)}, CA`,
    description: (city) => `Discover brand-new construction homes in ${up(city)}, CA — modern designs and energy efficiency.`,
    canonicalPath: (citySlug) => `/california/${citySlug}/new-construction`,
    aiPromptKey: 'ai_city_new_construction',
    faqKey: 'faq_new_construction',
    filters: (city) => ({ city: up(city), features: ['new construction'] })
  },
  {
    slug: 'townhomes-for-sale',
    title: (city) => `Townhomes for Sale in ${up(city)}, CA`,
    description: (city) => `Browse townhomes for sale in ${up(city)}, CA — the perfect blend of space and convenience.`,
    canonicalPath: (citySlug) => `/california/${citySlug}/townhomes-for-sale`,
    aiPromptKey: 'ai_city_townhomes',
    faqKey: 'faq_townhomes',
    filters: (city) => ({ city: up(city), propertyType: ['townhouse', 'townhome'] })
  },
  {
    slug: 'ocean-view-homes',
    title: (city) => `Ocean View Homes in ${up(city)}, CA`,
    description: (city) => `Find stunning ocean view homes in ${up(city)}, CA — wake up to the Pacific every morning.`,
    canonicalPath: (citySlug) => `/california/${citySlug}/ocean-view-homes`,
    aiPromptKey: 'ai_city_ocean_view',
    faqKey: 'faq_ocean_view',
    filters: (city) => ({ city: up(city), hasView: true })
  },
  {
    slug: 'gated-community',
    title: (city) => `Gated Community Homes in ${up(city)}, CA`,
    description: (city) => `Explore gated community homes in ${up(city)}, CA — security, privacy, and premium amenities.`,
    canonicalPath: (citySlug) => `/california/${citySlug}/gated-community`,
    aiPromptKey: 'ai_city_gated_community',
    faqKey: 'faq_gated_community',
    filters: (city) => ({ city: up(city), features: ['gated'] })
  },
  {
    slug: 'homes-with-garage',
    title: (city) => `Homes with Garage in ${up(city)}, CA`,
    description: (city) => `Find homes with garage in ${up(city)}, CA — secure parking and extra storage space.`,
    canonicalPath: (citySlug) => `/california/${citySlug}/homes-with-garage`,
    aiPromptKey: 'ai_city_homes_with_garage',
    faqKey: 'faq_homes_with_garage',
    filters: (city) => ({ city: up(city), features: ['garage'] })
  }
]

export const LANDINGS_BY_SLUG: Record<string, LandingDef> = Object.fromEntries(LANDINGS.map(d => [d.slug, d]))
