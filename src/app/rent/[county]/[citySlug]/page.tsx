import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import { getCounty, getCityBySlug, slugToCityName, slugToDisplay } from "@/lib/counties"
import { COUNTY_HERO_IMAGE_MAP } from "@/lib/location-images"
import { resolveCityHeroImage } from "@/lib/city-hero-images"
import { formatCityName } from "@/lib/seo/formatCityName"
import { getCityMetrics } from "@/lib/city-metrics"

// Client Components
import AlertSignup from "@/components/city/AlertSignup"
import RentEstimatorWidget from "@/components/widgets/RentEstimatorWidget"
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
  CityRentStatsBarSkeleton,
  CityEditorialSkeleton,
  CityListingsGridSkeleton,
  CityLifestyleSkeleton
} from "@/app/_components/city/CitySkeletons"

export const revalidate = 3600
async function resolveHeroImageUrl(citySlug: string, countySlug: string, countyName: string): Promise<{ imageUrl: string; attractionLabel: string }> {
  const cityImage = resolveCityHeroImage(citySlug)
  if (cityImage) return cityImage

  const countyHeroImage = COUNTY_HERO_IMAGE_MAP[countySlug]
  if (countyHeroImage) {
    return { imageUrl: countyHeroImage, attractionLabel: `${countyName} Landmark` }
  }

  // Final fallback to a generic image
  return { imageUrl: "/luxury-modern-house-exterior.png", attractionLabel: `${countyName} Landmark` }
}

function buildFaqs(cityName: string) {
  return [
    {
      question: `How much does it cost to rent in ${cityName}, CA?`,
      answer: `Rent varies by property type, size, condition, location, amenities, and current availability. Use the active CRMLS listings and filters on this page to compare current asking rents, then confirm every charge and lease term with the housing provider before applying.`
    },
    {
      question: `How can I compare rental locations in ${cityName}?`,
      answer: `Compare the total monthly cost, commute, parking, property condition, lease terms, utilities, pet rules, and access to the services you use. Verify transit, school assignments, public services, and address-specific requirements with official sources rather than relying on a general neighborhood label.`
    },
    {
      question: `Are there pet-friendly rentals in ${cityName}?`,
      answer: `Pet policies vary by property and housing provider. Confirm permitted animals, restrictions, deposits or fees, documentation, and insurance requirements in writing before applying. Listing remarks are a useful starting point but may not contain the complete policy.`
    },
    {
      question: `How do I find a short-term rental in ${cityName}?`,
      answer: `Filter current listings by furnished status and available dates, then ask about the exact lease duration. Short-term occupancy rules can vary by city, building, and property, so verify any applicable requirements with the local authority and housing provider.`
    },
    {
      question: `What are typical lease terms for rentals in ${cityName}?`,
      answer: `Lease duration, renewal, deposits, fees, utilities, parking, pets, maintenance, and termination terms vary. Read the complete proposed agreement, ask for unclear terms in writing, and consult a qualified housing professional or attorney when you need legal guidance.`
    },
    {
      question: `What utilities are included in ${cityName} rentals?`,
      answer: `Utility responsibility is property-specific. Ask for a written list covering electricity, gas, water, sewer, trash, internet, landscaping, and any shared utility allocation. When possible, request prior usage information to build a realistic monthly budget.`
    },
    {
      question: `What application criteria apply to rentals in ${cityName}?`,
      answer: `Screening criteria differ by housing provider and property. Request the written criteria, required documents, application process, fees, and refund policy before submitting personal information or payment. Do not assume a citywide credit or income threshold.`
    },
    {
      question: `What should first-time renters know about ${cityName}?`,
      answer: `Budget for all move-in and recurring costs, verify the person offering the property, tour when possible, review the lease, and document property condition. For current tenant-rights information, use official California and local housing resources or seek qualified legal advice.`
    },
    {
      question: `Is parking included with rentals in ${cityName}?`,
      answer: `Parking is property-specific. Confirm the number and location of spaces, access rules, permits, guest parking, vehicle restrictions, storage, charging access, and any separate fee in the lease or a signed addendum.`
    },
    {
      question: `How much is a security deposit for rentals in ${cityName}?`,
      answer: `The requested deposit and applicable legal limits depend on the tenancy and current law. Review the written terms and confirm current rules through official California resources. Keep receipts and a dated move-in condition record.`
    },
    {
      question: `Can I break my lease early in ${cityName}?`,
      answer: `Early-termination rights and costs depend on the agreement, facts, and current law. Review the lease and communicate in writing. A licensed real estate agent cannot replace legal advice, so contact a qualified tenant-resource organization or attorney for a legal assessment.`
    },
    {
      question: `Why should I work with a Crown Coastal agent to find a rental in ${cityName}?`,
      answer: `Crown Coastal Homes can help you review current CRMLS rentals, coordinate tours, clarify listing information, and communicate with listing representatives. Confirm representation, compensation, and the scope of service in writing for your specific search.`
    }
  ]
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
  const countyData = getCounty(county)
  const cityName = slugToCityName(citySlug)
  const formattedCity = formatCityName(citySlug)
  if (!countyData || !cityName) {
    return { title: "City Not Found | Crown Coastal Homes" }
  }
  const metrics = await getCityMetrics({ citySlug: citySlug, countySlug: countyData.slug }, "rent")
  const countPrefix = metrics.available === false ? "" : `${metrics.activeListings} `
  const title = `${countPrefix}Rentals in ${formattedCity}, CA | Crown Coastal`
  const fallbackDescription = `Browse ${countPrefix}rentals in ${formattedCity}, CA with local expertise from Crown Coastal.`
  const description = fallbackDescription
  const canonical = `https://crowncoastalhomes.com/rent/${countyData.slug}/${citySlug}`

  const hasFilters = Object.keys(resolvedSearchParams).length > 0

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
    ...(hasFilters && { robots: { index: false, follow: true } })
  }
}

export default async function CityRentPage({
  params,
  searchParams
}: {
  params: Promise<{ county: string; citySlug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { county, citySlug } = await params
  const countyData = getCounty(county)
  const cityMeta = getCityBySlug(citySlug)
  if (!countyData || !cityMeta) notFound()

  const cityName = slugToCityName(citySlug)
  const displayName = slugToDisplay(citySlug)
  const heroImage = await resolveHeroImageUrl(citySlug, countyData.slug, countyData.name)
  
  const faqItems = buildFaqs(cityName)
  
  const breadcrumbItems = [
    { name: "Home", item: "/" },
    { name: countyData.name, item: `/rent/${countyData.slug}` },
    { name: "Rent", item: "/rent" },
    { name: displayName, item: `/rent/${countyData.slug}/${citySlug}` }
  ]
  const breadcrumbNavItems = [
    { label: countyData.name, href: `/rent/${countyData.slug}` },
    { label: "Rent", href: "/rent" },
    { label: displayName, href: `/rent/${countyData.slug}/${citySlug}` }
  ]

  return (
    <div className="bg-[var(--bg)]">
      <Suspense fallback={null}>
        <CitySchemaDataServer
          citySlug={citySlug}
          countySlug={county}
          action="rent"
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
              <Suspense fallback={<CityHeroTextSkeleton cityName={cityName} action="rent" />}>
                <CityHeroTextServer citySlug={citySlug} countySlug={county} countyName={countyData.name} action="rent" />
              </Suspense>
            </div>

            <div
              className="relative min-h-[300px] sm:min-h-[340px] md:min-h-[420px] overflow-hidden bg-[var(--surface-muted)]"
            >
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.attractionLabel}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2.5 sm:px-3 py-1 rounded bg-[var(--coastal-secondary)] text-[#083133] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-sm z-10 max-w-[calc(100%-1.5rem)] truncate">
                Rentals · {countyData.name}
              </div>
              <Suspense fallback={<CityHeroOverlaySkeleton displayName={displayName} />}>
                <CityHeroOverlayServer citySlug={citySlug} countySlug={county} displayName={displayName} action="rent" />
              </Suspense>
            </div>
          </div>

          <Suspense fallback={<CityRentStatsBarSkeleton />}>
            <CityStatsBarServer citySlug={citySlug} countySlug={county} action="rent" />
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
            action="rent" 
            displayName={displayName} 
          />
        </Suspense>

        <div className="mt-10 rounded-xl border border-[var(--coastal-border)] p-8 bg-[var(--surface)] text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-[var(--coastal-text)] mb-4">Get rental alerts for {displayName}</h2>
          <AlertSignup city={cityName} county={countyData.name} action="rent" />
        </div>

        <Suspense fallback={<CityLifestyleSkeleton />}>
          <CityLifestyleServer citySlug={citySlug} />
        </Suspense>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[var(--coastal-border)] p-6 bg-[var(--surface)]">
            <h3 className="text-xl font-semibold text-[var(--coastal-text)] mb-3">What to Compare in {displayName}</h3>
            <ul className="list-disc pl-5 text-[var(--coastal-muted-text)] space-y-2">
              <li>Total monthly cost, deposit, fees, utilities, and parking</li>
              <li>Lease length, renewal, termination, pets, and maintenance terms</li>
              <li>Address-specific commute, services, and property condition</li>
              <li>Written screening criteria and application process</li>
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--coastal-border)] p-6 bg-[var(--surface)]">
            <h3 className="text-xl font-semibold text-[var(--coastal-text)] mb-3">Types of Rentals</h3>
            <ul className="list-disc pl-5 text-[var(--coastal-muted-text)] space-y-2">
              <li>Filter current CRMLS inventory by property type and features</li>
              <li>Compare apartments, condominiums, and single-family homes</li>
              <li>Review furnished and shorter-term options when available</li>
              <li>Confirm every amenity and occupancy date before applying</li>
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <RentEstimatorWidget cityName={cityName} />
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-[var(--coastal-text)] mb-4">Step-by-Step Renting Guide</h2>
          <FAQAccordion faqs={[
            { question: "Step 1: Determine Your Budget", answer: `Set a monthly limit that includes rent, required insurance, utilities, parking, transportation, and other recurring charges. Keep move-in funds and an emergency reserve separate.` },
            { question: "Step 2: Research Locations", answer: `Compare current inventory and visit locations when possible. Verify commute routes, transit, public services, school assignments, and other address-specific needs through authoritative sources.` },
            { question: "Step 3: Tour Properties", answer: `Schedule tours for your top picks and visit in person when possible. Check water pressure, outlets, closet space, natural light, and cell signal. Ask about maintenance response times, noise levels, and any planned renovations. Take photos and notes to compare later. Your Crown Coastal agent can schedule multiple tours efficiently.` },
            { question: "Step 4: Submit Your Application", answer: `Request the written screening criteria and application instructions first. Verify the recipient before sharing sensitive documents or paying a fee, and keep copies of everything submitted.` },
            { question: "Step 5: Review the Lease Carefully", answer: `Read the complete agreement and every addendum. Confirm dates, charges, utilities, parking, pets, maintenance, renewal, and termination terms in writing. Seek legal help when a term is unclear or consequential.` },
            { question: "Step 6: Prepare for Move-In", answer: `Coordinate utilities, required insurance, access, and moving logistics. Complete a dated condition checklist with photos and retain copies with your lease and payment records.` },
            { question: "Step 7: Keep Good Records", answer: `Keep the signed agreement, receipts, inspection records, and written communications together. Use official California and local resources for current tenant-rights information.` }
          ]} />
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-[var(--coastal-text)] mb-4">Explore {displayName} on the Map</h2>
          <Suspense fallback={<div className="h-96 w-full animate-pulse bg-[var(--surface-muted)] rounded-2xl" />}>
            <CityPropertyMapServer citySlug={citySlug} countySlug={county} action="rent" displayName={displayName} />
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
                  href={`/rent/${countyData.slug}/${city.slug}`}
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
            <Link href={`?maxPrice=3000`} className="px-3 py-2 rounded-md border border-[var(--coastal-border)]">
              Under $3,000
            </Link>
            <Link href={`?beds=2`} className="px-3 py-2 rounded-md border border-[var(--coastal-border)]">
              2 Bedroom Rentals
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
