import { notFound, permanentRedirect } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import { slugToDisplay } from "@/lib/counties"
import { COUNTY_HERO_IMAGE_MAP } from "@/lib/location-images"
import { resolveCityHeroImage } from "@/lib/city-hero-images"
import { formatCityName } from "@/lib/seo/formatCityName"
import { CITY_DESCRIPTION_OVERRIDES, CITY_TITLE_OVERRIDES, CITY_HERO_ALT_OVERRIDES } from "@/lib/seo/cityOverrides"
import { getCityMetrics } from "@/lib/city-metrics"
import {
  canonicalCityBuyPath,
  resolveCanonicalCityLocation,
} from "@/lib/seo/location-canonical"

// Client Components
import AlertSignup from "@/components/city/AlertSignup"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { FAQAccordion } from "@/components/ui/faq-accordion"
import CityPropertyMapServer from "@/app/_components/city/CityPropertyMapServer"

// Server Components for Lazy Loading
import { 
  CitySchemaDataServer,
  CityHeroTextServer,
  CityHeroOverlayServer,
  CityStatsBarServer,
  CityEditorialServer,
  CityListingsServer,
  CityLifestyleServer
} from "@/app/_components/city/CityDataComponents"

// Skeletons
import {
  CityHeroTextSkeleton,
  CityHeroOverlaySkeleton,
  CityStatsBarSkeleton,
  CityEditorialSkeleton,
  CityListingsGridSkeleton,
  CityLifestyleSkeleton
} from "@/app/_components/city/CitySkeletons"

export const revalidate = 3600

function buildFaqs(cityName: string) {
  return [
    {
      question: `How much does it cost to buy a home in ${cityName}, CA?`,
      answer: `Prices vary by property type, condition, location, lot, and current inventory. Use the active CRMLS listings and market summary on this page for a current starting point, then compare recent nearby sales with an agent before setting a budget or preparing an offer.`
    },
    {
      question: `Is ${cityName} a good place to buy a home?`,
      answer: `That depends on your budget, preferred property type, monthly ownership costs, commute, insurance options, and long-term plans. Compare those priorities against current listings and property-specific disclosures rather than relying on a general ranking or an appreciation forecast.`
    },
    {
      question: `How can I compare neighborhoods in ${cityName}?`,
      answer: `Compare current inventory, property taxes, HOA terms, insurance availability, commute routes, access to services, and the features that matter to your household. Verify school assignments, transit schedules, boundaries, and public services with the responsible official sources, since they can change.`
    },
    {
      question: `How competitive is the ${cityName} real estate market?`,
      answer: `Competition changes with price range, property type, condition, and inventory. Review current days on market, price changes, comparable sales, and the listing agent's instructions before deciding how to structure an offer. A lender can help confirm financing readiness.`
    },
    {
      question: `What closing costs should I plan for in ${cityName}?`,
      answer: `Costs depend on the loan, escrow, title, insurance, taxes, inspections, negotiated credits, and any HOA requirements. Ask your lender and escrow or title professionals for transaction-specific written estimates before you remove contingencies or commit funds.`
    },
    {
      question: `What should first-time homebuyers know about ${cityName}?`,
      answer: `Start with a realistic monthly budget, a lender conversation, and a clear list of priorities. Review assistance-program eligibility directly with the program administrator or a qualified lender. Keep enough time for disclosures, inspections, insurance research, title review, and other due diligence appropriate to the property.`
    },
    {
      question: `How can I research schools serving ${cityName}?`,
      answer: `Use official district and California Department of Education sources to research attendance boundaries, enrollment rules, programs, and current public data. Confirm a property's assignment directly with the district before relying on it, because boundaries and policies can change.`
    },
    {
      question: `How can I evaluate a commute from ${cityName}?`,
      answer: `Test the exact route at the times you expect to travel and check current transit schedules, service alerts, parking, tolls, and alternatives. Commute conditions vary by address and time, so a citywide estimate is not a reliable substitute for route-specific research.`
    },
    {
      question: `Is buying a home in ${cityName} a good investment?`,
      answer: `No future return is guaranteed. Evaluate the purchase using current comparable sales, total monthly and one-time costs, maintenance, insurance, taxes, HOA obligations, expected holding period, and conservative scenarios. Consult qualified financial and tax professionals for advice outside the real estate transaction.`
    },
    {
      question: `What should I inspect before buying in ${cityName}?`,
      answer: `Use qualified inspectors to evaluate the systems and conditions relevant to the property. Review seller disclosures and discuss whether specialty inspections, insurance research, permit checks, HOA documents, or other due diligence are appropriate before applicable deadlines.`
    },
    {
      question: `When is the best time to buy a home in ${cityName}?`,
      answer: `The practical time to buy is when your finances, financing, housing needs, and due-diligence capacity are aligned. Inventory and borrowing costs change, so compare current conditions instead of relying on a fixed seasonal rule.`
    },
    {
      question: `Why should I work with a Crown Coastal Homes agent in ${cityName}?`,
      answer: `Crown Coastal Homes provides ${cityName} listing research, neighborhood context, and transaction guidance. California-licensed agent Reza Barghlameno (DRE #02211952) helps clients review current CRMLS data, comparable sales, disclosures, and next steps. Whether you're a first-time buyer or experienced investor, direct guidance can help you make a more informed decision.`
    }
  ]
}

async function resolveHeroImageUrl(citySlug: string, countySlug: string, countyName: string): Promise<{ imageUrl: string; attractionLabel: string }> {
  const cityImage = resolveCityHeroImage(citySlug)
  if (cityImage) return cityImage

  const countyHeroImage = COUNTY_HERO_IMAGE_MAP[countySlug]
  if (countyHeroImage) {
    return { imageUrl: countyHeroImage, attractionLabel: `${countyName} Landmark` }
  }

  return { imageUrl: "/luxury-modern-house-exterior.png", attractionLabel: `${countyName} Landmark` }
}

export async function generateMetadata({
  params,
  searchParams
}: {
  params: Promise<{ county: string; citySlug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const { county, citySlug } = await params
  const resolvedSearchParams = await searchParams
  const location = resolveCanonicalCityLocation(citySlug, county)
  if (!location) {
    return { title: "City Not Found | Crown Coastal Homes" }
  }
  const countyData = location.county
  const canonicalCitySlug = location.city.slug
  const formattedCity = formatCityName(canonicalCitySlug)
  const metrics = await getCityMetrics({ citySlug: canonicalCitySlug, countySlug: countyData.slug }, "buy")
  const countPrefix = metrics.available === false ? "" : `${metrics.activeListings} `
  const title = CITY_TITLE_OVERRIDES[canonicalCitySlug] || `${countPrefix}Homes for Sale in ${formattedCity}, CA | Crown Coastal`
  const fallbackDescription = `Browse ${countPrefix}homes for sale in ${formattedCity}, CA with local expertise from Crown Coastal.`
  const description = CITY_DESCRIPTION_OVERRIDES[canonicalCitySlug] || fallbackDescription
  const canonical = `https://crowncoastalhomes.com${canonicalCityBuyPath(location)}`

  const hasFilters = Object.keys(resolvedSearchParams).length > 0

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
    ...(hasFilters && { robots: { index: false, follow: true } })
  }
}

export default async function CityBuyPage({
  params,
  searchParams
}: {
  params: Promise<{ county: string; citySlug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { county, citySlug } = await params
  const location = resolveCanonicalCityLocation(citySlug, county)
  if (!location) notFound()

  const canonicalPath = canonicalCityBuyPath(location)
  if (county !== location.county.slug || citySlug !== location.city.slug) {
    permanentRedirect(canonicalPath)
  }

  const countyData = location.county
  const cityMeta = location.city

  const cityName = cityMeta.name
  const displayName = slugToDisplay(citySlug)
  const heroImage = await resolveHeroImageUrl(citySlug, countyData.slug, countyData.name)
  
  const faqItems = buildFaqs(cityName)
  
  const breadcrumbItems = [
    { name: "Home", item: "/" },
    { name: countyData.name, item: `/buy/${countyData.slug}` },
    { name: displayName, item: `/buy/${countyData.slug}/${citySlug}` }
  ]
  const breadcrumbNavItems = [
    { label: countyData.name, href: `/buy/${countyData.slug}` },
    { label: displayName, href: `/buy/${countyData.slug}/${citySlug}` }
  ]

  return (
    <div className="bg-[var(--bg)]">
      <Suspense fallback={null}>
        <CitySchemaDataServer
          citySlug={citySlug}
          countySlug={county}
          action="buy"
          faqItems={faqItems}
          breadcrumbItems={breadcrumbItems}
        />
      </Suspense>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-5 sm:py-8">
        <section className="rounded-2xl overflow-hidden border border-[var(--coastal-border)] bg-[var(--surface)]">
          <div className="px-4 sm:px-6 pt-4 sm:pt-5 text-sm text-[var(--coastal-muted-text)]">
            <Breadcrumbs items={breadcrumbNavItems} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] mt-4">
            <div className="px-4 sm:px-6 md:px-8 pb-6 md:pb-8">
              <Suspense fallback={<CityHeroTextSkeleton cityName={cityName} action="buy" />}>
                <CityHeroTextServer citySlug={citySlug} countySlug={county} countyName={countyData.name} action="buy" />
              </Suspense>
            </div>

            <div
              className="relative min-h-[300px] sm:min-h-[340px] md:min-h-[420px] overflow-hidden bg-[var(--surface-muted)]"
            >
              <Image
                src={heroImage.imageUrl}
                alt={CITY_HERO_ALT_OVERRIDES[citySlug] || heroImage.attractionLabel}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2.5 sm:px-3 py-1 rounded bg-[var(--coastal-primary)] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-sm z-10 max-w-[calc(100%-1.5rem)] truncate">
                California · {countyData.name}
              </div>
              <Suspense fallback={<CityHeroOverlaySkeleton displayName={displayName} />}>
                <CityHeroOverlayServer citySlug={citySlug} countySlug={county} displayName={displayName} action="buy" />
              </Suspense>
            </div>
          </div>

          <Suspense fallback={<CityStatsBarSkeleton />}>
            <CityStatsBarServer citySlug={citySlug} countySlug={county} action="buy" />
          </Suspense>
        </section>

        <Suspense fallback={<CityEditorialSkeleton displayName={displayName} />}>
          <CityEditorialServer citySlug={citySlug} displayName={displayName} />
        </Suspense>

        <Suspense fallback={<CityListingsGridSkeleton />}>
          <CityListingsServer 
            citySlug={citySlug} 
            countySlug={county} 
            searchParams={await searchParams} 
            action="buy" 
            displayName={displayName} 
          />
        </Suspense>

        <div className="mt-10 rounded-xl border border-[var(--coastal-border)] p-8 bg-[var(--surface)] text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-[var(--coastal-text)] mb-4">Don't miss new listings in {displayName}</h2>
          <AlertSignup city={cityName} county={countyData.name} action="buy" />
        </div>

        <Suspense fallback={<CityLifestyleSkeleton />}>
          <CityLifestyleServer citySlug={citySlug} />
        </Suspense>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[var(--coastal-border)] p-6 bg-[var(--surface)]">
            <h3 className="text-xl font-semibold text-[var(--coastal-text)] mb-3">What to Compare in {displayName}</h3>
            <ul className="list-disc pl-5 text-[var(--coastal-muted-text)] space-y-2">
              <li>Current listings, recent comparable sales, and total monthly cost</li>
              <li>Property condition, disclosures, insurance, taxes, and HOA terms</li>
              <li>Your address-specific commute, services, and location priorities</li>
              <li>Resale scenarios based on your expected holding period</li>
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--coastal-border)] p-6 bg-[var(--surface)]">
            <h3 className="text-xl font-semibold text-[var(--coastal-text)] mb-3">Types of Homes</h3>
            <ul className="list-disc pl-5 text-[var(--coastal-muted-text)] space-y-2">
              <li>Filter active CRMLS inventory by property type and features</li>
              <li>Compare single-family, condominium, and townhome ownership costs</li>
              <li>Review land, manufactured, and multifamily options when available</li>
              <li>Confirm new-construction terms directly with the builder</li>
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-[var(--coastal-text)] mb-4">Step-by-Step Home Buying Guide</h2>
          <FAQAccordion faqs={[
            { question: "Step 1: Set Your Budget", answer: `Discuss financing with a qualified lender and include taxes, insurance, HOA dues, maintenance, and closing funds in your budget before touring homes in ${cityName}.` },
            { question: "Step 2: Define Your Priorities", answer: `Separate property requirements from preferences, then verify address-specific needs such as commute routes, public services, school assignments, and insurance availability with authoritative sources.` },
            { question: "Step 3: Tour and Compare", answer: `Review enough homes to understand the available tradeoffs. Take consistent notes on condition, layout, location, disclosures, monthly cost, and questions that need professional follow-up.` },
            { question: "Step 4: Review an Offer Strategy", answer: `Use current comparable sales, the property's condition, listing history, your financing, and your risk tolerance to decide price and terms with your agent. Keep contractual protections aligned with your own due-diligence needs.` },
            { question: "Step 5: Complete Due Diligence", answer: `Track every contractual deadline. Use qualified professionals for inspections and review disclosures, title, insurance, permits, HOA records, and any property-specific concerns.` },
            { question: "Step 6: Finalize Financing", answer: `Coordinate appraisal, underwriting, insurance, funds, and final loan documents with your lender and escrow team. Review written costs and terms before signing.` },
            { question: "Step 7: Verify and Close", answer: `Complete the final verification, resolve outstanding questions, and follow escrow instructions for signing and funds. The closing timeline depends on the contract and transaction.` }
          ]} />
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-[var(--coastal-text)] mb-4">Explore {displayName} on the Map</h2>
          <Suspense fallback={<div className="h-96 w-full animate-pulse bg-[var(--surface-muted)] rounded-2xl" />}>
            <CityPropertyMapServer citySlug={citySlug} countySlug={county} action="buy" displayName={displayName} />
          </Suspense>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-[var(--coastal-text)] mb-4">Frequently Asked Questions</h2>
          <FAQAccordion faqs={faqItems} />
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-[var(--coastal-text)] mb-4">Nearby Cities</h2>
          <div className="flex flex-wrap gap-3">
            {countyData.cities
              .filter((c) => c.slug !== citySlug)
              .slice(0, 4)
              .map((city) => (
                <Link
                  key={city.slug}
                  href={`/buy/${countyData.slug}/${city.slug}`}
                  className="px-3 py-2 rounded-md border border-[var(--coastal-border)]"
                >
                  {city.displayName}
                </Link>
              ))}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-[var(--coastal-text)] mb-4">Quick Links</h2>
          <div className="flex flex-wrap gap-3">
            <Link href={`?type=Residential`} className="px-3 py-2 rounded-md border border-[var(--coastal-border)]">
              Homes in {cityName}
            </Link>
            <Link href={`?type=Condominium`} className="px-3 py-2 rounded-md border border-[var(--coastal-border)]">
              Condos in {cityName}
            </Link>
            <Link href={`?maxPrice=1000000`} className="px-3 py-2 rounded-md border border-[var(--coastal-border)]">
              Under $1M
            </Link>
            <Link href={`?keywords=pool`} className="px-3 py-2 rounded-md border border-[var(--coastal-border)]">
              Pool Homes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
