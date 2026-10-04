export interface CityResearch {
  introduction: string
  checks: string[]
  source: { label: string; href: string }
}

// Source links checked September 2026. These are research steps, not assumptions
// about price, returns, school quality, or permission to alter a specific home.
const CITY_RESEARCH: Record<string, CityResearch> = {
  "la-jolla": {
    introduction: "La Jolla is a coastal community within the City of San Diego. Use its community plan to put a listing's location in context, then compare individual streets, access, property condition and ownership costs.",
    checks: ["Locate the address in the La Jolla community plan and confirm the responsible planning authority.", "For a proposed remodel, ask about the property's zoning and any coastal or historic review before relying on expansion potential.", "Compare the exact route to the Village, UC San Diego or your own destination at your expected travel times."],
    source: { label: "City of San Diego: La Jolla Community Plan", href: "https://www.sandiego.gov/planning/community-plans/la-jolla" },
  },
  "san-diego": {
    introduction: "San Diego's community plans offer a practical starting point for comparing different parts of the city. A citywide asking-price median combines different property types and locations; narrow the search before comparing individual homes.",
    checks: ["Find the property's community plan and compare its land-use context with your intended use.", "Build a shortlist around the exact address, parking, outdoor space and routes you will use.", "Review permits for additions or conversions with the city before including that space in your plans."],
    source: { label: "City of San Diego: community plans", href: "https://www.sandiego.gov/planning/community-plans" },
  },
  "newport-beach": {
    introduction: "In Newport Beach, compare the property's actual access, building condition and use permissions alongside the listing price. The city's Community Development Department provides the starting point for planning and building questions.",
    checks: ["Check the address, parcel and permit history with Community Development before planning changes.", "For a waterfront home, request the documents covering any advertised dock or access rights and maintenance responsibilities.", "Compare parking, visitor access and the route to your regular destinations for each shortlisted address."],
    source: { label: "Newport Beach: Community Development", href: "https://www.newportbeachca.gov/government/departments/community-development" },
  },
  "los-angeles": {
    introduction: "Los Angeles City Planning's ZIMAS tool lets buyers look up parcel-level zoning, planning applications and permit history. Start with the exact address rather than treating every Los Angeles listing as having the same development options.",
    checks: ["Check whether the address is within the City of Los Angeles before using ZIMAS.", "Look up the parcel's community plan and any overlays, then discuss proposed alterations with the responsible authority.", "Test your specific commute and compare parking, building systems and shared ownership obligations."],
    source: { label: "Los Angeles City Planning: zoning search", href: "https://planning.lacity.gov/zoning/zoning-search" },
  },
  "malibu": {
    introduction: "For a Malibu purchase, investigate the existing home and any future building plans separately. The city's planning process information explains where planning and coastal development review enter a proposed project.",
    checks: ["Confirm the property's jurisdiction and discuss any remodel or rebuilding plan with the planning department.", "Request property-specific information on access, utilities, site condition and existing permits.", "Obtain insurance and specialist inspection information for the exact address before deciding on an offer."],
    source: { label: "City of Malibu: planning process overview", href: "https://www.malibucity.org/521/Planning-Process-Overview" },
  },
  "san-francisco": {
    introduction: "San Francisco Planning provides an address-based Property Information Map for researching zoning. For a purchase, combine that parcel information with the documents for the specific unit, building and form of ownership.",
    checks: ["Look up the address in the city's Property Information Map and review the zoning information.", "Confirm whether the interest offered is a condominium, tenancy in common or another form of ownership, and review the corresponding documents.", "Check the documentation for any advertised parking or storage and compare building maintenance obligations."],
    source: { label: "San Francisco Planning: zoning and property information", href: "https://sfplanning.org/zoning" },
  },
}

export function getCityResearch(citySlug: string): CityResearch | null {
  return CITY_RESEARCH[citySlug.toLowerCase().replace(/-ca$/, "")] ?? null
}
