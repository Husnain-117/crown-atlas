import type { CityData } from "@/lib/city-data"

export interface ClusterConfig {
  id: string
  name: string
  description: string
  category: 'property-type' | 'price-range' | 'feature' | 'geographic' | 'intent'
  buildSearchParams: (cityName: string) => {
    city?: string
    state?: string
    propertyType?: string
    propertyCategory?: string
    minPrice?: number
    maxPrice?: number
    hasPool?: boolean
    isWaterfront?: boolean
    [key: string]: any
  }
  generateIntro: (cityData: CityData) => string
  generateFAQs: (cityData: CityData) => Array<{ question: string; answer: string }>
  generateBuyerTips: (cityData: CityData) => string
}

const clusterConfigs: Record<string, ClusterConfig> = {
  'houses-for-sale': {
    id: 'houses-for-sale',
    name: 'Homes for Sale',
    description: 'Single-family homes',
    category: 'property-type',
    buildSearchParams: (cityName) => ({
      city: cityName,
      propertyCategory: 'house',
    }),
    generateIntro: (cityData) => `Browse current single-family homes for sale in ${cityData.name}, California. Verify lot, parking, ownership, and property features in each listing and disclosure package.`,
    generateFAQs: (cityData) => [
      {
        question: `What types of houses are available in ${cityData.name}?`,
        answer: `Available property styles, sizes, conditions, and features change with current inventory. Review the active listings, use [neighborhoods] as a location-research starting point, and verify every material feature before making a decision.`
      },
      {
        question: `What should I know about buying a house in ${cityData.name}?`,
        answer: `Compare the full ownership cost, property condition, disclosures, insurance, taxes, assessments, permits, and HOA terms when applicable. Use qualified inspectors and transaction professionals for property-specific due diligence. [contact] for real estate guidance.`
      },
      {
        question: `How much do houses cost in ${cityData.name}?`,
        answer: `Prices vary by location, property type, condition, lot, and current supply. Use the active CRMLS results for current asking prices, compare recent nearby sales, and use the [affordability] tool only as an estimate. [contact] for a property-specific review.`
      }
    ],
    generateBuyerTips: (cityData) => `When comparing houses in ${cityData.name}, review lot and building condition, maintenance, insurance, parking, disclosures, taxes, and any HOA obligations. Verify commute routes, school assignments, and public services with authoritative sources.`
  },
  
  'condos-for-sale': {
    id: 'condos-for-sale',
    name: 'Condos for Sale',
    description: 'Condominiums and townhomes',
    category: 'property-type',
    buildSearchParams: (cityName) => ({
      city: cityName,
      propertyCategory: 'condo',
    }),
    generateIntro: (cityData) => `Explore current condominiums for sale in ${cityData.name}, California. Compare unit condition, monthly dues, association documents, insurance, parking, and use restrictions.`,
    generateFAQs: (cityData) => [
      {
        question: `What are the benefits of buying a condo in ${cityData.name}?`,
        answer: `A condominium can shift some exterior and common-area responsibilities to an association, but costs, services, amenities, and rules vary. Review the governing documents, budget, reserves, insurance, litigation, assessments, minutes, and use restrictions before buying.`
      },
      {
        question: `What HOA fees should I expect for condos in ${cityData.name}?`,
        answer: `HOA dues and what they cover are property-specific and can change. Review current statements, the approved budget, reserve study, insurance, pending assessments, and governing documents. [contact] for help organizing the real estate review, and use qualified legal or financial professionals when needed.`
      }
    ],
    generateBuyerTips: (cityData) => `When buying a condo in ${cityData.name}, carefully review HOA documents, fees, and rules. Check for rental restrictions, pet policies, and special assessments. Consider parking availability, storage options, and building amenities. Work with an agent experienced in condo transactions who can help you understand the HOA's financial health.`
  },
  
  'under-500k': {
    id: 'under-500k',
    name: 'Homes Under $500K',
    description: 'Listings priced below $500,000',
    category: 'price-range',
    buildSearchParams: (cityName) => ({
      city: cityName,
      maxPrice: 500000,
    }),
    generateIntro: (cityData) => `Browse current ${cityData.name} listings with asking prices below $500,000. Property type, availability, condition, and total ownership cost vary by listing.`,
    generateFAQs: (cityData) => [
      {
        question: `What types of homes are available under $500K in ${cityData.name}?`,
        answer: `The active results show which property types are currently available in this price range. Review ownership structure, condition, HOA obligations, financing eligibility, and property-specific costs rather than assuming a particular type will be available. [contact] for help reviewing a listing.`
      }
    ],
    generateBuyerTips: (cityData) => `Confirm financing and total monthly cost before touring in ${cityData.name}. Use comparable sales and property condition to assess each asking price, and preserve enough time for the due diligence appropriate to the property.`
  },
  
  'under-1m': {
    id: 'under-1m',
    name: 'Homes Under $1M',
    description: 'Homes under $1 million',
    category: 'price-range',
    buildSearchParams: (cityName) => ({
      city: cityName,
      maxPrice: 1000000,
    }),
    generateIntro: (cityData) => `Browse current homes for sale in ${cityData.name} with asking prices below $1 million. Results can include different property and ownership types depending on active inventory.`,
    generateFAQs: (cityData) => [
      {
        question: `What can I expect to find in homes under $1M in ${cityData.name}?`,
        answer: `Property type, size, condition, and location depend on current inventory. Review the live results and compare ownership costs, disclosures, and recent nearby sales. Use [neighborhoods] for neutral location research, not as a ranking.`
      }
    ],
    generateBuyerTips: (cityData) => `For ${cityData.name}, focus on the property requirements and monthly cost that fit your plan. Competition varies by listing, so review current days on market, comparable sales, condition, and seller instructions before choosing offer terms.`
  },
  
  'luxury-homes': {
    id: 'luxury-homes',
    name: 'Luxury Homes',
    description: 'Listings priced from $2 million',
    category: 'price-range',
    buildSearchParams: (cityName) => ({
      city: cityName,
      minPrice: 2000000,
    }),
    generateIntro: (cityData) => `Browse current ${cityData.name} listings with asking prices of $2 million and above. Verify finishes, amenities, condition, views, privacy, and other represented features for each property.`,
    generateFAQs: (cityData) => [
      {
        question: `What defines a luxury home in ${cityData.name}?`,
        answer: `This page uses a $2 million asking-price filter for browsing. Price alone does not establish quality or condition. Compare property-specific features, recent sales, disclosures, insurance, maintenance, and ownership costs.`
      }
    ],
    generateBuyerTips: (cityData) => `Luxury home buyers in ${cityData.name} should work with agents experienced in high-end transactions. Consider privacy, security, and lifestyle amenities. Review property history, any HOA restrictions, and work with specialists for appraisals and inspections.`
  },
  
  'pool': {
    id: 'pool',
    name: 'Homes with Pool',
    description: 'Properties with private pools',
    category: 'feature',
    buildSearchParams: (cityName) => ({
      city: cityName,
      hasPool: true,
    }),
    generateIntro: (cityData) => `Find current homes for sale in ${cityData.name} whose listing data identifies a pool. Confirm pool type, condition, permits, equipment, safety features, and maintenance needs during due diligence.`,
    generateFAQs: (cityData) => [
      {
        question: `What should I know about homes with pools in ${cityData.name}?`,
        answer: `Pool condition and ongoing cost vary by property. Use qualified inspection, verify permits and safety requirements, and obtain property-specific maintenance and insurance estimates. [contact] to review current pool listings.`
      }
    ],
    generateBuyerTips: (cityData) => `When comparing pool homes in ${cityData.name}, inspect the structure and equipment, verify permits and barriers, and obtain current maintenance, repair, utility, and insurance estimates.`
  },
  
  'oceanfront': {
    id: 'oceanfront',
    name: 'Oceanfront Properties',
    description: 'Beachfront and oceanfront homes',
    category: 'feature',
    buildSearchParams: (cityName) => ({
      city: cityName,
      isWaterfront: true,
    }),
    generateIntro: (cityData) => `Explore current listings in ${cityData.name} identified as waterfront in CRMLS. Confirm the property's actual waterfront relationship, access, views, boundaries, and restrictions before relying on the listing filter.`,
    generateFAQs: (cityData) => [
      {
        question: `What makes oceanfront properties unique in ${cityData.name}?`,
        answer: `Waterfront properties can have property-specific exposure, access, maintenance, insurance, permitting, and regulatory considerations. Review surveys, title, disclosures, official maps, inspections, and qualified professional guidance.`
      }
    ],
    generateBuyerTips: (cityData) => `For waterfront listings in ${cityData.name}, verify boundaries, access rights, coastal conditions, insurance availability, maintenance, permits, and applicable rules. Future value or rental performance is not guaranteed.`
  },
  
  'garage': {
    id: 'garage',
    name: 'Homes with Garage',
    description: 'Properties with garages',
    category: 'feature',
    buildSearchParams: (cityName) => ({
      city: cityName,
      keywords: 'garage',
    }),
    generateIntro: (cityData) => `Browse homes for sale in ${cityData.name} with attached or detached garages. Secure parking and storage space for vehicles, tools, and recreational equipment.`,
    generateFAQs: (cityData) => [
      {
        question: `Why is a garage important when buying a home in ${cityData.name}?`,
        answer: `A listing may describe attached, detached, assigned, or shared parking as a garage. Verify dimensions, access, ownership or exclusive-use rights, condition, electrical capacity, and any restrictions. Do not assume a garage can be converted; check permits and rules first.`
      }
    ],
    generateBuyerTips: (cityData) => `When evaluating a garage in ${cityData.name}, confirm the actual configuration, dimensions, parking access, storage, HOA rules, permits, and whether the listing's description matches the property.`
  },
  
  'new-construction': {
    id: 'new-construction',
    name: 'New Construction',
    description: 'Brand new homes and new builds',
    category: 'feature',
    buildSearchParams: (cityName) => ({
      city: cityName,
      keywords: 'new construction',
    }),
    generateIntro: (cityData) => `Discover new construction homes for sale in ${cityData.name}. Brand new properties with modern designs, latest features, energy efficiency, and builder warranties.`,
    generateFAQs: (cityData) => [
      {
        question: `What are the benefits of buying new construction in ${cityData.name}?`,
        answer: `Features, completion status, customization, warranties, and energy performance vary by project and contract. Verify what is included, completion milestones, taxes or assessments, HOA terms, builder disclosures, and independent inspection rights.`
      }
    ],
    generateBuyerTips: (cityData) => `When buying new construction in ${cityData.name}, review the builder, purchase agreement, included features, change orders, completion terms, warranties, HOA documents, assessments, surrounding plans, and inspection options.`
  },
  
  'townhomes-for-sale': {
    id: 'townhomes-for-sale',
    name: 'Townhomes for Sale',
    description: 'Multi-level townhomes',
    category: 'property-type',
    buildSearchParams: (cityName) => ({
      city: cityName,
      propertyCategory: 'townhouse',
    }),
    generateIntro: (cityData) => `Find townhomes for sale in ${cityData.name}, California. These multi-level properties offer the space of a house with the convenience of low-maintenance living and community amenities.`,
    generateFAQs: (cityData) => [
      {
        question: `What's the difference between townhomes and condos in ${cityData.name}?`,
        answer: `"Townhome" can describe a building style, while "condominium" describes a form of ownership. A property may be both. Verify the legal ownership, lot or unit boundaries, maintenance responsibilities, common areas, HOA obligations, insurance, and use restrictions in the title and association documents.`
      }
    ],
    generateBuyerTips: (cityData) => `For townhomes in ${cityData.name}, confirm the legal ownership form, HOA dues and documents, shared walls, exterior responsibility, parking, insurance, use restrictions, and any pending assessments.`
  },
  
  '1m-2m': {
    id: '1m-2m',
    name: 'Homes $1M - $2M',
    description: 'Listings priced from $1 million to $2 million',
    category: 'price-range',
    buildSearchParams: (cityName) => ({
      city: cityName,
      minPrice: 1000000,
      maxPrice: 2000000,
    }),
    generateIntro: (cityData) => `Browse current homes for sale in ${cityData.name} with asking prices from $1 million to $2 million. Compare property type, condition, location, features, and total ownership cost.`,
    generateFAQs: (cityData) => [
      {
        question: `What can I expect in the $1M-$2M price range in ${cityData.name}?`,
        answer: `The active CRMLS results show which property types and conditions are currently available in this price range. Verify represented finishes and amenities, compare recent nearby sales, and review all property-specific costs and disclosures.`
      }
    ],
    generateBuyerTips: (cityData) => `Evaluate each ${cityData.name} property on current comparable sales, condition, disclosures, insurance, taxes, HOA obligations, and financing. Competition varies by listing and cannot be inferred from price range alone.`
  }
}

export function getClusterConfig(clusterId: string): ClusterConfig | undefined {
  return clusterConfigs[clusterId]
}

export function getAllClusterConfigs(): ClusterConfig[] {
  return Object.values(clusterConfigs)
}

export function getClustersByCategory(category: ClusterConfig['category']): ClusterConfig[] {
  return Object.values(clusterConfigs).filter(c => c.category === category)
}

