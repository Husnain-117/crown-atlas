"use client"

import { useState, useEffect } from "react"
import Image from "@/components/property-image"
import Link from "next/link"
import { formatPriceWithCommas } from "@/lib/utils"
import { getSafeCityCardImageUrl } from "@/lib/city-card-image"
import { CITY_CARD_IMAGE_MAPPING } from "@/lib/location-images"
import dynamic from "next/dynamic"
const LazyCityMap = dynamic(() => import("@/components/lazy-city-map"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />
})
import DiscoverListings from "./DiscoverListings"
import { Home, Key, TrendingUp, Sun, Users, Waves, Landmark, Briefcase, Anchor, GraduationCap, LineChart, Building2, Heart, ChevronLeft, ChevronRight, DollarSign, Clock, Package, Building, Tag, Ruler } from "lucide-react"
import { CONTACT } from "@/lib/constants/contact"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { NeighborhoodContentCard } from "@/components/NeighborhoodContentCard"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { propertyPathFor } from "@/lib/property-url"
import LeadForm from "@/components/forms/LeadForm"

/* ─── constants ─── */
const AGENT = CONTACT.agent

/* ─── types ─── */
interface CityPageContentProps {
  cityData: any
  featuredProperties: any[]
  imageData: Array<{ image_url: string }>
  countyCityCards?: Array<{
    city: string
    slug: string
    buyCount: number
    rentCount: number
    medianPrice?: number
  }>
  /** Pagination for county city grid (discover city page when showing county cards). */
  cityGridPage?: number
  cityGridTotalPages?: number
  cityGridBasePath?: string
  lifestyleResearch?: {
    schools_education: string
    lifestyle_amenities: string
  }
  /** Hide the floating contact button on mobile */
  hideFloatingContactButton?: boolean
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function CityPageContent({
  cityData,
  featuredProperties,
  imageData,
  countyCityCards,
  cityGridPage = 1,
  cityGridTotalPages,
  cityGridBasePath,
  lifestyleResearch,
}: CityPageContentProps) {
  const countyCardModeSlug =
    cityData?.id === "orange"
      ? "orange"
      : cityData?.id === "santa-barbara"
        ? "santa-barbara"
        : cityData?.id === "napa"
          ? "napa"
          : cityData?.id === "los-angeles"
            ? "los-angeles"
            : cityData?.id === "san-jose"
              ? "santa-clara"
              : cityData?.id === "san-diego"
                ? "san-diego"
                : null
  const countyCardModeName =
    cityData?.id === "orange"
      ? "Orange County"
      : cityData?.id === "santa-barbara"
        ? "Santa Barbara County"
        : cityData?.id === "napa"
          ? "Napa County"
          : cityData?.id === "los-angeles"
            ? "Los Angeles County"
            : cityData?.id === "san-jose"
              ? "Santa Clara County"
              : cityData?.id === "san-diego"
                ? "San Diego County"
                : null
  const showCountyCityGrid = !!countyCardModeSlug && !!countyCardModeName && (countyCityCards?.length || 0) > 0

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div>
        {/* ═══════════════════  BREADCRUMBS  ═══════════════════ */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-4 md:mt-6">
          <Breadcrumbs
            items={[
              { label: "Buy", href: "/buy" },
              { label: cityData.name, href: `/discover/${cityData.name.toLowerCase().replace(/\s+/g, '-')}` }
            ]}
            className="text-sm"
          />
        </section>

        {/* ═══════════════════  HERO + INTRO (Section 1) ═══════════════════ */}
        <Hero
          cityData={cityData}
          heroImage={imageData[0]?.image_url || cityData.heroImage}
        />

        {/* ═══════════════════  TRUST BAR  ═══════════════════ */}
        <TrustBar />

        {showCountyCityGrid ? (
          <OrangeCountyCityGrid
            countySlug={countyCardModeSlug || "orange"}
            countyName={countyCardModeName || "County"}
            cityCards={countyCityCards || []}
            fallbackImage={imageData[0]?.image_url || cityData.heroImage || "/placeholder.svg"}
            cityPage={cityGridPage}
            cityTotalPages={cityGridTotalPages}
            cityBasePath={cityGridBasePath}
          />
        ) : (
          <>
            {/* ═══════════════════  LIVE LISTINGS (Section 2) ═══════════════════ */}
            <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-5 md:mt-7">
              <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl lg:text-3xl mb-4 md:mb-6">
                Featured Properties in {cityData.name}
              </h2>
              <p className="text-[var(--coastal-muted-text)] mb-6 text-base md:text-lg">
                Browse current listings in {cityData.name} from the MLS-synced listing feed.
              </p>
              <DiscoverListings cityName={cityData.name} citySlug={cityData.id} />
              <div className="mt-6 text-center space-y-3">
                <a
                  href={`/properties?city=${encodeURIComponent(cityData.name)}`}
                  className="inline-flex items-center px-6 py-3 bg-[var(--coastal-primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  View All {cityData.name} Listings
                </a>
                <div>
                  <a
                    href={`/properties?city=${encodeURIComponent(cityData.name)}&minPrice=750000&maxPrice=1000000&propertyType=Residential`}
                    className="inline-flex items-center px-6 py-3 bg-[var(--coastal-secondary)] text-[#083133] rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    Get Alerts Under $1M
                  </a>
                </div>
              </div>
            </section>

          </>
        )}

        {/* ═══════════════════  MARKET INSIGHTS (Section 4) ═══════════════════ */}
        {cityData.marketTrends && cityData.marketTrends.length > 0 && (
          <MarketSnapshot
            trends={cityData.marketTrends}
            cityName={cityData.name}
            lastUpdated={cityData.statsLastUpdated}
          />
        )}

        {/* ═══════════════════  SCHOOLS & EDUCATION (Section 5) ═══════════════════ */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-7 md:mt-10">
          <NeighborhoodContentCard
            title={`Schools & Education in ${cityData.name}`}
            content={lifestyleResearch?.schools_education}
            icon={
              <div className="p-3 bg-[var(--coastal-primary)] rounded-xl">
                <GraduationCap className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
            }
            className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-muted)] p-6 md:p-8 lg:p-10 rounded-2xl border border-[var(--coastal-border)] shadow-lg"
            fallback={`Use official district and state sources to verify attendance boundaries, enrollment requirements, and published school information for ${cityData.name}.`}
          />
        </section>

        {/* ═══════════════════  LIFESTYLE & AMENITIES (Section 6) ═══════════════════ */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-7 md:mt-10">
          <NeighborhoodContentCard
            title="Lifestyle & Amenities"
            content={lifestyleResearch?.lifestyle_amenities}
            icon={
              <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
                <Heart className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
            }
            className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-muted)] p-6 md:p-8 lg:p-10 rounded-2xl border border-[var(--coastal-border)] shadow-lg"
            fallback="Discover dining, parks, beaches, and everyday conveniences in this area."
          />
        </section>

        {/* ═══════════════════  INVESTMENT INSIGHTS (Section 7) ═══════════════════ */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-7 md:mt-10">
          <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-muted)] p-6 md:p-8 lg:p-10 rounded-2xl border border-[var(--coastal-border)] shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                <LineChart className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl lg:text-3xl">
                Investment Insights for {cityData.name}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--coastal-border)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[var(--coastal-text)]">Comparable Sales</h3>
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed mb-3">
                  Review recent {cityData.name} sales by property type, location, condition, and closing date.
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-600">CRMLS</span>
                  <span className="text-xs text-[var(--coastal-muted-text)]">market context</span>
                </div>
              </div>
              <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--coastal-border)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[var(--coastal-text)]">Rental Scenario</h3>
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed mb-3">
                  Model property-specific rent, vacancy, management, maintenance, insurance, taxes, and financing.
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-blue-600">Inputs</span>
                  <span className="text-xs text-[var(--coastal-muted-text)]">verify assumptions</span>
                </div>
              </div>
              <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--coastal-border)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[var(--coastal-text)]">Due Diligence</h3>
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed mb-3">
                  Review condition, title, insurance, zoning, HOA rules, permits, and applicable rental restrictions.
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-purple-600">Property</span>
                  <span className="text-xs text-[var(--coastal-muted-text)]">review required</span>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-[var(--coastal-muted-text)]">
                <strong className="text-[var(--coastal-text)]">Investment note:</strong> Estimates depend on verified property data and assumptions.
                Consult qualified financial, tax, legal, insurance, and property-management professionals as needed.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════  LIVING GUIDE ═══════════════════ */}
        <KeyFacts facts={cityData.facts} cityName={cityData.name} />

        {/* ═══════════════════  BUYER GUIDE (Section 6) ═══════════════════ */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-7 md:mt-10">
          <div className="bg-[var(--surface)] p-5 md:p-6 lg:p-8 rounded-2xl border border-[var(--coastal-border)]">
            <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl lg:text-3xl mb-4 md:mb-6">
              Buyer's Guide: How to Buy a Home in {cityData.name}
            </h2>
            <div className="prose prose-lg max-w-none text-[var(--coastal-muted-text)] mb-6">
              <p className="text-base md:text-lg leading-relaxed">
                Buying a home in {cityData.name} requires understanding the local market, financing options, and the home buying process.
                Our experienced real estate agents can guide you through every step, from finding the perfect property to closing the deal.
              </p>
              <ul className="mt-4 space-y-2">
                <li><strong>Get Pre-Approved:</strong> Understand your budget and financing options before you start looking.</li>
                <li><strong>Work with a Local Expert:</strong> Our agents know {cityData.name} neighborhoods and can help you find the right fit.</li>
                <li><strong>Schedule Property Tours:</strong> View homes in person to get a feel for the property and neighborhood.</li>
                <li><strong>Make an Informed Offer:</strong> We'll help you analyze comparable sales and market conditions.</li>
              </ul>
            </div>
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-[var(--coastal-primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Get Expert Buyer Guidance
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════  LOCAL EXPERT (Section 7) ═══════════════════ */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-7 md:mt-10">
          <AgentCard cityName={cityData.name} />
        </section>

        {/* ═══════════════════  MAP SECTION (kept)  ═══════════════════ */}
        {cityData.osmBoundingBox && (
          <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-7 md:mt-10 relative z-0">
            <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl lg:text-3xl mb-3 md:mb-4 text-center">
              Explore {cityData.name} Homes on the Map
            </h2>
            <LazyCityMap
              bounds={cityData.osmBoundingBox}
              properties={featuredProperties}
              cityName={cityData.name}
            />
          </section>
        )}

        {/* ═══════════════════  ADDRESS SECTION  ═══════════════════ */}
        <section id="contact-section" className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-7 md:mt-10">
          <div
            style={{
              background: "var(--coastal-primary)",
              borderRadius: 16,
              padding: "32px 24px",
            }}
            className="md:p-10 md:rounded-2xl"
          >
            <div
              style={{
                color: "#FCBA03",
                fontWeight: 700,
                fontSize: 20,
                marginBottom: 16,
              }}
              className="md:text-2xl md:mb-6"
            >
              Address
            </div>
            <p
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                marginBottom: 12,
              }}
              className="md:text-xl md:mb-4"
            >
              {CONTACT.business.name}
            </p>
            <div
              style={{
                color: "#fff",
                fontSize: 15,
                lineHeight: 1.8,
                marginBottom: 12,
              }}
              className="md:text-base md:mb-4"
            >
              <p style={{ margin: 0 }}>
                {CONTACT.business.fullAddress.street}
              </p>
              <p style={{ margin: 0 }}>
                {CONTACT.business.fullAddress.city}, {CONTACT.business.fullAddress.state} {CONTACT.business.fullAddress.zip}
              </p>
              <p style={{ margin: 0 }}>
                {CONTACT.business.fullAddress.country}
              </p>
              <p style={{ margin: 0, marginTop: 8 }}>
                {CONTACT.business.fullAddress.serviceArea}
              </p>
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(`${CONTACT.business.fullAddress.street}, ${CONTACT.business.fullAddress.city}, ${CONTACT.business.fullAddress.state} ${CONTACT.business.fullAddress.zip}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#4A90E2",
                textDecoration: "underline",
                fontSize: 15,
                display: "inline-block",
                marginTop: 8,
              }}
              className="md:text-base hover:opacity-80 transition-opacity"
            >
              View on Google Maps
            </a>
          </div>
        </section>

        {/* ═══════════════════  FULL FAQ (kept) ═══════════════════ */}
        {/* Filter out FAQs without answers to avoid empty FAQ blocks */}
        {/* IMPORTANT: Using native <details> elements to ensure all FAQ answers are in server-rendered HTML for SEO */}
        {cityData.faqs && cityData.faqs.filter((faq: any) => faq.question && faq.answer && faq.answer.trim().length > 0).length > 0 && (
          <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-7 md:mt-10">
            <div className="bg-[var(--surface)] p-5 md:p-6 lg:p-8 rounded-2xl border border-[var(--coastal-border)]">
              <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl lg:text-3xl mb-4 md:mb-6 text-center">
                Frequently Asked Questions About {cityData.name}
              </h2>
              <div className="space-y-2">
                {cityData.faqs
                  .filter((faq: any) => faq.question && faq.answer && faq.answer.trim().length > 0)
                  .map((faq: any, index: number) => {
                    // Process answer text with link replacements
                    const processedAnswer = faq.answer
                      .replace(/\[neighborhoods\]/g, `<a href="/neighborhoods?city=${encodeURIComponent(cityData.name)}" class="text-[var(--coastal-primary)] hover:underline">neighborhoods page</a>`)
                      .replace(/\[schools\]/g, `<a href="/contact" class="text-[var(--coastal-primary)] hover:underline">contact our agents</a>`)
                      .replace(/\[affordability\]/g, `<a href="/contact" class="text-[var(--coastal-primary)] hover:underline">affordability calculator</a>`)
                      .replace(/\[buying guide\]/g, `<a href="/buyers-guide" class="text-[var(--coastal-primary)] hover:underline">buying guide</a>`)
                      .replace(/\[financing\]/g, `<a href="/contact" class="text-[var(--coastal-primary)] hover:underline">financing options</a>`)

                    return (
                      <details
                        key={index}
                        className="group border-b border-[var(--coastal-border)] last:border-b-0"
                        open={true}
                      >
                        <summary className="cursor-pointer py-4 text-lg font-medium text-[var(--coastal-text)] hover:text-[var(--coastal-secondary)] transition-colors list-none flex items-center justify-between">
                          <span className="flex-1 pr-4">{faq.question}</span>
                          <svg
                            className="w-5 h-5 text-[var(--coastal-muted-text)] transition-transform duration-200 group-open:rotate-180 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="pb-4 pt-2 text-[var(--coastal-muted-text)] leading-relaxed prose prose-sm max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: processedAnswer }} />
                        </div>
                      </details>
                    )
                  })}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════  LIVING IN [CITY] CONTENT SECTION ═══════════════════ */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-7 md:mt-10">
          <div className="bg-[var(--surface)] p-5 md:p-6 lg:p-8 rounded-2xl border border-[var(--coastal-border)]">
            <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl lg:text-3xl mb-4 md:mb-6">
              Living in {cityData.name}, California
            </h2>
            <div className="prose prose-lg max-w-none text-[var(--coastal-text)]">
              {/* Neighborhood Comparisons */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[var(--coastal-primary)] mb-3">Neighborhood Overview</h3>
                <p className="text-[var(--coastal-muted-text)] leading-relaxed mb-4">
                  Current inventory in {cityData.name} can vary substantially by location and property type.
                  {cityData.neighborhoodCategories && cityData.neighborhoodCategories.length > 0 && (
                    <>
                      {" "}Use the guides for {cityData.neighborhoodCategories[0]?.neighborhoods?.[0]?.name || 'nearby communities'}
                      {" "}and {cityData.neighborhoodCategories[cityData.neighborhoodCategories.length - 1]?.neighborhoods?.[0]?.name || 'other local areas'}
                      {" "}as starting points for comparing active listings.
                    </>
                  )}
                  {" "}Verify address-specific services, boundaries, commute routes, insurance, and other priorities through the responsible sources.
                </p>
              </div>

              {/* Buyer Tips */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[var(--coastal-primary)] mb-3">Buyer Tips for {cityData.name}</h3>
                <p className="text-[var(--coastal-muted-text)] leading-relaxed mb-4">
                  Start with a complete monthly budget and current CRMLS inventory. Compare recent nearby sales, disclosures, property condition,
                  insurance availability, taxes, HOA obligations when applicable, and financing terms. Visit a location at the times relevant to
                  your routine and keep contractual protections aligned with the due diligence you need.
                </p>
              </div>

              {/* Commute Notes */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[var(--coastal-primary)] mb-3">Commute & Transportation</h3>
                <p className="text-[var(--coastal-muted-text)] leading-relaxed mb-4">
                  Transportation options and travel times depend on the exact address, destination, schedule, and current service conditions.
                  Test likely routes at relevant times and review official transit schedules, parking rules, tolls, bicycle access, and service alerts.
                  A citywide commute estimate should not replace address-specific research.
                </p>
              </div>

              {/* Schools Disclaimer */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[var(--coastal-primary)] mb-3">Schools & Education</h3>
                <p className="text-[var(--coastal-muted-text)] leading-relaxed mb-4">
                  School districts, attendance boundaries, enrollment rules, and programs can change.
                  Use official district and California Department of Education sources, and confirm a property's current assignment directly with
                  the district before relying on it. Crown Coastal Homes does not rank schools or recommend locations based on household composition.
                </p>
              </div>

              {/* Taxes & HOA Disclaimer */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[var(--coastal-primary)] mb-3">Property Taxes & HOA Fees</h3>
                <p className="text-[var(--coastal-muted-text)] leading-relaxed mb-4">
                  Taxes, assessments, transfer charges, and HOA obligations are specific to the property and transaction.
                  Review current written estimates and all available association documents before committing. Consult the county, escrow or title team,
                  HOA, lender, and qualified tax or legal professionals for authoritative guidance.
                </p>
              </div>

              {/* Local Insights */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[var(--coastal-primary)] mb-3">Local Insights & Lifestyle</h3>
                <p className="text-[var(--coastal-muted-text)] leading-relaxed mb-4">
                  {cityData.introText || `${cityData.name} combines the best of California living with its unique blend of coastal beauty, cultural attractions, and economic opportunity.`}
                  {" "}A licensed agent can help you interpret listing history, comparable sales, disclosures, and transaction steps while you independently
                  verify the location factors that matter to you.
                </p>

                {/* Local Fact Nuggets */}
                {cityData.facts && cityData.facts.length > 0 && (
                  <div className="mt-4 p-4 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)]">
                    <h3 className="font-semibold text-[var(--coastal-text)] mb-3 text-base">Quick Facts About {cityData.name}</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-[var(--coastal-muted-text)]">
                      {cityData.facts.slice(0, 5).map((fact: any, idx: number) => (
                        <li key={idx}>
                          <strong className="text-[var(--coastal-text)]">{fact.title}:</strong> {fact.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Cost of Living */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[var(--coastal-primary)] mb-3">Cost of Living in {cityData.name}</h3>
                <p className="text-[var(--coastal-muted-text)] leading-relaxed mb-4">
                  Compare more than the asking price. A realistic ownership budget can include financing, taxes, insurance, utilities, maintenance,
                  repairs, commuting, and HOA dues or assessments where applicable. Obtain property-specific written estimates before deciding what is affordable.
                  <Link href="/contact" className="text-[var(--coastal-primary)] hover:underline ml-1">
                    Contact our agents
                  </Link>{" "}
                  to discuss affordability calculators and financing options that can help you determine your home buying budget.
                </p>
              </div>

              {/* Property and location research */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[var(--coastal-primary)] mb-3">Property & Location Research</h3>
                <p className="text-[var(--coastal-muted-text)] leading-relaxed">
                  Review official planning, permit, hazard, flood, wildfire, and utility information for the specific address. Ask qualified inspectors
                  and insurance professionals about property-specific risks and coverage before applicable contingency deadlines.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════  TAXONOMY LINK BLOCKS (Homes.com-style) ═══════════════════ */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-7 md:mt-10">
          <div className="bg-[var(--surface)] p-5 md:p-6 lg:p-8 rounded-2xl border border-[var(--coastal-border)]">
            <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl lg:text-3xl mb-4 md:mb-6">
              Browse {cityData.name} Real Estate
            </h2>

            {/* Home Types (Max 16 links) */}
            <div className="mb-8">
              <h3 className="font-semibold text-[var(--coastal-text)] text-lg mb-4">Home Types</h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/discover/${cityData.id}/houses-for-sale`}
                  className="px-4 py-2 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-colors text-sm font-medium text-[var(--coastal-text)]"
                >
                  Homes for Sale
                </Link>
                <Link
                  href={`/discover/${cityData.id}/condos-for-sale`}
                  className="px-4 py-2 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-colors text-sm font-medium text-[var(--coastal-text)]"
                >
                  Condos for Sale
                </Link>
                <Link
                  href={`/discover/${cityData.id}/townhomes-for-sale`}
                  className="px-4 py-2 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-colors text-sm font-medium text-[var(--coastal-text)]"
                >
                  Townhomes for Sale
                </Link>
                <Link
                  href={`/properties?city=${encodeURIComponent(cityData.name)}&propertyType=Multi-Family`}
                  className="px-4 py-2 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-colors text-sm font-medium text-[var(--coastal-text)]"
                >
                  Multi-Family Homes
                </Link>
                <Link
                  href={`/buy/manufactured?city=${encodeURIComponent(cityData.name)}`}
                  className="px-4 py-2 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-colors text-sm font-medium text-[var(--coastal-text)]"
                >
                  Mobile Homes
                </Link>
                <Link
                  href={`/discover/${cityData.id}/new-construction`}
                  className="px-4 py-2 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-colors text-sm font-medium text-[var(--coastal-text)]"
                >
                  New Construction
                </Link>
              </div>
            </div>

            {/* Price Buckets (Max 16 links) */}
            <div className="mb-8">
              <h3 className="font-semibold text-[var(--coastal-text)] text-lg mb-4">Price Buckets</h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/discover/${cityData.id}/under-500k`}
                  className="px-4 py-2 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-colors text-sm font-medium text-[var(--coastal-text)]"
                >
                  Under $500K
                </Link>
                <Link
                  href={`/properties?city=${encodeURIComponent(cityData.name)}&minPrice=500000&maxPrice=750000&propertyType=Residential`}
                  className="px-4 py-2 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-colors text-sm font-medium text-[var(--coastal-text)]"
                >
                  $500K - $750K
                </Link>
                <Link
                  href={`/properties?city=${encodeURIComponent(cityData.name)}&minPrice=750000&maxPrice=1000000&propertyType=Residential`}
                  className="px-4 py-2 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-colors text-sm font-medium text-[var(--coastal-text)]"
                >
                  $750K - $1M
                </Link>
                <Link
                  href={`/discover/${cityData.id}/1m-2m`}
                  className="px-4 py-2 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-colors text-sm font-medium text-[var(--coastal-text)]"
                >
                  $1M - $2M
                </Link>
                <Link
                  href={`/discover/${cityData.id}/luxury-homes`}
                  className="px-4 py-2 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-colors text-sm font-medium text-[var(--coastal-text)]"
                >
                  From $2M
                </Link>
              </div>
            </div>

            {/* Feature Pages (Only ones we can populate well) */}
            <div className="mb-8">
              <h3 className="font-semibold text-[var(--coastal-text)] text-lg mb-4">Feature Pages</h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/discover/${cityData.id}/pool`}
                  className="px-4 py-2 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-colors text-sm font-medium text-[var(--coastal-text)]"
                >
                  Pool
                </Link>
                <Link
                  href={`/discover/${cityData.id}/garage`}
                  className="px-4 py-2 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-colors text-sm font-medium text-[var(--coastal-text)]"
                >
                  Garage
                </Link>
                <Link
                  href={`/discover/${cityData.id}/oceanfront`}
                  className="px-4 py-2 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-colors text-sm font-medium text-[var(--coastal-text)]"
                >
                  Ocean View
                </Link>
              </div>
            </div>

            {/* Neighborhoods / ZIPs (Top 8-16 + "View all") */}
            <div className="mb-8">
              <h3 className="font-semibold text-[var(--coastal-text)] text-lg mb-4">Neighborhoods</h3>
              <div className="flex flex-wrap gap-3">
                {(() => {
                  const allNeighborhoods = (cityData.neighborhoodCategories ?? []).flatMap((c: any) => c.neighborhoods ?? []) as Array<{ name: string; href?: string }>
                  return (
                    <>
                      {allNeighborhoods.slice(0, 16).map((neighborhood: any) => {
                        const neighborhoodSlug = neighborhood.name.toLowerCase().replace(/\s+/g, '-')
                        return (
                          <Link
                            key={neighborhood.name}
                            href={neighborhood.href || `/buy/${cityData.id}/${neighborhoodSlug}`}
                            className="px-4 py-2 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-colors text-sm font-medium text-[var(--coastal-text)]"
                          >
                            {neighborhood.name}
                          </Link>
                        )
                      })}
                      {allNeighborhoods.length > 16 && (
                        <Link
                          href={`/neighborhoods?city=${encodeURIComponent(cityData.name)}`}
                          className="px-4 py-2 bg-[var(--coastal-primary)] text-white rounded-lg border border-transparent hover:opacity-90 transition-opacity text-sm font-medium"
                        >
                          View All Neighborhoods
                        </Link>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>

            {/* Nearby Cities (Top 6-10) */}
            <div className="border-t border-[var(--coastal-border)] pt-6">
              <h3 className="font-semibold text-[var(--coastal-text)] text-lg mb-4">Other Cities and Counties in California</h3>
              <div className="flex flex-wrap gap-3">
                {getNearbyCities(cityData.id).slice(0, 10).map((city) => (
                  <Link
                    key={city.id}
                    href={`/discover/${city.id}`}
                    className="px-4 py-2 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-colors text-sm font-medium text-[var(--coastal-text)]"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="h-7 md:h-10" />
      </div>


    </div>
  )
}

function OrangeCountyCityGrid({
  countySlug,
  countyName,
  cityCards,
  fallbackImage,
  cityPage = 1,
  cityTotalPages,
  cityBasePath,
}: {
  countySlug: string
  countyName: string
  cityCards: Array<{
    city: string
    slug: string
    buyCount: number
    rentCount: number
    medianPrice?: number
  }>
  fallbackImage: string
  cityPage?: number
  cityTotalPages?: number
  cityBasePath?: string
}) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-16 md:mt-24">
      <h2 className="font-bold text-[var(--coastal-text)] text-2xl md:text-3xl lg:text-4xl mb-4 text-center">
        Explore {countyName} Cities
      </h2>
      <p className="text-[var(--coastal-muted-text)] mb-10 text-base md:text-lg text-center max-w-2xl mx-auto">
        Click a city to browse active homes for sale or rentals in {countyName}.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cityCards.map((city) => {
          const cityImage = CITY_CARD_IMAGE_MAPPING[city.slug] || fallbackImage
          const safeImageUrl = getSafeCityCardImageUrl(cityImage)
          return (
            <div
              key={city.slug}
              className="group county-city-card text-visible rounded-lg overflow-hidden border border-[var(--coastal-border)] hover-lift transition-all duration-500 shadow-sm hover:shadow-xl bg-[var(--surface)]"
              data-county-discovery-card="true"
              data-city-slug={city.slug}
            >
              <div className="relative h-44 w-full overflow-hidden bg-[var(--surface-muted)]">
                <Image
                  src={safeImageUrl}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                  quality={70}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center transform group-hover:scale-105 transition-transform duration-500 relative z-10">
                    <span className="text-white font-bold text-xl drop-shadow-md px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg border border-white/20">
                      {city.city}, CA
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-4 text-sm text-[var(--coastal-muted-text)] mb-4 pb-4 border-b border-[var(--coastal-border)]">
                  <div className="flex flex-col gap-1 items-center">
                    <Home className="w-4 h-4 text-[var(--coastal-primary)]" data-county-stat-icon="sale" />
                    <span className="font-semibold text-[var(--coastal-text)]" data-county-stat-value="sale">{city.buyCount.toLocaleString()}</span>
                    <span className="text-xs" data-county-stat-label="sale">Sale</span>
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <Key className="w-4 h-4 text-[var(--coastal-secondary)]" data-county-stat-icon="rent" />
                    <span className="font-semibold text-[var(--coastal-text)]" data-county-stat-value="rent">{city.rentCount.toLocaleString()}</span>
                    <span className="text-xs" data-county-stat-label="rent">Rent</span>
                  </div>
                  {city.medianPrice && (
                    <div className="flex flex-col gap-1 items-center">
                      <Tag className="w-4 h-4 text-emerald-500" data-county-stat-icon="median" />
                      <span className="font-semibold text-[var(--coastal-text)]" data-county-stat-value="median">${(city.medianPrice / 1000).toFixed(0)}k</span>
                      <span className="text-xs" data-county-stat-label="median">Median</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/buy/${countySlug}/${city.slug}`}
                    className="flex-1 text-center px-3 py-2.5 rounded-xl bg-[var(--coastal-primary)] text-white text-sm font-bold hover:shadow-md transition-shadow"
                    data-county-action-button="buy"
                  >
                    Buy
                  </Link>
                  <Link
                    href={`/rent/${countySlug}/${city.slug}`}
                    className="flex-1 text-center px-3 py-2.5 rounded-xl border-2 border-[var(--coastal-border)] text-[var(--coastal-text)] text-sm font-bold hover:bg-[var(--surface-muted)] transition-colors"
                    data-county-action-button="rent"
                  >
                    Rent
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {cityTotalPages != null && cityTotalPages > 1 && cityBasePath && (
        <Pagination className="mt-10">
          <PaginationContent className="flex flex-wrap justify-center gap-1">
            {cityPage > 1 && (
              <PaginationItem>
                <PaginationPrevious href={`${cityBasePath}?cityPage=${cityPage - 1}`} aria-label="Previous page" />
              </PaginationItem>
            )}
            {Array.from({ length: cityTotalPages }, (_, i) => i + 1).map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink href={`${cityBasePath}?cityPage=${pageNum}`} isActive={pageNum === cityPage} aria-current={pageNum === cityPage ? "page" : undefined}>
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}
            {cityPage < cityTotalPages && (
              <PaginationItem>
                <PaginationNext href={`${cityBasePath}?cityPage=${cityPage + 1}`} aria-label="Next page" />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </section>
  )
}

/* ─────────────────────── Hero ─────────────────────── */
function Hero({
  cityData,
  heroImage,
}: {
  cityData: any
  heroImage: string
}) {
  // Get city slug for hero image mapping
  const citySlug = `${cityData.name.toLowerCase().replace(/\s+/g, '-')}-ca`

  // Prioritize local county hero images if applicable
  const mappedCityImage = CITY_CARD_IMAGE_MAPPING[citySlug]
  const displayHero =
    cityData.id === "san-diego" ? "/County/San-Diego/hero-sandiego.jpg" :
      cityData.county === "orange-county" ? "/County/Orange/HuntingtonBeach.jpg" :
        cityData.county === "napa-county" ? "/County/Napa-Country/hero-card.jpg" :
          cityData.id === "los-angeles" ? "/County/Los-angelous/heroandcard.jpg" :
            mappedCityImage || heroImage;

  return (
    <section className="mt-4 md:mt-6">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="overflow-hidden grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] min-h-[300px] md:min-h-[400px] bg-[var(--surface)] border border-[var(--coastal-border)] rounded-2xl"
        >
          {/* Left: Image + copy — use <Image> for LCP (avoids 12s+ resource load delay from CSS background) */}
          <div className="relative p-6 md:p-8 lg:p-9 overflow-hidden">
            <Image
              src={displayHero}
              alt=""
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover object-center"
              style={{ zIndex: 0 }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, rgba(250,247,242,0.92) 0%, rgba(250,247,242,0.78) 45%, rgba(250,247,242,0.20) 100%)",
                zIndex: 1,
              }}
            />
            <div className="relative max-w-full lg:max-w-[620px] z-[2]">
              <h1 className="m-0 text-2xl sm:text-3xl md:text-4xl lg:text-[44px] leading-tight text-[var(--coastal-primary)] tracking-tight">
                {cityData.name} Homes{" "}
                <span className="font-normal italic">
                  for Sale
                </span>
              </h1>
              <p className="mt-2 md:mt-3 text-sm md:text-base text-gray-700 font-medium">
                Current CRMLS listings • Property-specific guidance • Local support
              </p>
              <ul className="mt-4 md:mt-5 pl-0">
                {[
                  "Search current listings by budget and property type",
                  "Request tours for homes you want to compare",
                  "Review property details with a licensed professional",
                ].map((t) => (
                  <li
                    key={t}
                    className="my-2 md:my-3 text-sm md:text-base text-gray-800 font-medium list-none"
                  >
                    <span className="text-[var(--coastal-secondary)] font-bold">
                      ✓{" "}
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Lead form */}
          <div id="dream-home-form" className="bg-[var(--surface)] border-t lg:border-t-0 lg:border-l border-[var(--coastal-border)] p-4 md:p-5 lg:p-6 grid content-center">
            <div className="bg-[var(--surface)] p-1 md:p-2">
              <div className="font-bold text-[var(--coastal-primary)] text-base md:text-lg mb-3 md:mb-4">
                Request Matching Listings
              </div>
              <LeadForm
                defaults={{
                  city: cityData.name,
                  state: "CA",
                  message: `I am interested in current listings in ${cityData.name}.`,
                  source: "city-discovery",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────── TrustBar ─────────────────────── */
function TrustBar() {
  // Only verified, provable trust assets - no placeholders
  // CRMLS: Verified MLS membership
  // EXP Realty: verified platform affiliation
  const verifiedLogos = [
    { src: "/crmls.webp", alt: "CRMLS - California Regional Multiple Listing Service", link: "https://www.crmls.org/" },
    { src: "/exp-realty-logo.webp", alt: "EXP Realty - Real Estate Platform", link: "https://www.exprealty.com/" },
  ]

  // Only show TrustBar if we have verified logos
  if (verifiedLogos.length === 0) {
    return null
  }

  return (
    <section style={{ marginTop: 14 }}>
      <div className="max-w-[1440px] mx-auto px-4">
        <div
          style={{
            background: "var(--surface-muted)",
            border: "1px solid var(--coastal-border)",
            borderRadius: 8,
            padding: "12px 16px",
            display: "flex",
            gap: 14,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div style={{ color: "var(--coastal-muted-text)", fontSize: 13 }}>
            Listing data and brokerage
          </div>
          <div
            style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}
          >
            {verifiedLogos.map((logo, index) => (
              <a
                key={index}
                href={logo.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={logo.alt}
              >
                <LogoImage src={logo.src} alt={logo.alt} />
              </a>
            ))}
            <Link
              href="/testimonials"
              style={{ color: "var(--coastal-primary)", fontSize: 13, fontWeight: 600 }}
            >
              Read client testimonials
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function LogoImage({ src, alt }: { src: string; alt: string }) {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
    setImgError(false);
  }, [src]);

  const handleError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc("/placeholder-logo.svg");
    }
  };

  return (
    <div
      style={{
        padding: "4px 8px",
        borderRadius: 8,
        border: "1px solid var(--coastal-border)",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 28,
        minWidth: 80,
      }}
    >
      <Image
        src={imgSrc}
        alt={alt}
        width={80}
        height={20}
        style={{
          objectFit: "contain",
          maxHeight: 20,
          width: "auto",
        }}
        onError={handleError}
      />
    </div>
  )
}

/* ─────────────────────── AgentCard ─────────────────────── */
export function AgentCard({ cityName }: { cityName?: string }) {
  const tourMsg = cityName
    ? `Hi ${AGENT.name}, I'd like to schedule a tour of homes in ${cityName}. Please let me know your availability.`
    : `Hi ${AGENT.name}, I'd like to schedule a property tour. Please let me know your availability.`
  const questionMsg = cityName
    ? `Hi ${AGENT.name}, I have a question about real estate in ${cityName}.`
    : `Hi ${AGENT.name}, I have a question about a property.`

  return (
    <aside
      aria-label="Agent contact"
      itemScope
      itemType="https://schema.org/Person"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--coastal-border)",
        borderRadius: 8,
        padding: "20px 16px 16px",
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* Profile picture extending outside the box */}
      <div
        style={{
          position: "absolute",
          top: -40,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 100,
            height: 100,
            borderRadius: "50%",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          <Image
            src={AGENT.avatarUrl}
            alt={AGENT.name}
            width={100}
            height={100}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>

      {/* Content with top padding to account for overlapping image */}
      <div style={{ marginTop: 50, textAlign: "center" }}>
        <div style={{ fontWeight: 800, color: "var(--coastal-primary)", fontSize: 16, marginBottom: 4 }} itemProp="name">
          {AGENT.name}
        </div>
        <div
          style={{ color: "var(--coastal-muted-text)", fontSize: 13, marginBottom: 2 }}
        >
          {AGENT.title}
        </div>
        <div
          style={{ color: "var(--coastal-muted-text)", fontSize: 12, marginBottom: 8 }}
        >
          CA DRE # {AGENT.dre}
        </div>

        {/* Service Areas & Experience */}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--coastal-border)" }}>
          <div style={{ fontSize: 11, color: "var(--coastal-muted-text)", marginBottom: 6 }}>
            <strong style={{ color: "var(--coastal-text)" }}>Service Areas:</strong> California
          </div>
          <div style={{ fontSize: 11, color: "var(--coastal-muted-text)", marginBottom: 6 }}>
            <strong style={{ color: "var(--coastal-text)" }}>Specialties:</strong> HOA Analysis, Comparable Sales, Buyer Representation
          </div>
          <Link
            href="/team/reza-barghlameno"
            style={{
              fontSize: 11,
              color: "var(--coastal-primary)",
              textDecoration: "underline",
              display: "inline-block",
              marginTop: 4,
            }}
          >
            View Full Profile →
          </Link>
        </div>
      </div>
      <div
        style={{ display: "flex", gap: 10, marginTop: 16 }}
      >
        <Link
          href={`/contact?message=${encodeURIComponent(tourMsg)}`}
          style={{
            minHeight: 44,
            borderRadius: 8,
            padding: "0 14px",
            fontWeight: 600,
            border: "1px solid transparent",
            cursor: "pointer",
            background: "var(--coastal-secondary)",
            color: "#083133",
            fontSize: 13,
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
          }}
        >
          Schedule Tour
        </Link>
        <Link
          href={`/contact?message=${encodeURIComponent(questionMsg)}`}
          style={{
            minHeight: 44,
            borderRadius: 8,
            padding: "0 14px",
            fontWeight: 600,
            border: "1px solid var(--coastal-border)",
            cursor: "pointer",
            background: "#fff",
            color: "var(--coastal-primary)",
            fontSize: 13,
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
          }}
        >
          Ask a Question
        </Link>
      </div>
    </aside>
  )
}

/* ─────────────────────── Featured Properties Row ─────────────────────── */
export function FeaturedPropertiesRow({ properties }: { properties: any[] }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const propertiesPerSlide = 5
  const maxProperties = 15
  const limitedProperties = properties.slice(0, maxProperties)
  const totalSlides = Math.ceil(limitedProperties.length / propertiesPerSlide)

  // Show skeleton cards if no properties (loading state)
  if (!properties || properties.length === 0) {
    return (
      <div aria-label="Featured properties">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-[var(--surface)] border border-[var(--coastal-border)] rounded-2xl overflow-hidden animate-pulse"
              aria-hidden="true"
            >
              <div className="h-48 bg-[var(--surface-muted)]" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-[var(--surface-muted)] rounded w-2/3" />
                <div className="h-4 bg-[var(--surface-muted)] rounded w-full" />
                <div className="h-4 bg-[var(--surface-muted)] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
        <span className="sr-only">Loading featured properties</span>
      </div>
    )
  }

  const startIndex = currentSlide * propertiesPerSlide
  const endIndex = startIndex + propertiesPerSlide
  const currentProperties = limitedProperties.slice(startIndex, endIndex)

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1))
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0))
  }

  return (
    <div aria-label="Featured properties" className="relative px-8 md:px-12">
      {/* Navigation Buttons */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={goToPrevious}
            aria-label="Previous properties"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-[var(--coastal-border)] rounded-full p-2 shadow-lg hover:bg-[var(--surface-muted)] transition-colors flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--coastal-text)]" />
          </button>
          <button
            onClick={goToNext}
            aria-label="Next properties"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-[var(--coastal-border)] rounded-full p-2 shadow-lg hover:bg-[var(--surface-muted)] transition-colors flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 text-[var(--coastal-text)]" />
          </button>
        </>
      )}

      {/* Properties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {currentProperties.map((p: any) => {
          const price =
            p.list_price || p.current_price
              ? formatPriceWithCommas(Math.round(p.list_price || p.current_price || 0))
              : "Price TBD"
          const beds = p.bedrooms || 0
          const baths = p.bathrooms || 0
          const sqft = p.living_area_sqft || p.lot_size_sqft || 0
          const img =
            p.images?.[0] || p.main_image_url || p.image || "/placeholder.svg"
          const address = p.address || p.city || "San Diego"
          const propertyId = p.listing_key || p.id
          const detailUrl = propertyPathFor(p)

          return (
            <article
              key={propertyId}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--coastal-border)",
                borderRadius: 16,
                overflow: "hidden",
                transition: "box-shadow 0.3s",
              }}
              className="hover:shadow-lg"
            >
              <Link href={detailUrl} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ position: "relative", height: 180 }}>
                  <Image
                    src={img}
                    alt={address}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div style={{ padding: 14, paddingBottom: 0 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      color: "var(--coastal-primary)",
                      fontSize: 18,
                    }}
                  >
                    {price}
                  </div>
                  {(beds > 0 || baths > 0) && (
                    <div
                      style={{
                        color: "var(--coastal-muted-text)",
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      {beds > 0 && `${beds} Beds`}
                      {beds > 0 && baths > 0 && " · "}
                      {baths > 0 && `${baths} Ba`}
                    </div>
                  )}
                  <div
                    style={{
                      color: "var(--coastal-muted-text)",
                      fontSize: 13,
                      marginTop: 2,
                    }}
                  >
                    {address}
                    {sqft ? ` · ${sqft.toLocaleString()} sqft` : ""}
                  </div>
                </div>
              </Link>
              <div style={{ padding: "10px 14px 14px" }}>
                <Link
                  href={`${detailUrl}#contact`}
                  style={{
                    display: "inline-block",
                    borderRadius: 9999,
                    background: "var(--surface-muted)",
                    border: "1px solid var(--coastal-border)",
                    padding: "8px 12px",
                    color: "var(--coastal-text)",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                  className="hover:bg-[var(--chip-active)]"
                >
                  Request a Tour ›
                </Link>
              </div>
            </article>
          )
        })}
      </div>

      {/* Slide Indicators */}
      {totalSlides > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                ? 'bg-[var(--coastal-primary)] w-8'
                : 'bg-[var(--coastal-border)] hover:bg-[var(--coastal-muted-text)]'
                }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────── Market Snapshot (Screenshot 2) ─────────────────────── */

/** Map metric name → Lucide icon */
function getMarketIcon(metric: string) {
  // Active Listings
  if (metric.includes("Active Listings"))
    return Building2

  // Median Sale Price
  if (metric.includes("Median") && metric.includes("Price"))
    return DollarSign

  // Price Per Square Foot
  if (metric.includes("Price Per Square Foot") || metric.includes("Price Per Sqft"))
    return Ruler

  // Average Days on Market
  if (metric.includes("Days on Market") || metric.includes("Days"))
    return Clock

  // New Listings
  if (metric.includes("New Listings"))
    return Clock

  // Months of Supply
  if (metric.includes("Months of Supply") || metric.includes("Supply"))
    return Package

  // Homes for Sale
  if (metric.includes("Homes for Sale") || (metric.includes("Homes") && !metric.includes("Under")))
    return Home

  // Condos for Sale
  if (metric.includes("Condos for Sale") || metric.includes("Condos"))
    return Building

  // Homes Under $1M
  if (metric.includes("Under $1M") || metric.includes("Under $"))
    return Tag

  // Properties with Pool
  if (metric.includes("Pool") || metric.includes("pool"))
    return Waves

  // Default fallback
  return TrendingUp
}

export function MarketSnapshot({
  trends,
  cityName,
  lastUpdated,
}: {
  trends: any[]
  cityName: string
  lastUpdated?: string | Date
}) {
  // Format relative time
  const formatRelativeTime = (date: string | Date) => {
    const now = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
    const diffInYears = Math.floor(diffInMonths / 12);
    return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
  };

  const relativeTime = lastUpdated ? formatRelativeTime(lastUpdated) : formatRelativeTime(new Date())

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-7 md:mt-10">
      <div className="bg-[var(--surface)] border border-[var(--coastal-border)] rounded-2xl p-6 md:p-8 lg:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 md:mb-6 gap-3">
          <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl lg:text-3xl">
            {cityName} Home Trends
          </h2>
          <div className="text-sm text-[var(--coastal-muted-text)]">
            <span>Updated {relativeTime}</span>
            <span className="mx-2">•</span>
            <span>Source: MLS/CRMLS</span>
          </div>
        </div>
        {/* Horizontal scrollable on mobile, grid on larger screens */}
        <div className="relative">
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0">
            {trends.slice(0, 12).map((trend: any) => {
              const Icon = getMarketIcon(trend.metric)
              return (
                <div
                  key={trend.metric}
                  className="flex-shrink-0 w-[280px] md:w-auto"
                  style={{
                    background: "var(--surface-muted)",
                    borderRadius: 12,
                    padding: "24px 16px",
                    textAlign: "center",
                    border: "1px solid var(--coastal-border)",
                  }}
                >
                  <Icon
                    style={{
                      width: 32,
                      height: 32,
                      margin: "0 auto 12px",
                      color: "var(--coastal-secondary)",
                      strokeWidth: 1.5,
                    }}
                  />
                  <p
                    style={{
                      fontWeight: 700,
                      color: "var(--coastal-text)",
                      fontSize: 24,
                      margin: 0,
                    }}
                  >
                    {trend.value}
                  </p>
                  <p
                    style={{
                      color: "var(--coastal-muted-text)",
                      fontSize: 13,
                      margin: "4px 0",
                    }}
                  >
                    {trend.metric}
                  </p>
                  {trend.change && (
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color:
                          trend.changeType === "positive"
                            ? "#16A34A"
                            : trend.changeType === "negative"
                              ? "#DC2626"
                              : "var(--coastal-muted-text)",
                        margin: 0,
                      }}
                    >
                      {trend.change}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

        </div>
        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: "1px solid var(--coastal-border)",
          }}
        >
          <p
            style={{
              color: "var(--coastal-muted-text)",
              fontSize: 12,
              textAlign: "center",
              margin: "0 0 12px",
            }}
          >
            <strong style={{ color: "var(--coastal-text)" }}>Data Source:</strong> California Regional MLS (CRMLS)
          </p>
          <p
            style={{
              color: "var(--coastal-muted-text)",
              fontSize: 12,
              textAlign: "center",
              margin: "0 0 12px",
            }}
          >
            <strong style={{ color: "var(--coastal-text)" }}>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <details
            style={{
              marginTop: 12,
              fontSize: 11,
              color: "var(--coastal-muted-text)",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                color: "var(--coastal-primary)",
                textDecoration: "underline",
                textAlign: "center",
              }}
            >
              Methodology & Disclaimers
            </summary>
            <div
              style={{
                marginTop: 12,
                padding: 12,
                background: "var(--surface-muted)",
                borderRadius: 8,
                textAlign: "left",
                fontSize: 11,
                lineHeight: 1.6,
              }}
            >
              <p style={{ margin: "0 0 8px" }}>
                <strong>Median Price:</strong> Calculated from active listings only. Excludes pending and sold properties.
              </p>
              <p style={{ margin: "0 0 8px" }}>
                <strong>Price Per Square Foot:</strong> Median of list_price / living_area_sqft for properties with valid square footage data.
              </p>
              <p style={{ margin: "0 0 8px" }}>
                <strong>Days on Market:</strong> Average time from listing date to current date for active listings.
              </p>
              <p style={{ margin: "0 0 8px" }}>
                <strong>Active Listings:</strong> Count of properties with standard_status = 'Active' as of data pull date.
              </p>
              <p style={{ margin: "8px 0 0", fontStyle: "italic" }}>
                All data is provided for informational purposes only. Market conditions change rapidly. Verify current availability and pricing with a licensed real estate professional. Data accuracy not guaranteed by broker or MLS.
              </p>
            </div>
          </details>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────── Key Facts (Screenshot 2) ─────────────────────── */

/** Map fact title → Lucide icon */
function getFactIcon(title: string) {
  if (title.includes("Sunny")) return Sun
  if (title.includes("Population")) return Users
  if (title.includes("Coastline")) return Waves
  if (title.includes("Famous")) return Landmark
  if (title.includes("Industries")) return Briefcase
  if (title.includes("Naval") || title.includes("Anchor")) return Anchor
  return Landmark
}

function KeyFacts({ facts, cityName }: { facts: any[]; cityName: string }) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-6 md:mt-8">
      <div className="bg-[var(--surface)] border border-[var(--coastal-border)] rounded-2xl p-6 md:p-8 lg:p-10">
        <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl lg:text-3xl text-center mb-5 md:mb-6">
          Key Facts About {cityName}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {facts.map((fact: any) => {
            const Icon = getFactIcon(fact.title)
            return (
              <div
                key={fact.title}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: 18,
                  background: "var(--surface-muted)",
                  borderRadius: 12,
                  border: "1px solid var(--coastal-border)",
                }}
              >
                <Icon
                  style={{
                    width: 28,
                    height: 28,
                    flexShrink: 0,
                    marginTop: 2,
                    color: "var(--coastal-secondary)",
                    strokeWidth: 1.5,
                  }}
                />
                <div>
                  <div
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      color: "var(--coastal-text)",
                      fontSize: 15,
                    }}
                  >
                    {fact.title}
                  </div>
                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "var(--coastal-muted-text)",
                      fontSize: 14,
                      lineHeight: 1.4,
                    }}
                  >
                    {fact.value}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/**
 * Get nearby cities for a given city ID
 * Returns top 6-10 nearby cities based on geographic proximity
 */
function getNearbyCities(cityId: string): Array<{ id: string; name: string }> {
  // Define nearby city relationships
  const nearbyMap: Record<string, string[]> = {
    'san-diego': ['los-angeles', 'irvine', 'pasadena', 'santa-monica', 'san-jose', 'san-francisco'],
    'los-angeles': ['san-diego', 'irvine', 'pasadena', 'santa-monica', 'san-jose', 'san-francisco'],
    'san-francisco': ['san-jose', 'los-angeles', 'san-diego', 'irvine', 'pasadena', 'santa-monica'],
    'san-jose': ['san-francisco', 'los-angeles', 'san-diego', 'irvine', 'pasadena', 'santa-monica'],
    'irvine': ['los-angeles', 'san-diego', 'pasadena', 'santa-monica', 'san-jose', 'san-francisco'],
    'pasadena': ['los-angeles', 'irvine', 'santa-monica', 'san-diego', 'san-jose', 'san-francisco'],
    'santa-monica': ['los-angeles', 'pasadena', 'irvine', 'san-diego', 'san-jose', 'san-francisco'],
  }

  const nearbyIds = nearbyMap[cityId] || ['los-angeles', 'san-diego', 'san-francisco', 'san-jose', 'irvine', 'pasadena']

  const cityNames: Record<string, string> = {
    'san-diego': 'San Diego',
    'los-angeles': 'Los Angeles',
    'san-francisco': 'San Francisco',
    'san-jose': 'San Jose',
    'irvine': 'Irvine',
    'pasadena': 'Pasadena',
    'santa-monica': 'Santa Monica',
  }

  return nearbyIds
    .slice(0, 10)
    .map(id => ({
      id,
      name: cityNames[id] || id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }))
}
