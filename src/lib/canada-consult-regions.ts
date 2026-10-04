export const CANADA_CONSULT_REGIONS = {
  "san-diego": {
    label: "San Diego", source: "canada_san_diego_consult", searchRegion: "San Diego / La Jolla",
    areas: ["La Jolla", "Del Mar", "Rancho Santa Fe", "Coronado", "Carmel Valley", "Encinitas / Solana Beach", "Still comparing"],
    lead: "Compare San Diego neighbourhoods, your USD budget and viewing options with Reza before planning your trip from Canada.",
    areaIntro: "Start with these San Diego communities. The right fit depends on your priorities and the individual property.",
    areaDescriptions: [
      "Coastal neighbourhoods, village access and a range of home styles. Discuss how ocean views, privacy and access fit your priorities.",
      "A coastal village and surrounding residential areas. Compare proximity to the beach with space, privacy and your everyday travel.",
      "Consider larger properties and a more inland setting. Review maintenance, community requirements and driving routes for each home.",
      "An island community across the bay from downtown. Include bridge travel, seasonal activity and the property's location in your brief.",
      "Compare residential communities around your daily routes. Check school assignments and enrolment directly with the relevant district.",
      "Explore North County coastal communities. Compare beach access, neighbourhood character and commute needs property by property.",
    ],
    localQuestion: "How do we narrow down San Diego neighbourhoods?",
    localAnswer: "Start with your daily travel, intended use, space and coastal priorities. Compare La Jolla, Del Mar and the other communities against that brief before requesting viewings.",
  },
  "los-angeles": {
    label: "Los Angeles", source: "canada_los_angeles_consult", searchRegion: "Los Angeles",
    areas: ["Santa Monica", "Pacific Palisades", "Beverly Hills", "Brentwood", "Manhattan Beach", "Malibu", "Still comparing"],
    lead: "Compare Westside and coastal Los Angeles options around your USD budget. Start with a conversation from Canada before arranging viewings.",
    areaIntro: "Compare the Westside and coastal communities around your actual daily routes. Your preferred setting and the individual property's condition belong in the same brief.",
    areaDescriptions: [
      "Compare beach access, residential streets and proximity to the places you will use regularly. Review parking and building requirements for each property.",
      "Discuss the current condition of the specific home and surrounding access. Request current property and insurance information before making plans.",
      "Compare residential locations, privacy and access to your daily destinations. Review each property's setting rather than relying on a neighbourhood name.",
      "Consider Westside residential options around work and family routines. Include local travel, parking and maintenance needs in the search.",
      "Explore a South Bay coastal setting. Compare space, beach proximity and your routes to work or the airport property by property.",
      "Discuss coastal living alongside driving routes, maintenance and site-specific requirements. Ask for current condition and insurance information early.",
    ],
    localQuestion: "Should we compare coastal Los Angeles with the Westside?",
    localAnswer: "Yes, if both fit your plans. Share the places you expect to visit regularly, your preferred home style and your viewing dates. Use those priorities to compare Santa Monica, Brentwood, the South Bay and other areas.",
  },
  "orange-county": {
    label: "Orange County", source: "canada_orange_county_consult", searchRegion: "Orange County",
    areas: ["Newport Beach", "Newport Coast", "Corona del Mar", "Laguna Beach", "Dana Point", "Irvine", "Still comparing"],
    lead: "Newport Beach, Laguna Beach or Irvine? Compare your options around your USD budget and everyday plans before travelling from Canada.",
    areaIntro: "A coastal address and an inland residential community can serve different plans. Compare the setting, daily travel and community requirements before choosing your shortlist.",
    areaDescriptions: [
      "Compare coastal and harbour-area settings with residential neighbourhoods. Include parking, access and the way you will use the home in your brief.",
      "Review individual communities, property layouts and any association requirements. Discuss privacy, maintenance and your preferred coastal access.",
      "Consider the village and surrounding residential streets. Compare lot size, parking and proximity to the places you want to use regularly.",
      "Explore different coastal settings and property layouts. Check access, parking and maintenance requirements for the specific home.",
      "Consider a southern Orange County coastal base. Include your everyday routes and preferred setting before scheduling viewings.",
      "Compare residential communities around work and daily routines. Verify school assignments and any association requirements directly.",
    ],
    localQuestion: "How do we compare Newport Beach, Laguna Beach and Irvine?",
    localAnswer: "Start with how you will use the home. Beach proximity, daily travel, space and community requirements may lead to different choices. Discuss those tradeoffs before arranging a viewing trip from Canada.",
  },
  "santa-barbara": {
    label: "Santa Barbara", source: "canada_santa_barbara_consult", searchRegion: "Santa Barbara",
    areas: ["Montecito", "Hope Ranch", "Mesa", "Downtown Santa Barbara", "Goleta", "Carpinteria", "Still comparing"],
    lead: "Montecito, Santa Barbara or a nearby coastal community? Discuss your USD budget, priorities and viewing plans before travelling from Canada.",
    areaIntro: "Compare Santa Barbara and nearby communities around the home you want to use. Space, privacy, coastal access and ongoing care are useful starting points.",
    areaDescriptions: [
      "Compare property settings, privacy and access to daily destinations. Request current condition, maintenance and insurance information for each home.",
      "Discuss property size, upkeep and any community requirements. Compare the individual home's location with your plans for living there.",
      "Consider a residential setting near the coast. Review the particular property's access, layout and proximity to everyday destinations.",
      "Compare convenience to shops and services with parking, space and privacy. Review building requirements where relevant.",
      "Explore residential options west of Santa Barbara. Include work locations, travel routes and the space you need in your search brief.",
      "Consider a smaller coastal community east of Santa Barbara. Compare access, property style and your preferred pace of daily life.",
    ],
    localQuestion: "Can we compare Montecito with other Santa Barbara communities?",
    localAnswer: "Tell Reza what matters most: space, privacy, coastal access, everyday convenience or a second-home base. Start the file with him; his lender partner can pre-qualify the mortgage before he introduces a local agent for your Santa Barbara search.",
  },
} as const

export type CanadaConsultRegion = keyof typeof CANADA_CONSULT_REGIONS
export function canadaConsultRegionFromSource(source: string): CanadaConsultRegion | undefined {
  return (Object.keys(CANADA_CONSULT_REGIONS) as CanadaConsultRegion[]).find(region => CANADA_CONSULT_REGIONS[region].source === source)
}
