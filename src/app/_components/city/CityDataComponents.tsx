import "server-only"
import { searchProperties } from "@/lib/db/property-repo"
import { getCityMetrics } from "@/lib/city-metrics"
import { slugToCityName } from "@/lib/counties"
import { citySearchFilters, citySearchPage, firstQueryValue, positiveQueryNumber } from "@/lib/landing/city-search"
import { getCityResearch } from "@/lib/landing/city-research"
import { getInitialCityListings } from "./city-listings"
import { CITY_H1_OVERRIDES } from "@/lib/seo/cityOverrides"
import CitySchema from "@/components/seo/CitySchema"
import PropertyCard from "@/components/property-card-client"
import FilterBar from "@/components/city/FilterBar"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination"
import Link from "next/link"
import { propertyPathFor } from "@/lib/property-url"

function buildListingsQuery(
  query: { [key: string]: string | string[] | undefined },
  page: number
): string {
  const p: Record<string, string> = {}
  for (const k of ["minPrice", "maxPrice", "beds", "baths", "type", "sort", "newest", "search", "keywords", "minSqft", "maxSqft"]) {
    const v = query[k]
    if (v != null && v !== "") p[k] = Array.isArray(v) ? v[0] : String(v)
  }
  p.page = String(page)
  return new URLSearchParams(p).toString()
}

export async function CitySchemaDataServer({
  citySlug,
  countySlug,
  action,
  faqItems,
  breadcrumbItems
}: {
  citySlug: string
  countySlug: string
  action: "buy" | "rent"
  faqItems: any[]
  breadcrumbItems: any[]
}) {
  const cityName = slugToCityName(citySlug)
  const listings = await getInitialCityListings(citySlug, countySlug, action)

  return (
    <CitySchema
      city={cityName}
      canonical={`/${action}/${countySlug}/${citySlug}`}
      featured={listings.properties.slice(0, 20).map((p: any) => ({
        id: p.listing_key || p.id,
        url: propertyPathFor(p)
      }))}
      faqItems={faqItems}
      breadcrumbItems={breadcrumbItems}
    />
  )
}

export async function CityHeroTextServer({ 
  citySlug, 
  countySlug, 
  countyName,
  action 
}: { 
  citySlug: string
  countySlug: string
  countyName: string
  action: "buy" | "rent" 
}) {
  const cityName = slugToCityName(citySlug)
  const baseSlug = citySlug.replace(/-ca$/i, "")
  const metrics = await getCityMetrics({ citySlug, countySlug }, action)
  const h1Text = action === "buy"
    ? CITY_H1_OVERRIDES[citySlug] || CITY_H1_OVERRIDES[baseSlug] || `Homes for Sale in ${cityName}, CA`
    : `Homes for Rent in ${cityName}, CA`
  const research = getCityResearch(citySlug)

  return (
    <div className="animate-fade-in">
      <div className="inline-flex items-center px-2 py-1 text-[11px] font-semibold tracking-wide uppercase rounded bg-[var(--surface-muted)] text-[var(--coastal-muted-text)] border border-[var(--coastal-border)]">
        {metrics.available === false ? "Listing summary unavailable" : `${metrics.activeListings.toLocaleString()} active ${action === "buy" ? "listings" : "rentals"}`}
        {metrics.newListings7d ? ` · ${metrics.newListings7d.toLocaleString()} new (7d)` : ""} · CRMLS data
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--coastal-text)] leading-tight">
        {h1Text}
      </h1>
      
      {action === "buy" ? (
        <>
          <p className="mt-1 text-xl sm:text-2xl md:text-3xl italic text-[var(--coastal-primary)]">
            Property search in {countyName}
          </p>
          <div className="mt-2 text-xs uppercase tracking-wide text-[var(--coastal-muted-text)]">
            {cityName}, California
          </div>
        </>
      ) : (
        <>
          <p className="mt-1 text-xl sm:text-2xl md:text-3xl italic text-[var(--coastal-primary)]">
            Find Your Next Home
          </p>
          <div className="mt-2 text-xs uppercase tracking-wide text-[var(--coastal-muted-text)]">
            {cityName}, California · Rentals
          </div>
        </>
      )}

      <p className="mt-5 text-base leading-relaxed text-[var(--coastal-muted-text)] max-w-[620px]">
        {action === "buy" && research ? research.introduction : `Compare homes ${action === "buy" ? "for sale" : "for rent"} in ${cityName}, ${countyName}. Narrow the current listings by price, property type and features, then review the details of each home with a local agent.`}
      </p>

      <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <Link
          href="#listings"
          className="px-4 py-2 rounded-md bg-[var(--coastal-primary)] text-white font-semibold text-center"
        >
          {action === "buy" ? "Find My Home" : "Find Rentals"}
        </Link>
        <Link
          href={`/${action === "buy" ? "rent" : "buy"}/${countySlug}/${citySlug}`}
          className="px-4 py-2 rounded-md border border-[var(--coastal-border)] text-[var(--coastal-text)] font-semibold text-center"
        >
          {action === "buy" ? "Looking to rent instead?" : "Looking to buy instead?"}
        </Link>
      </div>
    </div>
  )
}

export async function CityHeroOverlayServer({ 
  citySlug, 
  countySlug, 
  displayName,
  action
}: { 
  citySlug: string
  countySlug: string
  displayName: string
  action: "buy" | "rent"
}) {
  const metrics = await getCityMetrics({ citySlug, countySlug }, action)

  return (
    <>
      <div className="absolute inset-x-0 top-[48%] -translate-y-1/2 text-center px-4 sm:px-6 z-10 animate-fade-in-up">
        <div className="text-white text-3xl sm:text-4xl font-extrabold drop-shadow-lg tracking-tight leading-tight">{displayName}</div>
        {/* Placeholder for attraction label which is part of the image prop usually, but we keep it simple here or omit it to avoid passing it down */}
      </div>
      <div className="absolute left-4 right-4 sm:right-auto sm:left-6 bottom-4 sm:bottom-6 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md p-3 sm:p-4 sm:min-w-[220px] shadow-2xl border border-white/20 z-10 animate-fade-in-up">
        <div className="text-[10px] uppercase tracking-widest font-bold text-[var(--coastal-muted-text)] mb-1">
          {action === "buy" ? "Median Asking Price" : "Median Monthly Asking Rent"}
        </div>
        <div className={`${action === "buy" ? "text-2xl sm:text-3xl" : "text-3xl"} font-black text-[var(--coastal-primary)] tracking-tight`}>
          {metrics.medianPrice != null ? `$${Math.round(metrics.medianPrice).toLocaleString()}` : "Unavailable"}
        </div>
        <div className="text-xs font-semibold text-[var(--coastal-text)] mt-1">{displayName.replace(/(?:,\s*CA)+$/i, "")}, CA</div>
      </div>
    </>
  )
}

export async function CityStatsBarServer({ 
  citySlug, 
  countySlug,
  action
}: { 
  citySlug: string
  countySlug: string
  action: "buy" | "rent"
}) {
  const metrics = await getCityMetrics({ citySlug, countySlug }, action)
  const money = (value: number | null | undefined) => value != null ? `$${value.toLocaleString("en-US")}` : "Unavailable"
  const cells = [
    { label: action === "buy" ? "Active Listings" : "Active Rentals", value: metrics.available === false ? "Unavailable" : metrics.activeListings.toLocaleString("en-US") },
    { label: action === "buy" ? "Median Asking Price" : "Median Monthly Asking Rent", value: money(metrics.medianPrice) },
    ...(action === "buy" ? [{ label: "Median Asking Price / Sqft", value: money(metrics.medianPricePerSqft) }] : []),
    { label: "Median Days on Market", value: metrics.medianDaysOnMarket != null ? `${metrics.medianDaysOnMarket} days` : "Unavailable" },
  ]
  return (
    <div>
      <div className={`grid grid-cols-2 ${action === "buy" ? "md:grid-cols-4" : "md:grid-cols-3"} border-t border-[var(--coastal-border)] animate-fade-in`}>
        {cells.map(cell => (
          <div key={cell.label} className="px-6 py-4 border-r border-[var(--coastal-border)]">
            <div className="text-[10px] uppercase tracking-wide text-[var(--coastal-muted-text)]">{cell.label}</div>
            <div className="text-2xl font-semibold text-[var(--coastal-text)]">{cell.value}</div>
          </div>
        ))}
      </div>
      <p className="px-6 pb-4 text-xs text-[var(--coastal-muted-text)]">
        CRMLS active residential {action === "buy" ? "sale" : "rental"} listings available through this site, before page filters.
        Prices are asking prices, not closed-sale values. Medians exclude missing values; price per square foot also excludes missing floor area.
        {metrics.snapshotAt && <> Snapshot calculated {new Date(metrics.snapshotAt).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" })} UTC.</>}{" "}
        <Link href="/about/data-methodology" className="underline">Data methodology</Link>.
      </p>
    </div>
  )
}

export function CityEditorialServer({ citySlug, displayName }: { citySlug: string; displayName: string }) {
  const research = getCityResearch(citySlug)
  return (
    <section className="mt-10 mb-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-[var(--coastal-text)] mb-4">Researching a home in {displayName}</h2>
      <p className="text-lg text-[var(--coastal-muted-text)] leading-relaxed mb-4">
        Compare similar homes by asking price, size, condition and ownership costs. An active listing summary describes the inventory available through this site; it does not establish the value of an individual home or cover every sale in {displayName}.
      </p>
      <ul className="list-disc pl-5 space-y-3 text-[var(--coastal-muted-text)]">
        {(research?.checks ?? [
          `Confirm the property's city or county jurisdiction, then check permits and zoning with the responsible planning department.`,
          `Compare address-specific travel routes, parking and services against your own priorities.`,
          `Review disclosures, inspections and insurance information for each shortlisted home; request written estimates of taxes, HOA charges and other ownership costs.`,
        ]).map(check => <li key={check}>{check}</li>)}
      </ul>
      {research && <p className="mt-4 text-sm"><a href={research.source.href} className="underline text-[var(--coastal-primary)]">{research.source.label}</a></p>}
      <p className="mt-4 text-sm text-[var(--coastal-muted-text)]">
        Discuss your shortlist with{" "}<Link href="/team/reza-barghlameno" className="underline">Reza Barghlameno, DRE #02211952</Link>, or follow the{" "}<Link href="/buyers-guide" className="underline">California home buying guide</Link>.
      </p>
    </section>
  )
}

// Map FilterBar type value → propertyCategory (matches dedicated-page logic).
// Condos and townhouses are stored as property_type='Residential' + property_sub_type,
// so we must use propertyCategory; passing propertyType='Condominium' returns 0 results.
function mapTypeToCategory(type: string): string | undefined {
  if (type === "Residential") return "house"
  if (type === "Condominium") return "condo"
  if (type === "Townhouse") return "townhouse"
  if (type === "Land") return "land"
  return undefined
}

export async function CityListingsServer({
  citySlug,
  countySlug,
  searchParams,
  action,
  displayName
}: {
  citySlug: string
  countySlug: string
  searchParams: { [key: string]: string | string[] | undefined }
  action: "buy" | "rent"
  displayName: string
}) {
  const page = citySearchPage(searchParams.page)
  const limit = 12
  const offset = (page - 1) * limit
  const typeParam = firstQueryValue(searchParams.type)
  const resolvedCategory = typeParam ? mapTypeToCategory(typeParam) : undefined
  const isNewest = firstQueryValue(searchParams.newest) === "true"
  const sort = firstQueryValue(searchParams.sort)
  const allowedSorts = ["price_asc", "price_desc", "newest", "updated", "area_desc", "dom_asc", "price_reduced"]
  const resolvedSort = (sort && allowedSorts.includes(sort) ? sort : isNewest ? "newest" : "updated") as "updated"
  const searchBarTerm = firstQueryValue(searchParams.search)?.trim() ?? ""
  const featureKeywords = firstQueryValue(searchParams.keywords)?.trim() || undefined
  const filters = citySearchFilters(citySlug, countySlug, action)
  let result = { properties: [] as any[], total: 0 }
  if (filters) {
    // A typed location may change city, but feature keywords keep the page's
    // geography. A pool search in La Jolla must not become a statewide search.
    if (searchBarTerm) {
      delete filters.city
      delete filters.county
      delete filters.neighborhood
      if (/^\d{5}(-\d{4})?$/.test(searchBarTerm) || /^\d+\s/.test(searchBarTerm)) filters.locationKeywords = searchBarTerm
      else filters.city = searchBarTerm
    }
    const queryHasFilters = Object.entries(searchParams).some(([key, value]) => key !== "page" && firstQueryValue(value))
    result = !queryHasFilters && page === 1
      ? await getInitialCityListings(citySlug, countySlug, action)
      : await searchProperties({
        ...filters,
        minPrice: positiveQueryNumber(searchParams.minPrice), maxPrice: positiveQueryNumber(searchParams.maxPrice),
        minBedrooms: positiveQueryNumber(searchParams.beds), minBathrooms: positiveQueryNumber(searchParams.baths),
        propertyCategory: resolvedCategory, keywords: featureKeywords,
        minLivingArea: positiveQueryNumber(searchParams.minSqft), maxLivingArea: positiveQueryNumber(searchParams.maxSqft),
        sort: resolvedSort, daysListed: isNewest ? 21 : undefined, limit, offset,
      })
  }
  const listings = result.properties || []
  const resultsLabel = searchBarTerm ? `matching “${searchBarTerm}”` : `in ${displayName}`

  return (
    <div className="animate-fade-in mt-6">
      <FilterBar action={action} total={result.total} />

      <div id="listings" className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--coastal-text)]">
            {result.total.toLocaleString()} {action === "buy" ? "homes for sale" : "rentals"} {resultsLabel}
          </h2>
          <div className="text-sm text-[var(--coastal-muted-text)]">
            CRMLS listing data
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((property: any) => (
            <PropertyCard key={property.listing_key || property.id} property={property} />
          ))}
        </div>

        {listings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-[var(--coastal-muted-text)] mb-4">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No matching properties found</h3>
              <p className="mb-4">Try widening your price range or removing a filter{isNewest ? " to include listings older than 21 days" : ""}.</p>
              <Link
                href={`/${action}/${countySlug}/${citySlug}`}
                className="inline-block px-4 py-2 bg-[var(--coastal-primary)] text-white rounded-lg hover:bg-[var(--coastal-primary)]/90 transition-colors"
              >
                Show All Properties
              </Link>
            </div>
          </div>
        )}

        {(() => {
          const totalPages = Math.ceil((result.total || 0) / limit)
          if (totalPages <= 1) return null
          const currentPage = page
          const maxVisiblePages = 7
          const pages: (number | string)[] = []
          if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
          } else {
            pages.push(1)
            let start = Math.max(2, currentPage - 2)
            let end = Math.min(totalPages - 1, currentPage + 2)
            if (currentPage <= 3) end = Math.min(totalPages - 1, 5)
            if (currentPage >= totalPages - 2) start = Math.max(2, totalPages - 4)
            if (start > 2) pages.push("ellipsis-start")
            for (let i = start; i <= end; i++) pages.push(i)
            if (end < totalPages - 1) pages.push("ellipsis-end")
            pages.push(totalPages)
          }
          const basePath = `/${action}/${countySlug}/${citySlug}`
          return (
            <Pagination className="mt-8">
              <PaginationContent className="flex flex-wrap justify-center gap-1">
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`${basePath}?${buildListingsQuery(searchParams, currentPage - 1)}`}
                      aria-label="Previous page"
                    />
                  </PaginationItem>
                )}
                {pages.map((p, index) => {
                  if (p === "ellipsis-start" || p === "ellipsis-end") {
                    return (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  const pageNum = p as number
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href={`${basePath}?${buildListingsQuery(searchParams, pageNum)}`}
                        isActive={pageNum === currentPage}
                        aria-current={pageNum === currentPage ? "page" : undefined}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href={`${basePath}?${buildListingsQuery(searchParams, currentPage + 1)}`}
                      aria-label="Next page"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )
        })()}
      </div>
    </div>
  )
}

export function CityLifestyleServer({ citySlug }: { citySlug: string }) {
  const cityName = slugToCityName(citySlug)
  return (
    <section className="mt-10 rounded-xl border border-[var(--coastal-border)] p-6 bg-[var(--surface)]">
      <h2 className="text-xl font-semibold text-[var(--coastal-text)] mb-3">Schools and daily life in {cityName}</h2>
      <p className="text-[var(--coastal-muted-text)] leading-relaxed">
        Check a property's school assignment directly with the district and research programs through the{" "}
        <a href="https://www.cde.ca.gov/schooldirectory/" className="underline">California School Directory</a>.
        Visit the area or arrange a video tour to assess the streets, parking and access you will use. Check transit routes and schedules with the operator before planning a commute.
      </p>
    </section>
  )
}
