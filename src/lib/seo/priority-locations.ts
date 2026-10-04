import type { LandingSlug } from "@/lib/landing/defs"

export const PRIORITY_CITY_SLUGS = [
  "san-diego",
  "la-jolla",
  "del-mar",
  "coronado",
  "carlsbad",
  "encinitas",
  "los-angeles",
  "beverly-hills",
  "santa-monica",
  "malibu",
  "newport-beach",
  "laguna-beach",
  "irvine",
  "san-francisco",
  "san-jose",
] as const

export const PRIORITY_COUNTY_SLUGS = [
  "san-diego",
  "orange",
  "los-angeles",
  "san-francisco",
  "santa-clara",
  "santa-barbara",
] as const

export const PRIORITY_LANDING_SLUGS = [
  "homes-for-sale",
  "condos-for-sale",
  "luxury-homes",
  "ocean-view-homes",
  "homes-with-pool",
] as const satisfies readonly LandingSlug[]

export const PRIORITY_CLUSTER_SLUGS = [
  "houses-for-sale",
  "condos-for-sale",
  "luxury-homes",
  "oceanfront",
  "new-construction",
] as const

export function normalizeCitySlug(slug: string): string {
  return slug.trim().toLowerCase().replace(/-ca$/i, "")
}

export function isPriorityCitySlug(slug: string): boolean {
  const normalized = normalizeCitySlug(slug)
  return PRIORITY_CITY_SLUGS.some((city) => city === normalized)
}

export function isPriorityLanding(slug: string): boolean {
  return PRIORITY_LANDING_SLUGS.some((landing) => landing === slug)
}

export function isPriorityCluster(slug: string): boolean {
  return PRIORITY_CLUSTER_SLUGS.some((cluster) => cluster === slug)
}
