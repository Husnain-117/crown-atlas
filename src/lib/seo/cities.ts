import { getCityBySlug } from "@/lib/counties"

// Central California city slugs for SEO landing pages
// Idempotent: safe to re-run without duplication.
export const CA_CITIES = [
  // Major metros (original 7)
  "los-angeles",
  "san-diego",
  "san-jose",
  "san-francisco",
  "irvine",
  "pasadena",
  "santa-monica",
  // Orange County
  "anaheim",
  "huntington-beach",
  "newport-beach",
  "costa-mesa",
  "laguna-beach",
  "fullerton",
  "mission-viejo",
  "dana-point",
  "san-clemente",
  "yorba-linda",
  // San Diego County
  "carlsbad",
  "encinitas",
  "oceanside",
  "la-jolla",
  "coronado",
  "del-mar",
  "chula-vista",
  "escondido",
  // Los Angeles Metro
  "long-beach",
  "beverly-hills",
  "manhattan-beach",
  "malibu",
  "west-hollywood",
  "culver-city",
  "burbank",
  "glendale",
  "torrance",
  "redondo-beach",
  // Bay Area
  "palo-alto",
  "mountain-view",
  "sunnyvale",
  "cupertino",
  "santa-clara",
  "berkeley",
  "oakland",
  "walnut-creek",
  // Central & South Coast
  "santa-barbara",
  "ventura",
  "thousand-oaks",
  "sacramento",
  "fresno",
  "riverside",
] as const;

export type CACitySlug = typeof CA_CITIES[number];

export function isCACitySlug(slug: string): boolean {
  const normalized = slug.trim().toLowerCase().replace(/-ca$/i, "")
  return (
    (CA_CITIES as readonly string[]).includes(normalized) ||
    Boolean(getCityBySlug(`${normalized}-ca`))
  )
}

export function cityToTitle(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9- ]/g, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function slugToCity(slug: string) {
  // Placeholder for future mapping / overrides.
  return cityToTitle(slug);
}
