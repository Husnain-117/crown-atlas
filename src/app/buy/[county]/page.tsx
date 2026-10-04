import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Home, TrendingUp, MapPin, Tag, ArrowRight, Database, Search } from "lucide-react"
import AlertSignup from "@/components/city/AlertSignup"
import LeadForm from "@/components/forms/LeadForm"
import { getCounty } from "@/lib/counties"
import { getCountyCityCounts } from "@/lib/county-stats"
import { getCountyListingMetrics } from "@/lib/city-metrics"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import { COUNTY_TITLE_OVERRIDES, COUNTY_DESCRIPTION_OVERRIDES, COUNTY_H1_OVERRIDES, COUNTY_INTRO_OVERRIDES } from "@/lib/seo/cityOverrides"
import { resolveCityHeroImage } from "@/lib/city-hero-images"
import { getCaliforniaCountyImage } from "@/lib/california-location-images"
import { isDatabaseConfigured } from "@/lib/db"

const CITIES_PER_PAGE = 12

export const revalidate = 7200

export async function generateMetadata({ params }: { params: Promise<{ county: string }> }): Promise<Metadata> {
  const { county } = await params
  const countyData = getCounty(county)
  if (!countyData) {
    return {
      title: "County Not Found | Crown Coastal Homes",
      description: "Browse California counties and find homes for sale."
    }
  }
  const title = COUNTY_TITLE_OVERRIDES[countyData.slug] || `Homes for Sale in ${countyData.name}, CA | Crown Coastal Homes`
  const description = COUNTY_DESCRIPTION_OVERRIDES[countyData.slug] || `Browse current homes for sale across cities in ${countyData.name}, CA. Compare available CRMLS listings and local property details.`
  const canonical = `https://crowncoastalhomes.com/buy/${countyData.slug}`
  const countyImage = getCaliforniaCountyImage(countyData.slug)
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: countyImage ? [{ url: countyImage.src, alt: countyImage.alt }] : undefined,
    }
  }
}

export default async function CountyBuyChooser({
  params,
  searchParams
}: {
  params: Promise<{ county: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { county } = await params
  const resolvedSearchParams = await searchParams
  const countyData = getCounty(county)
  if (!countyData) notFound()

  const dataAvailable = isDatabaseConfigured()
  const [counts, countyMetrics] = dataAvailable
    ? await Promise.all([
        getCountyCityCounts(countyData.slug, "buy"),
        getCountyListingMetrics(countyData.name),
      ])
    : [[], null]
  const countyImage = getCaliforniaCountyImage(countyData.slug)
  const countsBySlug = new Map(counts.map((city) => [city.slug, city]))
  const cities = countyData.cities.map((city) => {
    const metrics = countsBySlug.get(city.slug)
    return {
      city: city.name,
      slug: city.slug,
      count: dataAvailable ? metrics?.count ?? 0 : null,
      medianPrice: dataAvailable ? metrics?.medianPrice : undefined,
    }
  })
  const totalListings = dataAvailable ? countyMetrics?.totalSales ?? 0 : null
  const countyMedian = dataAvailable ? countyMetrics?.medianSalePrice ?? null : null
  const placeCountLabel = cities.length === 1 ? "community" : "cities and communities"

  // Keep the paginated grid stable while live listing counts change.
  const sortedCities = [...cities].sort((a, b) => a.city.localeCompare(b.city))
  const popularCities = dataAvailable
    ? [...cities]
        .sort((a, b) => (b.count ?? -1) - (a.count ?? -1) || a.city.localeCompare(b.city))
        .filter((city) => (city.count ?? 0) > 0)
        .slice(0, 5)
    : []

  const requestedPage = Math.max(
    1,
    parseInt(String(resolvedSearchParams?.page || "1"), 10) || 1
  )
  const totalCityPages = Math.max(1, Math.ceil(sortedCities.length / CITIES_PER_PAGE))
  const page = Math.min(requestedPage, totalCityPages)
  const pageCities = sortedCities.slice((page - 1) * CITIES_PER_PAGE, page * CITIES_PER_PAGE)

  return (
    <div className="bg-[var(--bg)] theme-transition">
      {/* ═══════════════════  HERO SECTION  ═══════════════════ */}
      <section className="relative min-h-[520px] overflow-hidden bg-slate-900 pb-16 pt-28 md:min-h-[600px] md:pb-20 md:pt-36">
        {countyImage && (
          <Image
            src={countyImage.src}
            alt={countyImage.alt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-black/55" />
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-white/80 animate-fade-in-up">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href={`/buy/${countyData.slug}`} className="transition-colors hover:text-white">{countyData.name}</Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-white">Buy</span>
          </div>

          <div className="max-w-4xl animate-fade-in-up">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-gradient-primary rounded-full"></div>
              <span className="text-sm font-semibold uppercase text-white">
                Homes for Sale
              </span>
              <div className="w-8 h-[2px] bg-gradient-primary rounded-full"></div>
            </div>

            <h1 className="font-display mb-6 pb-2 text-4xl font-bold leading-tight text-white text-balance md:text-5xl lg:text-6xl">
              {COUNTY_H1_OVERRIDES[countyData.slug] ? (
                COUNTY_H1_OVERRIDES[countyData.slug]
              ) : (
                <>
                  Buy a Home in{" "}
                  <span className="block pb-1 leading-[1.2] text-white">
                    {countyData.name}
                  </span>
                </>
              )}
            </h1>

            <p className="mb-8 max-w-3xl text-xl leading-relaxed text-white/85 text-balance md:text-2xl">
              {COUNTY_INTRO_OVERRIDES[countyData.slug] ||
                `Browse current homes for sale across ${cities.length} ${placeCountLabel} in ${countyData.name}, CA.`}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="#cities"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-slate-950 shadow-md transition-colors hover:bg-slate-100"
              >
                <Search className="w-5 h-5" />
                Find Your City
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg border border-white/70 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Talk to an Agent
              </Link>
            </div>
          </div>
        </div>
        {countyImage && (
          <a
            href={countyImage.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-3 right-4 z-10 text-xs text-white/75 underline hover:text-white"
          >
            Photo: {countyImage.creator}
          </a>
        )}
      </section>

      {/* ═══════════════════  STATS BAR  ═══════════════════ */}
      <section className="bg-[var(--surface)] border-y border-[var(--coastal-border)] theme-transition">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="glass-card rounded-2xl p-5 text-center border border-[var(--coastal-border)]">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 mb-3">
                <Home className="w-5 h-5 text-black dark:text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-[var(--coastal-text)]">
                {totalListings == null ? "Unavailable" : totalListings.toLocaleString()}
              </div>
              <div className="text-sm text-[var(--coastal-muted-text)] mt-1">Total Listings</div>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center border border-[var(--coastal-border)]">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 mb-3">
                <MapPin className="w-5 h-5 text-black dark:text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-[var(--coastal-text)]">{cities.length}</div>
              <div className="text-sm text-[var(--coastal-muted-text)] mt-1">Places</div>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center border border-[var(--coastal-border)]">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 mb-3">
                <TrendingUp className="w-5 h-5 text-black dark:text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-[var(--coastal-text)]">
                {countyMedian ? `$${countyMedian.toLocaleString()}` : "N/A"}
              </div>
              <div className="text-sm text-[var(--coastal-muted-text)] mt-1">County Median</div>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center border border-[var(--coastal-border)]">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 mb-3">
                <Database className="w-5 h-5 text-black dark:text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-[var(--coastal-text)]">CRMLS</div>
              <div className="text-sm text-[var(--coastal-muted-text)] mt-1">Data Source</div>
            </div>
          </div>
          <div className="mt-3 text-center text-xs text-[var(--coastal-muted-text)]">
            {dataAvailable
              ? "Listing data sourced from CRMLS and refreshed regularly"
              : "Current listing counts are temporarily unavailable"}
          </div>
        </div>
      </section>

      {/* ═══════════════════  POPULAR CITIES  ═══════════════════ */}
      {popularCities.length > 0 && <section className="py-8 bg-[var(--bg)] theme-transition">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="font-display text-xl font-bold text-[var(--coastal-text)] mb-4 theme-transition">Most Popular</h2>
          <div className="flex flex-wrap gap-3">
            {popularCities.map((city) => (
              <Link
                key={`popular-${city.slug}`}
                href={`/buy/${countyData.slug}/${city.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--coastal-border)] text-sm font-medium text-[var(--coastal-text)] hover:border-[var(--coastal-primary)] hover:text-[var(--coastal-primary)] transition-all duration-300"
              >
                <MapPin className="w-3.5 h-3.5" />
                {city.city} · {(city.count ?? 0).toLocaleString()} homes
              </Link>
            ))}
          </div>
        </div>
      </section>}

      {/* ═══════════════════  ALL CITIES GRID  ═══════════════════ */}
      <section id="cities" className="py-12 md:py-16 bg-[var(--surface)] theme-transition">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4 theme-transition">
              Cities &amp; Communities — {countyData.name}
            </h2>
            <p className="text-lg text-[var(--coastal-muted-text)] theme-transition">
              Choose a city to browse homes for sale with local stats and neighborhood insights
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pageCities.map((city, index) => {
              const cityImage = resolveCityHeroImage(city.slug)
              return (
              <Link
                key={city.slug}
                href={`/buy/${countyData.slug}/${city.slug}`}
                className="group glass-card rounded-2xl overflow-hidden border border-[var(--coastal-border)] hover-lift transition-all duration-500 animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* City image */}
                <div className="relative h-40 bg-gradient-to-br from-[var(--coastal-primary)] to-[var(--coastal-secondary)] overflow-hidden">
                  {cityImage ? (
                    <>
                      <Image
                        src={cityImage.imageUrl}
                        alt={`${cityImage.attractionLabel} in ${city.city}, California`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Home className="w-8 h-8 text-white/70 mx-auto mb-2" />
                          <span className="text-white/90 font-semibold text-lg">{city.city}, CA</span>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </>
                  )}
                  {/* Listing count badge */}
                  {city.count != null && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 rounded-lg text-xs font-bold text-[var(--coastal-primary)]">
                      {city.count.toLocaleString()} homes
                    </div>
                  )}
                </div>

                {/* City info */}
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold text-[var(--coastal-text)] mb-2 group-hover:text-[var(--coastal-primary)] transition-colors">
                    {city.city}, CA
                  </h3>
                  {city.count != null ? (
                    <div className="flex items-center gap-1 text-sm text-[var(--coastal-muted-text)] mb-2">
                      <Home className="w-3.5 h-3.5" />
                      {city.count.toLocaleString()} homes for sale
                    </div>
                  ) : (
                    <div className="text-sm text-[var(--coastal-muted-text)] mb-2">
                      Open the city to check current listings
                    </div>
                  )}
                  {city.medianPrice && (
                    <div className="text-sm text-[var(--coastal-muted-text)] mb-3 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Median ${Math.round(city.medianPrice).toLocaleString()}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[var(--coastal-primary)] font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                    <span>View Homes</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            )
            })}
          </div>

          {totalCityPages > 1 && (
            <Pagination className="mt-10">
              <PaginationContent className="flex flex-wrap justify-center gap-1">
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/buy/${countyData.slug}?page=${page - 1}`}
                      aria-label="Previous page"
                    />
                  </PaginationItem>
                )}
                {Array.from({ length: totalCityPages }, (_, i) => i + 1).map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href={`/buy/${countyData.slug}?page=${pageNum}`}
                      isActive={pageNum === page}
                      aria-current={pageNum === page ? "page" : undefined}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {page < totalCityPages && (
                  <PaginationItem>
                    <PaginationNext
                      href={`/buy/${countyData.slug}?page=${page + 1}`}
                      aria-label="Next page"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </section>

      {/* ═══════════════════  ABOUT SECTION  ═══════════════════ */}
      <section className="py-12 md:py-16 bg-[var(--bg)] theme-transition">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-3xl p-8 md:p-10 border border-[var(--coastal-border)]">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--coastal-text)] mb-4 theme-transition">
                Buying a Home in {countyData.name}
              </h2>
              <p className="text-[var(--coastal-muted-text)] leading-relaxed theme-transition">
                Start by choosing a city above to browse homes for sale, current listing counts, and available market context.
                Confirm financing, property condition, disclosures, insurance, title, local rules, and neighborhood factors before
                making a decision. Crown Coastal Homes (CA DRE #02211952) can guide the search and transaction process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════  ALERT SIGNUP  ═══════════════════ */}
      <section className="py-12 md:py-16 bg-[var(--surface)] border-t border-[var(--coastal-border)] theme-transition">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="glass-card rounded-3xl p-8 md:p-10 border border-[var(--coastal-border)]">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--coastal-text)] mb-4 text-center theme-transition">
                Get New Listing Alerts
              </h2>
              <p className="text-[var(--coastal-muted-text)] text-center mb-6 theme-transition">
                Be the first to know about new homes for sale in {countyData.name}
              </p>
              <AlertSignup city={countyData.name} county={countyData.name} action="buy" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════  QUICK LINKS  ═══════════════════ */}
      <section className="py-10 bg-[var(--bg)] theme-transition">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-[var(--coastal-text)] mb-6 theme-transition">Quick Links</h2>
          <div className="flex flex-wrap gap-3">
            <Link href={`/discover/${countyData.slug}`} className="px-4 py-2.5 rounded-xl border border-[var(--coastal-border)] text-[var(--coastal-text)] font-medium hover:bg-[var(--surface-muted)] hover:border-[var(--coastal-primary)] transition-all duration-300 text-sm">
              County Overview
            </Link>
            <Link href={`/rent/${countyData.slug}`} className="px-4 py-2.5 rounded-xl border border-[var(--coastal-border)] text-[var(--coastal-text)] font-medium hover:bg-[var(--surface-muted)] hover:border-[var(--coastal-primary)] transition-all duration-300 text-sm">
              Rent in {countyData.name}
            </Link>
            <Link href="/buy/houses" className="px-4 py-2.5 rounded-xl border border-[var(--coastal-border)] text-[var(--coastal-text)] font-medium hover:bg-[var(--surface-muted)] hover:border-[var(--coastal-primary)] transition-all duration-300 text-sm">
              Houses
            </Link>
            <Link href="/buy/condos" className="px-4 py-2.5 rounded-xl border border-[var(--coastal-border)] text-[var(--coastal-text)] font-medium hover:bg-[var(--surface-muted)] hover:border-[var(--coastal-primary)] transition-all duration-300 text-sm">
              Condos
            </Link>
            <Link href="/buy/luxury" className="px-4 py-2.5 rounded-xl border border-[var(--coastal-border)] text-[var(--coastal-text)] font-medium hover:bg-[var(--surface-muted)] hover:border-[var(--coastal-primary)] transition-all duration-300 text-sm">
              Luxury
            </Link>
            <Link href="/blogs" className="px-4 py-2.5 rounded-xl border border-[var(--coastal-border)] text-[var(--coastal-text)] font-medium hover:bg-[var(--surface-muted)] hover:border-[var(--coastal-primary)] transition-all duration-300 text-sm">
              Market Insights
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════  LEAD FORM  ═══════════════════ */}
      <section className="py-12 md:py-16 bg-[var(--surface)] border-t border-[var(--coastal-border)] theme-transition">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="glass-card rounded-3xl p-8 md:p-10 border border-[var(--coastal-border)]">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--coastal-text)] mb-4 text-center theme-transition">
                Talk to an Agent
              </h2>
              <p className="text-[var(--coastal-muted-text)] text-center mb-6 theme-transition">
                Request property-specific guidance from a licensed California real estate professional.
              </p>
              <LeadForm defaults={{ county: countyData.name, state: "CA" }} />
              <div className="text-xs text-[var(--coastal-muted-text)] mt-4 text-center">
                Direct support from a licensed agent · CA DRE #02211952
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
