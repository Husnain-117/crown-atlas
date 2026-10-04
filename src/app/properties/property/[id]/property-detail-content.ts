import { canonicalCityBuyPathFor } from "@/lib/seo/location-canonical"
import type { PropertyDetailData } from "@/lib/db/property-detail-repo"
import { parsePropertyFaqs, type PropertyFaq } from "@/lib/property-faqs"
import { isActivePropertyStatus } from "@/lib/property-status"
import { formatPriceWithCommasAndDecimals } from "@/lib/utils"

export interface PropertyFact {
  label: string
  value: string
}

function featureValues(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .split(/[,;|]/)
    .map((item) => item.trim().replace(/([a-z])([A-Z])/g, "$1 $2"))
    .filter(Boolean)
}

function formatLotSize(value: number): string {
  if (value > 43_560) return `${(value / 43_560).toFixed(2)} acres`
  return `${Math.round(value).toLocaleString("en-US")} sq ft`
}

function formatDisplayValue(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function inactiveViewingAnswer(address: string): string {
  return `A tour cannot be booked through this historical listing page because the MLS does not currently report ${address} as Active. Contact our team and we can help confirm its status or find a similar active property.`
}

function contextualizePropertyFaqs(
  faqs: PropertyFaq[],
  property: PropertyDetailData,
  isActive: boolean,
): PropertyFaq[] {
  if (isActive) return faqs

  const address = property.address || "this property"
  return faqs.map((faq) => {
    if (!/\b(schedule|tour|viewing|visit)\b/i.test(faq.question)) return faq
    return { ...faq, answer: inactiveViewingAnswer(address) }
  })
}

function generateDefaultPropertyFaqs(property: PropertyDetailData, isActive: boolean) {
  const address = property.address || "this property"
  const city = property.city || "the area"
  const price = property.list_price
    ? formatPriceWithCommasAndDecimals(property.list_price)
    : "the asking price"
  const beds = property.bedrooms && property.bedrooms > 0
    ? `${property.bedrooms} bedroom${property.bedrooms > 1 ? "s" : ""}`
    : ""
  const baths = property.bathrooms && property.bathrooms > 0
    ? `${property.bathrooms} bathroom${property.bathrooms > 1 ? "s" : ""}`
    : ""
  const specs = [beds, baths].filter(Boolean).join(" and ")
  const propertySummary = specs ? `${specs} property` : "property"

  return [
    {
      question: `What is the asking price for ${address}?`,
      answer: isActive
        ? `The current asking price is ${price}. Pricing is subject to change and may vary based on market conditions, negotiations, and property updates. Contact our team to verify current pricing.`
        : `The last recorded list price was ${price}. This page is historical and the property is not currently reported as Active. Contact our team to verify its status and current market information.`,
    },
    {
      question: "Can I schedule a viewing of this property?",
      answer: isActive
        ? `Yes. Use the Book Visit action or contact form to request an in-person or virtual tour of ${address}. Our team will confirm availability and timing.`
        : inactiveViewingAnswer(address),
    },
    {
      question: `What are the key features of this ${propertySummary}?`,
      answer: `This ${propertySummary} offers ${property.living_area_sqft ? `approximately ${property.living_area_sqft.toLocaleString("en-US")} square feet of living space` : "the living space reported in the listing"}. ${property.year_built ? `It was built in ${property.year_built}. ` : ""}Review the listing details and disclosures, then independently verify material features before making a decision.`,
    },
    {
      question: "What is the property's location and neighborhood like?",
      answer: `The property is in ${city}, California. Review the map, visit at relevant times of day, and verify schools, commute routes, services, noise, hazards, and local rules for the exact address.`,
    },
    {
      question: "Is financing available for this property?",
      answer: `Financing depends on the buyer, lender, property type, condition, appraisal, insurance, and association documents. A qualified lender can confirm available programs and costs for this ${city} property.`,
    },
    {
      question: "What is the property's current status?",
      answer: `The MLS currently reports the property as ${property.standard_status || property.mls_status || "available"}.${property.days_on_market != null ? ` It has been listed for ${property.days_on_market} days.` : ""} Status can change, so verify availability before relying on it.`,
    },
  ]
}

export function derivePropertyDetailContent(property: PropertyDetailData) {
  const parsedFaqs = parsePropertyFaqs(property.faq_content)
  const isActive = isActivePropertyStatus(property.standard_status || property.mls_status)
  const baseFaqs = parsedFaqs.length > 0
    ? parsedFaqs
    : generateDefaultPropertyFaqs(property, isActive)
  const priceHistory = property.price_history ?? []
  const localCityPath = canonicalCityBuyPathFor(property.city, property.county)

  const schools = [
    property.school_district && { label: "School district", value: property.school_district },
    property.elementary_school && { label: "Elementary school", value: property.elementary_school },
    property.middle_school && { label: "Middle school", value: property.middle_school },
    property.high_school && { label: "High school", value: property.high_school },
  ].filter(Boolean) as PropertyFact[]

  const featureGroups = [
    { title: "Interior", values: featureValues(property.interior_features) },
    { title: "Appliances", values: featureValues(property.appliances) },
    { title: "Parking", values: featureValues(property.parking_features) },
    { title: "Pool", values: featureValues(property.pool_features) },
    { title: "Lot", values: featureValues(property.lot_features) },
    { title: "Exterior", values: featureValues(property.exterior_features) },
    { title: "Security", values: featureValues(property.security_features) },
  ].filter((group) => group.values.length > 0)

  const utilities = [
    property.heating && { label: "Heating", value: property.heating },
    property.cooling && { label: "Cooling", value: property.cooling },
    property.electric && { label: "Electric", value: property.electric },
    property.water && { label: "Water", value: property.water },
    property.sewer && { label: "Sewer", value: property.sewer },
  ].filter(Boolean) as PropertyFact[]

  const homeFacts = [
    (property.property_type || property.property_sub_type) && {
      label: "Property type",
      value: [property.property_type, property.property_sub_type]
        .filter(Boolean)
        .map((value) => formatDisplayValue(String(value)))
        .join(" - "),
    },
    property.year_built != null && property.year_built > 0 && { label: "Year built", value: String(property.year_built) },
    property.living_area_sqft != null && property.living_area_sqft > 0 && {
      label: "Living area",
      value: `${Math.round(property.living_area_sqft).toLocaleString("en-US")} sq ft`,
    },
    property.lot_size_sqft != null && property.lot_size_sqft > 0 && { label: "Lot size", value: formatLotSize(property.lot_size_sqft) },
    Number(property.parking_total) > 0 && { label: "Parking", value: `${property.parking_total} spaces` },
    Number(property.garage_size) > 0 && { label: "Garage", value: `${property.garage_size} spaces` },
    Number(property.carport_spaces) > 0 && { label: "Carport", value: `${property.carport_spaces} spaces` },
    Number(property.stories_total) > 0 && { label: "Stories", value: String(property.stories_total) },
    property.days_on_market != null && property.days_on_market >= 0 && { label: "Days on market", value: String(property.days_on_market) },
    property.cumulative_days_on_market != null &&
      property.cumulative_days_on_market !== property.days_on_market && {
        label: "Cumulative days on market",
        value: String(property.cumulative_days_on_market),
      },
    property.bathrooms_full != null && property.bathrooms_full > 0 && {
      label: "Full bathrooms",
      value: String(property.bathrooms_full),
    },
    property.bathrooms_half != null && property.bathrooms_half > 0 && {
      label: "Half bathrooms",
      value: String(property.bathrooms_half),
    },
    (property.mls_status || property.standard_status) && {
      label: "MLS status",
      value: property.mls_status || property.standard_status,
    },
    property.architectural_style && { label: "Architectural style", value: property.architectural_style },
    property.zoning && { label: "Zoning", value: property.zoning },
  ].filter(Boolean) as PropertyFact[]

  const communityFacts = [
    property.subdivision_name && { label: "Subdivision", value: property.subdivision_name },
    property.association_name && { label: "Association", value: property.association_name },
    property.hoa_fee != null && property.hoa_fee > 0 && {
      label: "HOA fee",
      value: `${formatPriceWithCommasAndDecimals(property.hoa_fee)}${property.hoa_fee_frequency ? ` ${property.hoa_fee_frequency.toLowerCase()}` : ""}`,
    },
    property.new_construction_yn && { label: "New construction", value: "Yes" },
    property.senior_community_yn && { label: "Senior community", value: "Yes" },
    property.fireplace_yn && {
      label: "Fireplace",
      value: property.fireplaces_total && property.fireplaces_total > 0
        ? `${property.fireplaces_total}`
        : "Yes",
    },
    property.pool_private_yn && { label: "Private pool", value: "Yes" },
    property.waterfront_yn && { label: "Waterfront", value: "Yes" },
    (property.view || property.view_yn) && { label: "View", value: property.view || "Yes" },
    property.tax_annual_amount != null && property.tax_annual_amount > 0 && {
      label: property.tax_year ? `Property tax (${property.tax_year})` : "Annual property tax",
      value: formatPriceWithCommasAndDecimals(property.tax_annual_amount),
    },
  ].filter(Boolean) as PropertyFact[]

  return {
    faqs: contextualizePropertyFaqs(baseFaqs, property, isActive),
    featureGroups,
    homeFacts,
    communityFacts,
    schools,
    utilities,
    localCityPath,
    priceHistory,
    hasPriceHistory: priceHistory.length >= 2 || Boolean(
      property.previous_list_price != null &&
      property.price_change_timestamp &&
      property.previous_list_price > property.list_price
    ),
    isNewListing: property.days_on_market != null && property.days_on_market >= 0 && property.days_on_market <= 21,
  }
}
