/**
 * /neighborhoods/[city]/[neighborhood] — Individual Neighborhood Page
 *
 * Single reusable template powering ALL 105 neighborhood pages.
 * Statically generated at build time via generateStaticParams.
 *
 * SEO:
 *  - Dynamic <title> and <meta description> per neighborhood
 *  - Open Graph image using neighborhood photo
 *  - JSON-LD Place schema + BreadcrumbList
 *  - Canonical URL
 *
 * Data source: src/lib/city-data.ts (citiesData)
 */

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { citiesData } from "@/lib/city-data"
import {
  getNeighborhoodData,
  getRelatedNeighborhoods,
} from "@/lib/neighborhood-utils"
import { searchProperties } from "@/lib/db/property-repo"
import { NeighborhoodCard } from "@/components/neighborhoods/NeighborhoodCard"
import PropertyCard from "@/components/property-card-client"
import BreadcrumbNav from "@/components/seo/BreadcrumbNav"
import LeadForm from "@/components/forms/LeadForm"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import {
  MapPin,
  Home,
  ArrowRight,
  Building2,
  Phone,
  Waves,
  TreePine,
  Utensils,
  GraduationCap,
  TrendingUp,
  Users,
  Heart,
  LineChart,
  CloudSun,
  Train,
  Briefcase,
} from "lucide-react"
import { isPriorityCitySlug } from "@/lib/seo/priority-locations"

// ─── ISR: refresh every hour so property counts stay fresh ─────────────────
export const revalidate = 3600
export const dynamicParams = true

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageParams {
  city: string
  neighborhood: string
}

// ─── Static Generation ────────────────────────────────────────────────────────

/**
 * Pre-generates paths for all 105 neighborhoods at build time (SSG).
 * No runtime database calls needed — data comes from city-data.ts.
 */
export async function generateStaticParams(): Promise<PageParams[]> {
  const params: PageParams[] = []

  for (const [cityId, city] of Object.entries(citiesData)) {
    if (!isPriorityCitySlug(cityId)) continue
    for (const category of city.neighborhoodCategories) {
      for (const hood of category.neighborhoods) {
        const slug = hood.href.split("/").pop()
        if (slug) {
          params.push({ city: cityId, neighborhood: slug })
        }
      }
    }
  }

  return params
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { city, neighborhood } = await params
  const data = getNeighborhoodData(city, neighborhood)
  if (!data) return {}

  const { neighborhood: hood, city: cityData } = data
  const canonicalUrl = `https://crowncoastalhomes.com/neighborhoods/${city}/${neighborhood}`

  return {
    title: `${hood.name} Neighborhood Guide | ${cityData.name}, CA | Crown Coastal Homes`,
    description: `Explore ${hood.name} in ${cityData.name}, California. Compare current listings, property details, location research, and real estate guidance.`,
    openGraph: {
      title: `${hood.name} – ${cityData.name} Neighborhood Guide | Crown Coastal Homes`,
      description:
        hood.detailedDescription?.slice(0, 160) ??
        `Explore ${hood.name} in ${cityData.name}, CA. ${hood.description}`,
      images: hood.image
        ? [
            {
              url: hood.image.startsWith("http")
                ? hood.image
                : `https://crowncoastalhomes.com${hood.image}`,
              alt: `${hood.name} neighborhood, ${cityData.name}, California`,
              width: 1200,
              height: 630,
            },
          ]
        : [],
      url: canonicalUrl,
      type: "website",
      siteName: "Crown Coastal Homes",
    },
    twitter: {
      card: "summary_large_image",
      title: `${hood.name} | ${cityData.name} Real Estate`,
      description: hood.description,
    },
    alternates: { canonical: canonicalUrl },
  }
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function NeighborhoodPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { city, neighborhood } = await params
  const query = await searchParams
  const data = getNeighborhoodData(city, neighborhood)
  if (!data) notFound()

  const { neighborhood: hood, category, city: cityData } = data
  const related = getRelatedNeighborhoods(city, hood.href, 4)

  // ── Property listings with pagination ──
  const LIMIT = 9
  const currentPage = Math.max(1, Number(query.page ?? 1))
  const offset = (currentPage - 1) * LIMIT
  const baseUrl = `/neighborhoods/${city}/${neighborhood}`

  let propertyResult: { properties: any[]; total: number } = { properties: [], total: 0 }
  let usedFallback = false
  try {
    // Primary: filter by city + neighborhood name (matched against subdivision_name)
    propertyResult = await searchProperties({
      city: cityData.name,
      neighborhood: hood.name,
      status: "for_sale",
      limit: LIMIT,
      offset,
    })
    // Fallback: if 0 results (neighborhood name not in subdivision_name), show city-wide listings
    if (propertyResult.properties.length === 0) {
      usedFallback = true
      propertyResult = await searchProperties({
        city: cityData.name,
        status: "for_sale",
        limit: LIMIT,
        offset,
      })
    }
  } catch (err) {
    console.error(`[NeighborhoodPage] Property fetch failed for ${hood.name}:`, err)
  }

  const listings = propertyResult.properties ?? []
  const totalListings = propertyResult.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalListings / LIMIT))

  // ── JSON-LD structured data ──
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${hood.name}, ${cityData.name}`,
    description: hood.detailedDescription ?? hood.description,
    ...(hood.image && {
      image: hood.image.startsWith("http")
        ? hood.image
        : `https://crowncoastalhomes.com${hood.image}`,
    }),
    address: {
      "@type": "PostalAddress",
      addressLocality: cityData.name,
      addressRegion: "CA",
      addressCountry: "US",
    },
    containedInPlace: {
      "@type": "City",
      name: cityData.name,
    },
  }

  const highlights = buildHighlights(hood.name, category, cityData.name)

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="bg-[var(--bg)] theme-transition">

        {/* ════════════════ BREADCRUMB ════════════════ */}
        <BreadcrumbNav
          items={[
            { name: "Home", href: "/" },
            { name: "Neighborhoods", href: "/neighborhoods" },
            { name: cityData.name, href: `/neighborhoods#${city}` },
            { name: hood.name },
          ]}
        />

        {/* ════════════════ HERO — county split-grid style ════════════════ */}
        <section className="mt-4 md:mt-6">
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
            <div className="overflow-hidden grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] min-h-[300px] md:min-h-[400px] bg-[var(--surface)] border border-[var(--coastal-border)] rounded-2xl">

              {/* Left — image + copy */}
              <div className="relative p-6 md:p-8 lg:p-9">
                <Image
                  src={hood.image || "/luxury-modern-house-exterior.png"}
                  alt={`${hood.name} neighborhood in ${cityData.name}, California – real estate`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 60vw"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(90deg, rgba(250,247,242,0.93) 0%, rgba(250,247,242,0.86) 45%, rgba(250,247,242,0.28) 100%)",
                  }}
                />
                <div className="relative max-w-full lg:max-w-[620px]">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center bg-[var(--coastal-primary)]/10 text-[var(--coastal-primary)] text-xs font-semibold px-3 py-1.5 rounded-full border border-[var(--coastal-primary)]/20">
                      {category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-[var(--coastal-secondary)]/10 text-[var(--coastal-secondary)] text-xs font-semibold px-3 py-1.5 rounded-full border border-[var(--coastal-secondary)]/20">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {cityData.name}, CA
                    </span>
                  </div>

                  <h1 className="m-0 text-3xl sm:text-4xl md:text-5xl lg:text-[54px] leading-tight text-[var(--coastal-primary)] tracking-tight font-bold">
                    Live in{" "}
                    <span className="text-gradient-luxury bg-clip-text text-transparent">
                      {hood.name}
                    </span>
                  </h1>
                  <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-800 font-medium leading-relaxed">
                    {hood.description}
                  </p>
                </div>
              </div>

              {/* Right — lead form */}
              <div
                id="dream-home-form"
                className="bg-[var(--surface)] border-t lg:border-t-0 lg:border-l border-[var(--coastal-border)] p-4 md:p-5 lg:p-6 grid content-center"
              >
                <div className="bg-[var(--surface)] border border-[var(--coastal-border)] rounded-2xl p-5 md:p-6">
                  <div className="font-bold text-[var(--coastal-primary)] text-base md:text-lg mb-3 md:mb-4">
                    Connect with a {cityData.name} Expert
                  </div>
                  <LeadForm defaults={{ neighborhood: hood.name, city: cityData.name }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ TRUST BAR ════════════════ */}
        <section style={{ marginTop: 14 }}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
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
              <div style={{ color: "var(--coastal-muted-text)", fontSize: 13, fontWeight: 500 }}>
                Local listing research for {hood.name} &amp; {cityData.name}
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <Link href="/team/reza-barghlameno" style={{ color: "var(--coastal-primary)", fontSize: 13, fontWeight: 600 }}>
                  Licensed California agent · CA DRE #02211952
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ PROPERTIES ════════════════ */}
        <section
          id="listings"
          className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-12 md:mt-16"
        >
          <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--coastal-text)]">
                {usedFallback
                  ? `Homes for Sale in ${cityData.name}`
                  : `Homes for Sale in ${hood.name}`}
              </h2>
              <p className="text-[var(--coastal-muted-text)] text-sm mt-1">
                {usedFallback
                  ? `Showing ${cityData.name} listings — no ${hood.name}-specific listings found yet`
                  : `${totalListings.toLocaleString()} active listing${totalListings !== 1 ? "s" : ""} from the CRMLS feed`}
              </p>
            </div>
            <Link
              href={`/properties?search=${encodeURIComponent(cityData.name)}`}
              className="inline-flex items-center gap-2 text-[var(--coastal-primary)] font-semibold text-sm hover:gap-3 transition-all flex-shrink-0"
            >
              View all {cityData.name} listings
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          {listings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((property: any) => (
                  <PropertyCard
                    key={property.listing_key ?? property.id}
                    property={property}
                  />
                ))}
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="mt-10 flex flex-col items-center gap-3">
                  <p className="text-sm text-[var(--coastal-muted-text)]">
                    Page {currentPage} of {totalPages} &nbsp;·&nbsp;{" "}
                    {totalListings.toLocaleString()} total listings
                  </p>
                  <Pagination>
                    <PaginationContent>
                      {/* Previous */}
                      <PaginationItem>
                        <PaginationPrevious
                          href={currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : "#"}
                          className={currentPage === 1 ? "pointer-events-none opacity-40" : ""}
                          aria-disabled={currentPage === 1}
                        />
                      </PaginationItem>

                      {/* Page numbers — sliding window of 5 */}
                      {(() => {
                        const pages: (number | "ellipsis-start" | "ellipsis-end")[] = []
                        if (totalPages <= 7) {
                          for (let i = 1; i <= totalPages; i++) pages.push(i)
                        } else {
                          pages.push(1)
                          if (currentPage > 3) pages.push("ellipsis-start")
                          const start = Math.max(2, currentPage - 1)
                          const end = Math.min(totalPages - 1, currentPage + 1)
                          for (let i = start; i <= end; i++) pages.push(i)
                          if (currentPage < totalPages - 2) pages.push("ellipsis-end")
                          pages.push(totalPages)
                        }
                        return pages.map((p, idx) => {
                          if (p === "ellipsis-start" || p === "ellipsis-end") {
                            return (
                              <PaginationItem key={`ellipsis-${idx}`}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )
                          }
                          return (
                            <PaginationItem key={p}>
                              <PaginationLink
                                href={`${baseUrl}?page=${p}`}
                                isActive={p === currentPage}
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        })
                      })()}

                      {/* Next */}
                      <PaginationItem>
                        <PaginationNext
                          href={
                            currentPage < totalPages
                              ? `${baseUrl}?page=${currentPage + 1}`
                              : "#"
                          }
                          className={
                            currentPage === totalPages ? "pointer-events-none opacity-40" : ""
                          }
                          aria-disabled={currentPage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            /* No listings state */
            <div className="bg-[var(--surface)] border border-[var(--coastal-border)] rounded-2xl p-10 text-center">
              <Home className="h-10 w-10 text-[var(--coastal-muted-text)] mx-auto mb-4 opacity-50" />
              <h3 className="font-bold text-[var(--coastal-text)] text-lg mb-2">
                No Active Listings Right Now
              </h3>
              <p className="text-[var(--coastal-muted-text)] text-sm mb-6 max-w-md mx-auto">
                We don&apos;t have active listings in {hood.name} at the moment. Browse all{" "}
                {cityData.name} homes or set up an alert to be notified when new properties hit
                the market.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href={`/properties?search=${encodeURIComponent(cityData.name)}`}
                  className="px-5 py-2.5 bg-[var(--coastal-primary)] text-white rounded-xl font-semibold text-sm hover:shadow-md transition-all"
                >
                  Browse {cityData.name} Listings
                </Link>
                <Link
                  href="/contact"
                  className="px-5 py-2.5 border border-[var(--coastal-border)] text-[var(--coastal-text)] rounded-xl font-semibold text-sm hover:bg-[var(--surface-muted)] transition-all"
                >
                  Get Notified
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ════════════════ ABOUT + WHY ════════════════ */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-12 md:mt-16">
          <h2 className="font-bold text-[var(--coastal-text)] text-2xl md:text-3xl lg:text-4xl mb-2 text-center">
            About {hood.name}
          </h2>
          <p className="text-[var(--coastal-muted-text)] mb-8 text-base md:text-lg text-center max-w-2xl mx-auto">
            {hood.description}
          </p>
          <div className="bg-[var(--surface)] border border-[var(--coastal-border)] rounded-2xl p-6 md:p-8 shadow-sm mb-10">
            <p className="text-[var(--coastal-muted-text)] text-base md:text-lg leading-relaxed">
              {hood.detailedDescription ?? hood.description}
            </p>
          </div>

          {/* Why this neighborhood — 4-card grid */}
          <h2 className="font-bold text-[var(--coastal-text)] text-2xl md:text-3xl mb-6">
            Why {hood.name}?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="flex flex-col gap-4 bg-[var(--surface)] border border-[var(--coastal-border)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-3 bg-[var(--coastal-primary)]/10 rounded-xl w-fit">
                  <h.icon className="h-6 w-6 text-[var(--coastal-primary)]" aria-hidden />
                </div>
                <div>
                  <div className="font-bold text-[var(--coastal-text)] mb-1">{h.title}</div>
                  <div className="text-[var(--coastal-muted-text)] text-sm leading-relaxed">
                    {h.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════ SCHOOLS + NEIGHBORHOOD HIGHLIGHTS ════════════════ */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-16 md:mt-24 grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Education */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[var(--surface)] to-[var(--surface-muted)] p-6 md:p-8 rounded-2xl border border-[var(--coastal-border)] shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[var(--coastal-primary)] rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl">
                School &amp; Education Research
              </h2>
            </div>
            <div className="prose prose-lg max-w-none text-[var(--coastal-muted-text)]">
              <p>
                Attendance boundaries, enrollment rules, programs, and published school data can
                change. Research the specific property through official district and California
                Department of Education sources, then confirm its current assignment directly with
                the responsible district.
              </p>
              <p className="mt-4">
                Crown Coastal Homes provides property and transaction guidance but does not rank
                schools or recommend neighborhoods based on household composition. Verify travel
                times and enrollment information independently before relying on them.
              </p>
            </div>
          </div>

          {/* Neighborhood stats */}
          <div className="bg-[var(--coastal-primary)] p-6 md:p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingUp className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h2 className="font-bold text-xl md:text-2xl mb-6">Neighborhood Highlights</h2>
              <div className="space-y-6">
                <div>
                  <div className="text-white/80 text-sm font-medium mb-1">Community Type</div>
                  <div className="text-2xl font-bold">{category}</div>
                </div>
                <div className="w-full h-px bg-white/20" />
                <div>
                  <div className="text-white/80 text-sm font-medium mb-1">City</div>
                  <div className="text-2xl font-bold">{cityData.name}</div>
                </div>
                <div className="w-full h-px bg-white/20" />
                <div>
                  <div className="text-white/80 text-sm font-medium mb-1">Listing Data</div>
                  <div className="text-2xl font-bold">CRMLS</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ LIFESTYLE & AMENITIES ════════════════ */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-16 md:mt-24">
          <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-muted)] p-6 md:p-8 lg:p-10 rounded-2xl border border-[var(--coastal-border)] shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
                <Heart className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl lg:text-3xl">
                Lifestyle &amp; Amenities in {hood.name}
              </h2>
            </div>
            <div className="prose prose-lg max-w-none text-[var(--coastal-muted-text)]">
              <p>
                Amenities and travel times can vary across {hood.name}. Compare the specific
                property&apos;s distance to shopping, parks, transit, healthcare, and recreation using
                current maps, official sources, and an in-person visit.
              </p>
              <p className="mt-4">
                Property type, street conditions, noise, parking, coastal access, and local rules
                may differ block by block. Review those factors against your own priorities before
                deciding whether an available home in {hood.name} is a fit.
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════ INVESTMENT INSIGHTS ════════════════ */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-16 md:mt-24">
          <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-muted)] p-6 md:p-8 lg:p-10 rounded-2xl border border-[var(--coastal-border)] shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                <LineChart className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl lg:text-3xl">
                Investment Insights for {hood.name}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--coastal-border)] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[var(--coastal-text)]">Comparable Sales</h3>
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed mb-3">
                  Compare recent {hood.name} sales by property type, location, condition, and closing date.
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-600">CRMLS</span>
                  <span className="text-xs text-[var(--coastal-muted-text)]">market context</span>
                </div>
              </div>
              <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--coastal-border)] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[var(--coastal-text)]">Rental Scenario</h3>
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed mb-3">
                  Model rent, vacancy, management, maintenance, insurance, taxes, financing, and local restrictions.
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-blue-600">Inputs</span>
                  <span className="text-xs text-[var(--coastal-muted-text)]">verify assumptions</span>
                </div>
              </div>
              <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--coastal-border)] shadow-sm">
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
                <strong className="text-[var(--coastal-text)]">Investment note:</strong> Estimates
                depend on verified property data and assumptions. Consult qualified financial, tax,
                legal, insurance, and property-management professionals as needed.
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════ BUYER'S GUIDE ════════════════ */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-16 md:mt-24">
          <div className="bg-[var(--surface)] p-6 md:p-10 lg:p-12 rounded-2xl border border-[var(--coastal-border)] shadow-md">
            <h2 className="font-bold text-[var(--coastal-text)] text-2xl md:text-3xl lg:text-4xl mb-6">
              Buyer&apos;s Guide: Buying a Home in {hood.name}
            </h2>
            <p className="text-[var(--coastal-muted-text)] text-lg leading-relaxed mb-8">
              Purchasing in {hood.name} requires understanding the local market, financing options,
              and neighborhood dynamics. Our experienced agents provide end-to-end guidance — from
              your first visit to closing day.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--coastal-primary)] text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--coastal-text)] mb-1">Get Pre-Approved</h4>
                    <p className="text-sm text-[var(--coastal-muted-text)]">
                      Understand your budget and financing options before you start looking.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--coastal-primary)] text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--coastal-text)] mb-1">
                      Work with a Local Expert
                    </h4>
                    <p className="text-sm text-[var(--coastal-muted-text)]">
                      Our agents know {hood.name} and {cityData.name} and can help you find the
                      right fit.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--coastal-primary)] text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--coastal-text)] mb-1">
                      Schedule Property Tours
                    </h4>
                    <p className="text-sm text-[var(--coastal-muted-text)]">
                      View homes in person to get a true feel for the property and the streets of{" "}
                      {hood.name}.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--coastal-primary)] text-white flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--coastal-text)] mb-1">
                      Make an Informed Offer
                    </h4>
                    <p className="text-sm text-[var(--coastal-muted-text)]">
                      We&apos;ll analyze comparable {hood.name} sales and market conditions so you
                      can bid with confidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-[var(--coastal-border)] pt-8">
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-[var(--coastal-primary)] text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Get Expert Buyer Guidance
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════════ WEATHER ════════════════ */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-6 md:mt-8">
          <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-muted)] p-6 md:p-8 lg:p-10 rounded-2xl border border-[var(--coastal-border)] shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl">
                <CloudSun className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl lg:text-3xl">
                Year-Round California Weather
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--coastal-border)] text-center shadow-sm">
                <div className="text-3xl mb-2">☀️</div>
                <h3 className="font-semibold text-[var(--coastal-text)] mb-1">Average Temp</h3>
                <p className="text-2xl font-bold text-[var(--coastal-primary)]">72°F</p>
                <p className="text-xs text-[var(--coastal-muted-text)] mt-1">
                  Perfect year-round climate
                </p>
              </div>
              <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--coastal-border)] text-center shadow-sm">
                <div className="text-3xl mb-2">🌤️</div>
                <h3 className="font-semibold text-[var(--coastal-text)] mb-1">Sunny Days</h3>
                <p className="text-2xl font-bold text-[var(--coastal-primary)]">260+</p>
                <p className="text-xs text-[var(--coastal-muted-text)] mt-1">
                  Days of sunshine annually
                </p>
              </div>
              <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--coastal-border)] text-center shadow-sm">
                <div className="text-3xl mb-2">🌊</div>
                <h3 className="font-semibold text-[var(--coastal-text)] mb-1">Ocean Breeze</h3>
                <p className="text-2xl font-bold text-[var(--coastal-primary)]">Coastal</p>
                <p className="text-xs text-[var(--coastal-muted-text)] mt-1">Mild ocean climate</p>
              </div>
              <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--coastal-border)] text-center shadow-sm">
                <div className="text-3xl mb-2">🌡️</div>
                <h3 className="font-semibold text-[var(--coastal-text)] mb-1">Mild Winters</h3>
                <p className="text-2xl font-bold text-[var(--coastal-primary)]">55–65°F</p>
                <p className="text-xs text-[var(--coastal-muted-text)] mt-1">
                  Comfortable winter temps
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ TRANSPORTATION ════════════════ */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-6 md:mt-8">
          <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-muted)] p-6 md:p-8 lg:p-10 rounded-2xl border border-[var(--coastal-border)] shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl">
                <Train className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl lg:text-3xl">
                Transportation &amp; Connectivity
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--coastal-border)] shadow-sm">
                  <h3 className="text-lg font-semibold text-[var(--coastal-primary)] mb-3">
                    Public Transit
                  </h3>
                  <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed">
                    {hood.name} residents enjoy easy access to {cityData.name}&apos;s transit
                    network where available, including local bus service, regional rail, and
                    nearby commuter corridors that connect the neighborhood to surrounding
                    communities.
                  </p>
                </div>
                <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--coastal-border)] shadow-sm">
                  <h3 className="text-lg font-semibold text-[var(--coastal-primary)] mb-3">
                    Major Freeways
                  </h3>
                  <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed">
                    Highway access depends on the exact property location, commute direction, and
                    daily traffic patterns throughout the greater {cityData.name} region.
                  </p>
                </div>
              </div>
              <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--coastal-border)] shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--coastal-primary)] mb-3">
                  Airport Access
                </h3>
                <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed mb-4">
                  Airport access from {hood.name} depends on the nearest regional or international
                  airport and typical traffic patterns from this part of {cityData.name}.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[var(--surface-muted)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--coastal-text)]">
                      Downtown {cityData.name}
                    </span>
                    <span className="text-sm text-[var(--coastal-muted-text)]">10–20 min</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--surface-muted)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--coastal-text)]">
                      Nearest airport
                    </span>
                    <span className="text-sm text-[var(--coastal-muted-text)]">Varies</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--surface-muted)] rounded-lg">
                    <span className="text-sm font-medium text-[var(--coastal-text)]">
                      North County
                    </span>
                    <span className="text-sm text-[var(--coastal-muted-text)]">30–50 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ RELATED NEIGHBORHOODS ════════════════ */}
        {related.length > 0 && (
          <section
            className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-16 md:mt-24"
            aria-labelledby="related-heading"
          >
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <h2
                  id="related-heading"
                  className="text-2xl md:text-3xl font-bold text-[var(--coastal-text)]"
                >
                  More {cityData.name} Neighborhoods
                </h2>
                <p className="text-[var(--coastal-muted-text)] text-sm mt-1">
                  Continue exploring communities in {cityData.name}, California
                </p>
              </div>
              <Link
                href="/neighborhoods"
                className="hidden sm:inline-flex items-center gap-2 text-[var(--coastal-primary)] font-semibold text-sm hover:gap-3 transition-all flex-shrink-0"
              >
                View all neighborhoods
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((r) => (
                <NeighborhoodCard
                  key={r.pageHref}
                  name={r.name}
                  description={r.description}
                  image={r.image}
                  cityName={cityData.name}
                  category={r.category}
                  href={r.pageHref}
                />
              ))}
            </div>
          </section>
        )}

        {/* ════════════════ BOTTOM CTA ════════════════ */}
        <section
          className="bg-[var(--coastal-primary)] py-14 md:py-20 mt-16 md:mt-24"
          aria-label="Call to action"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              Ready to Call {hood.name} Home?
            </h2>
            <p className="text-white/80 text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Compare current CRMLS inventory, recent nearby sales, property condition, and total
              ownership costs with a licensed agent.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href={hood.href}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[var(--coastal-primary)] font-bold rounded-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all text-sm md:text-base"
              >
                <Home className="h-5 w-5" aria-hidden />
                Browse Listings
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/50 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-sm md:text-base"
              >
                <Phone className="h-5 w-5" aria-hidden />
                Contact an Agent
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type HighlightIcon = React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>

interface Highlight {
  icon: HighlightIcon
  title: string
  body: string
}

/**
 * Returns four neutral research prompts based on neighborhood category.
 */
function buildHighlights(name: string, category: string, city: string): Highlight[] {
  const lowerCategory = category.toLowerCase()
  const isCoastal = lowerCategory.includes("coastal") || lowerCategory.includes("beach")
  const isUrban = lowerCategory.includes("urban") || lowerCategory.includes("downtown")
  const isSuburban = lowerCategory.includes("suburban") || lowerCategory.includes("inland")
  const isLuxury = lowerCategory.includes("luxury") || lowerCategory.includes("iconic")

  const highlights: Highlight[] = [
    // Highlight 1 — lifestyle (varies by category)
    isCoastal
      ? {
          icon: Waves,
          title: "Coastal Access",
          body: `Use current maps and property visits to compare beach access, parking, noise, and coastal conditions in ${name}.`,
        }
      : isUrban
      ? {
          icon: Building2,
          title: "Urban Access",
          body: `Confirm walking, transit, and driving times from the specific ${name} property to your regular destinations.`,
        }
      : isLuxury
      ? {
          icon: TrendingUp,
          title: "Property Inventory",
          body: `Compare available ${name} properties by condition, lot, privacy, amenities, restrictions, and recent comparable sales.`,
        }
      : {
          icon: TreePine,
          title: "Parks & Open Space",
          body: `Review official park maps, hours, access, and travel times from each property in ${name}.`,
        },

    // Highlight 2 — community
    {
      icon: Users,
      title: "Community Resources",
      body: `Use official ${city} sources to review libraries, public services, events, and neighborhood facilities near ${name}.`,
    },

    // Highlight 3 — dining/lifestyle
    {
      icon: Utensils,
      title: "Dining & Daily Needs",
      body: `Check current business listings and travel times for groceries, dining, healthcare, and other daily needs near ${name}.`,
    },

    // Highlight 4 — education/investment
    isSuburban || !isUrban
      ? {
          icon: GraduationCap,
          title: "School Resources",
          body: `Verify attendance boundaries, enrollment rules, and published school information directly with districts and state sources.`,
        }
      : {
          icon: TrendingUp,
          title: "Market Evidence",
          body: `Use current listings and recent comparable sales to evaluate ${name}; future price or rental performance is not guaranteed.`,
        },
  ]

  return highlights
}
