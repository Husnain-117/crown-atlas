export interface LocalMarketEditorial {
  overview: string
  reviewPoints: [string, string, string]
  agentReview: string
  officialUrl: string
  officialLabel: string
}

export const LOCAL_MARKET_EDITORIAL: Record<string, LocalMarketEditorial> = {
  "san-diego": {
    overview: "San Diego is a collection of distinct coastal, urban, and inland housing markets. Property type, marine exposure, insurance availability, commute patterns, and neighborhood-level inventory can matter more than a citywide average.",
    reviewPoints: ["Compare detached homes, condominiums, and planned communities separately.", "Verify insurance, HOA obligations, permits, and coastal or hillside conditions for the individual property.", "Use recent nearby closed sales rather than a broad county average when judging value."],
    agentReview: "The review starts with the buyer's daily routine, then narrows the search by ownership cost, property condition, and defensible comparable sales.",
    officialUrl: "https://www.sandiego.gov/",
    officialLabel: "City of San Diego",
  },
  "la-jolla": {
    overview: "La Jolla inventory spans village condominiums, hillside homes, and coastal properties. View protection, slope, salt-air exposure, parking, and association documents can create major differences between listings with similar bedroom counts.",
    reviewPoints: ["Confirm whether a view is protected or dependent on neighboring vegetation and future work.", "Review drainage, slope, foundation, and exterior maintenance with qualified inspectors.", "For attached homes, examine reserves, insurance, assessments, parking, and use restrictions."],
    agentReview: "The review emphasizes micro-location, physical exposure, and documentation behind any price premium for view or proximity to the coast.",
    officialUrl: "https://www.sandiego.gov/",
    officialLabel: "City of San Diego",
  },
  "del-mar": {
    overview: "Del Mar is a compact coastal market where lot position, access, parking, ocean exposure, and redevelopment constraints can strongly affect value. A property-specific review is more useful than treating all homes west or east of the freeway alike.",
    reviewPoints: ["Verify coastal, flood, drainage, and insurance considerations for the exact parcel.", "Review permits and feasibility before assigning value to expansion or redevelopment potential.", "Compare walkability, traffic patterns, parking, and seasonal use at different times of day."],
    agentReview: "The review separates the value of the existing home from assumptions about views, future construction, or redevelopment.",
    officialUrl: "https://www.delmar.ca.us/",
    officialLabel: "City of Del Mar",
  },
  coronado: {
    overview: "Coronado includes the Village, waterfront settings, and the Cays, each with different ownership and access considerations. Flood information, insurance, lot orientation, HOA terms, and bridge or ferry routines should be reviewed early.",
    reviewPoints: ["Check flood-zone information and obtain property-specific insurance quotes.", "Distinguish Village, waterfront, and Cays comparables rather than combining them.", "Review parking, access, HOA documents, and any dock or waterfront rights in writing."],
    agentReview: "The review tests whether the location premium matches the buyer's actual access, maintenance, and insurance priorities.",
    officialUrl: "https://www.coronado.ca.us/",
    officialLabel: "City of Coronado",
  },
  carlsbad: {
    overview: "Carlsbad ranges from coastal neighborhoods and the Village to newer inland communities. HOA services, special assessments, school boundaries, commute routes, lot orientation, and marine exposure vary considerably across the city.",
    reviewPoints: ["Compare HOA dues and special tax obligations as part of the full monthly cost.", "Verify school assignments and boundaries directly with the responsible district.", "Review coastal exposure, freeway or rail noise, and commute timing at the property."],
    agentReview: "The review compares total ownership cost and location tradeoffs, not just list price and square footage.",
    officialUrl: "https://www.carlsbadca.gov/",
    officialLabel: "City of Carlsbad",
  },
  encinitas: {
    overview: "Encinitas combines coastal neighborhoods, established inland areas, and larger lots. Drainage, bluff or slope conditions, septic or utility details, unpermitted work, and access can be material even within a small search radius.",
    reviewPoints: ["Review permits, drainage, slope, and any nonstandard utility or access conditions.", "Separate coastal, village-adjacent, and inland comparable sales.", "Visit around commute and school traffic periods before relying on a map estimate."],
    agentReview: "The review focuses on parcel-specific constraints and whether the home's condition supports its location premium.",
    officialUrl: "https://www.encinitasca.gov/",
    officialLabel: "City of Encinitas",
  },
  "los-angeles": {
    overview: "Los Angeles is not one housing market. Hillside, coastal, urban, and valley neighborhoods have different insurance, parking, commute, construction, and disclosure issues, so citywide medians are only a starting point.",
    reviewPoints: ["Use neighborhood and property-type comparables with similar terrain and parking.", "For hillside or high-risk areas, investigate insurance, access, drainage, and geologic reports early.", "Confirm municipality, school boundary, permits, and local rules for the exact address."],
    agentReview: "The review narrows Los Angeles by practical routine and risk profile before comparing price per square foot.",
    officialUrl: "https://lacity.gov/",
    officialLabel: "City of Los Angeles",
  },
  "beverly-hills": {
    overview: "A Beverly Hills mailing address does not always mean the property is within the City of Beverly Hills. Municipality, services, school assignment, hillside conditions, lot utility, and renovation quality should be confirmed before comparing listings.",
    reviewPoints: ["Confirm jurisdiction and service boundaries for the parcel, not the mailing label alone.", "Compare flat, canyon, and hillside properties with physically similar sales.", "Review permits, systems, insurance, and renovation quality behind cosmetic finishes."],
    agentReview: "The review separates address prestige from jurisdiction, lot usability, condition, and documented improvements.",
    officialUrl: "https://www.beverlyhills.org/",
    officialLabel: "City of Beverly Hills",
  },
  "santa-monica": {
    overview: "Santa Monica includes detached homes, condominiums, and multifamily properties with different regulatory and ownership considerations. Coastal exposure, parking, seismic work, HOA reserves, and rental rules can materially affect value and carrying cost.",
    reviewPoints: ["For condominiums, review reserves, insurance, assessments, seismic work, and parking rights.", "For income or tenant-occupied property, verify applicable local rules with qualified professionals.", "Compare proximity benefits against traffic, noise, marine exposure, and visitor parking."],
    agentReview: "The review puts building documents and total monthly obligations alongside location and interior condition.",
    officialUrl: "https://www.santamonica.gov/",
    officialLabel: "City of Santa Monica",
  },
  malibu: {
    overview: "Malibu property analysis is highly site-specific. Wildfire exposure, insurance, coastal conditions, septic systems, access, slope, water, permits, and rebuilding constraints should be investigated before relying on price-per-square-foot comparisons.",
    reviewPoints: ["Obtain insurance guidance and review wildfire, coastal, flood, slope, and access conditions early.", "Verify septic, water, permits, easements, and any coastal approvals for the parcel.", "Use comparables with similar side of highway, access, view, lot utility, and beach rights."],
    agentReview: "The review prioritizes insurability, access, infrastructure, and documented rights before lifestyle features.",
    officialUrl: "https://www.malibucity.org/",
    officialLabel: "City of Malibu",
  },
  "newport-beach": {
    overview: "Newport Beach includes harbor, peninsula, coastal, and planned-community markets. Dock or beach rights, HOA rules, flood exposure, parking, lot orientation, and renovation feasibility can produce large differences between nearby properties.",
    reviewPoints: ["Verify waterfront, dock, beach, parking, and access rights in recorded documents.", "Review flood information, insurance, marine exposure, and exterior maintenance.", "Use community-specific comparables and include HOA or special tax costs."],
    agentReview: "The review identifies which location rights are documented and which features are merely described in marketing.",
    officialUrl: "https://www.newportbeachca.gov/",
    officialLabel: "City of Newport Beach",
  },
  "laguna-beach": {
    overview: "Laguna Beach combines coastal, canyon, and hillside settings with varied access and lot utility. Views, parking, fire exposure, drainage, slope, insurance, and remodeling constraints require parcel-level verification.",
    reviewPoints: ["Inspect access, parking, drainage, slope, and foundation conditions with qualified specialists.", "Investigate wildfire and insurance considerations before removing contingencies.", "Confirm permits and feasibility for additions, decks, or major alterations."],
    agentReview: "The review weighs the view and location premium against access, physical condition, and future project constraints.",
    officialUrl: "https://www.lagunabeachcity.net/",
    officialLabel: "City of Laguna Beach",
  },
  irvine: {
    overview: "Irvine's planned communities differ by age, HOA services, amenities, special taxes, school boundaries, and housing type. Similar-looking homes can have different monthly obligations and association rules.",
    reviewPoints: ["Compare HOA dues, special taxes, insurance, and maintenance as one monthly figure.", "Verify assigned schools directly because boundaries and enrollment policies can change.", "Review association budgets, reserves, rules, parking, and improvement approvals."],
    agentReview: "The review compares communities by total ownership cost and rules before ranking finishes or amenities.",
    officialUrl: "https://www.cityofirvine.org/",
    officialLabel: "City of Irvine",
  },
  "san-francisco": {
    overview: "San Francisco property type and legal structure are central to value. Condominium, cooperative, tenancy-in-common, and single-family ownership can involve different financing, insurance, seismic, parking, and use considerations.",
    reviewPoints: ["Confirm ownership form, parking and storage rights, and building responsibilities.", "Review seismic, foundation, water intrusion, insurance, permits, and association records.", "Use neighborhood, property-type, view, condition, and parking-matched comparable sales."],
    agentReview: "The review starts with legal ownership and building condition before comparing design or neighborhood premium.",
    officialUrl: "https://www.sf.gov/",
    officialLabel: "City and County of San Francisco",
  },
  "san-jose": {
    overview: "San Jose spans established neighborhoods, planned communities, and different commute corridors. School boundaries, foundation and seismic condition, HOA obligations, lot utility, and travel time can influence demand within short distances.",
    reviewPoints: ["Test commute routes at realistic travel times rather than relying on distance alone.", "Verify school assignments and any HOA or special tax obligations.", "Review foundation, drainage, permits, systems, and renovation quality for older homes."],
    agentReview: "The review balances commute and neighborhood fit with physical condition and a tightly matched sale set.",
    officialUrl: "https://www.sanjoseca.gov/",
    officialLabel: "City of San Jose",
  },
}

export function getLocalMarketEditorial(city: string): LocalMarketEditorial | null {
  const slug = city.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return LOCAL_MARKET_EDITORIAL[slug] || null
}
