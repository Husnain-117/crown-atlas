"use client"

import { Fragment, useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import FilterBar from "@/components/city/FilterBar"
import { useTrestlePropertiesIntegrated } from "@/hooks/useTrestlePropertiesIntegrated"
import { PropertyCard } from "@/components/property-card"
import type { Property } from "@/interfaces"
import { SaveSearchBannerClient } from "./SaveSearchBannerClient"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const PropertyGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
    {[...Array(18)].map((_, index) => (
      <div key={`skeleton-${index}`} className="space-y-4 animate-pulse">
        <div className="h-64 w-full rounded-3xl bg-[var(--surface-muted)]" />
        <div className="space-y-3 px-2">
          <div className="h-5 w-3/4 bg-[var(--surface-muted)] rounded" />
          <div className="h-4 w-1/2 bg-[var(--surface-muted)] rounded" />
          <div className="h-6 w-1/3 bg-[var(--surface-muted)] rounded" />
        </div>
      </div>
    ))}
  </div>
)

interface PropertiesFilterClientProps {
  initialProperties: Property[]
  initialTotal: number
  filters: Record<string, any>
  showSaveSearch?: boolean
}

function positivePage(value: unknown): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

export default function PropertiesFilterClient({ initialProperties, initialTotal, filters, showSaveSearch = false }: PropertiesFilterClientProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(() => positivePage(searchParams.get("page") || filters.page))
  const isRent = filters.status === "for_rent" || filters.propertyType === "ResidentialLease"

  // Sync filters with URL search params (FilterBar uses URL params)
  const [legacyFilters, setLegacyFilters] = useState<{
    propertyType: string;
    status: string | undefined;
    minPrice: number | undefined;
    maxPrice: number | undefined;
    city: string;
    county: string;
    minBathrooms: number | undefined;
    minBedrooms: number | undefined;
    minYearBuilt: number | undefined;
    maxYearBuilt: number | undefined;
    minLotSize: number | undefined;
    maxLotSize: number | undefined;
    maxHoaFee: number | undefined;
    hasGarage: boolean;
    hasPool: boolean;
    hasView: boolean;
    hasOceanView: boolean;
    isWaterfront: boolean;
    isNewConstruction: boolean;
    isSeniorCommunity: boolean;
    hasFireplace: boolean;
    priceReduced: boolean;
    openHouseDate: string | undefined;
    maxLivingArea: number | undefined;
    minLivingArea: number | undefined;
    sortBy: "recommended" | "price-asc" | "price-desc" | "date-desc" | "area-desc";
    propertyCategory: string;
    daysListed: number | undefined;
    keywords: string | undefined;
    locationKeywords: string | undefined;
  }>({
    propertyType: isRent ? "ResidentialLease" : (filters.propertyType || ""),
    status: isRent ? "for_rent" : undefined,
    minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
    city: filters.city || "",
    county: filters.county || "",
    minBathrooms: filters.baths,
    minBedrooms: filters.beds,
    minYearBuilt: filters.minYear,
    maxYearBuilt: filters.maxYear,
    minLotSize: filters.minLot,
    maxLotSize: filters.maxLot,
    maxHoaFee: filters.maxHoa,
    hasGarage: Boolean(filters.hasGarage),
    hasPool: Boolean(filters.hasPool),
    hasView: Boolean(filters.hasView),
    hasOceanView: Boolean(filters.hasOceanView),
    isWaterfront: Boolean(filters.isWaterfront),
    isNewConstruction: Boolean(filters.isNewConstruction),
    isSeniorCommunity: Boolean(filters.isSeniorCommunity),
    hasFireplace: Boolean(filters.hasFireplace),
    priceReduced: Boolean(filters.priceReduced),
    openHouseDate: filters.openHouseDate,
    maxLivingArea: filters.maxSqft,
    minLivingArea: filters.minSqft,
    sortBy: "recommended",
    propertyCategory: filters.propertyCategory || "",
    daysListed: filters.newest ? 21 : undefined,
    keywords: filters.keywords,
    locationKeywords: filters.locationKeywords,
  })

  // Track if user has explicitly applied filters (not just initial page load)
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false)

  // Map FilterBar type value → propertyCategory (same logic as dedicated pages).
  // Condos/townhouses have property_type='Residential' + property_sub_type='Condominium',
  // so filtering by propertyType='Condominium' returns 0 results.
  const mapTypeToCategory = (t: string): string => {
    if (t === "Residential") return "house"
    if (t === "Condominium") return "condo"
    if (t === "Townhouse") return "townhouse"
    if (t === "Manufactured") return "manufactured"
    if (t === "MultiFamily") return "multifamily"
    if (t === "Land") return "land"
    return ""
  }

  // Sync filters with URL params when they change
  useEffect(() => {
    const search = searchParams.get("search")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const beds = searchParams.get("beds")
    const baths = searchParams.get("baths")
    const type = searchParams.get("type")
    const sort = searchParams.get("sort")
    const newest = searchParams.get("newest")
    const minSqft = searchParams.get("minSqft")
    const maxSqft = searchParams.get("maxSqft")
    const minLot = searchParams.get("minLot")
    const maxLot = searchParams.get("maxLot")
    const minYear = searchParams.get("minYear")
    const maxYear = searchParams.get("maxYear")
    const maxHoa = searchParams.get("maxHoa")
    const hasGarage = searchParams.get("hasGarage") === "true"
    const hasPool = searchParams.get("pool") === "true"
    const hasView = searchParams.get("view") === "true"
    const hasOceanView = searchParams.get("oceanView") === "true"
    const isWaterfront = searchParams.get("waterfront") === "true"
    const isNewConstruction = searchParams.get("newConstruction") === "true"
    const isSeniorCommunity = searchParams.get("senior") === "true"
    const hasFireplace = searchParams.get("fireplace") === "true"
    const priceReduced = searchParams.get("priceReduced") === "true"
    const openHouseDate = searchParams.get("openHouseDate") || undefined
    const keywords = searchParams.get("keywords")
    const requestedPage = positivePage(searchParams.get("page") || filters.page)
    const hasUrlFilters = Boolean(
      search || minPrice || maxPrice || beds || baths || type || sort || newest || minSqft || maxSqft ||
      minLot || maxLot || minYear || maxYear || maxHoa || hasGarage || hasPool || hasView || hasOceanView || isWaterfront ||
      isNewConstruction || isSeniorCommunity || hasFireplace || priceReduced || openHouseDate || keywords
    )

    // Map FilterBar sort values to the API hook's format.
    const mapSort = (s: string | null): "recommended" | "price-asc" | "price-desc" | "date-desc" | "area-desc" => {
      if (s === "newest") return "date-desc"
      if (s === "price_asc") return "price-asc"
      if (s === "price_desc") return "price-desc"
      if (s === "area_desc") return "area-desc"
      return "recommended"
    }

    const resolvedCategory = type ? mapTypeToCategory(type) : (filters.propertyCategory || "")
    const selectedPropertyType = type === "Land"
      ? "Land"
      : (isRent ? "ResidentialLease" : (filters.propertyType || ""))

    setHasAppliedFilters(hasUrlFilters)
    setCurrentPage(requestedPage)
    setLegacyFilters({
      propertyType: selectedPropertyType,
      status: isRent ? "for_rent" : undefined,
      minPrice: minPrice ? parseInt(minPrice) : filters.minPrice,
      maxPrice: maxPrice ? parseInt(maxPrice) : filters.maxPrice,
      city: filters.city || "",
      county: filters.county || "",
      minBathrooms: baths ? parseInt(baths) : filters.baths,
      minBedrooms: beds ? parseInt(beds) : filters.beds,
      minYearBuilt: minYear ? parseInt(minYear) : filters.minYear,
      maxYearBuilt: maxYear ? parseInt(maxYear) : filters.maxYear,
      minLotSize: minLot ? parseInt(minLot) : filters.minLot,
      maxLotSize: maxLot ? parseInt(maxLot) : filters.maxLot,
      maxHoaFee: maxHoa ? parseInt(maxHoa) : filters.maxHoa,
      hasGarage: hasGarage || Boolean(filters.hasGarage),
      hasPool: hasPool || Boolean(filters.hasPool),
      hasView: hasView || Boolean(filters.hasView),
      hasOceanView: hasOceanView || Boolean(filters.hasOceanView),
      isWaterfront: isWaterfront || Boolean(filters.isWaterfront),
      isNewConstruction: isNewConstruction || Boolean(filters.isNewConstruction),
      isSeniorCommunity: isSeniorCommunity || Boolean(filters.isSeniorCommunity),
      hasFireplace: hasFireplace || Boolean(filters.hasFireplace),
      priceReduced: priceReduced || Boolean(filters.priceReduced),
      openHouseDate: openHouseDate || filters.openHouseDate,
      maxLivingArea: maxSqft ? parseInt(maxSqft) : filters.maxSqft,
      minLivingArea: minSqft ? parseInt(minSqft) : filters.minSqft,
      sortBy: mapSort(sort || filters.sortBy || null),
      propertyCategory: resolvedCategory,
      daysListed: newest === "true" || filters.newest ? 21 : undefined,
      keywords: keywords || filters.keywords || undefined,
      locationKeywords: filters.locationKeywords,
    })
  }, [filters, isRent, searchParams])

  const { properties, loading, total, error } = useTrestlePropertiesIntegrated(
    legacyFilters,
    24, // limit (matches original page)
    currentPage // page
  )

  const resolvedTotal = loading && total === 0 ? initialTotal : total
  const totalPages = Math.ceil(resolvedTotal / 24)
  // Show initialProperties on first load, only switch to filtered results after user applies filters
  const displayProperties = (!hasAppliedFilters && initialProperties.length > 0) 
    ? initialProperties 
    : (loading ? initialProperties : properties)

  return (
    <div className="space-y-8">
      {/* FilterBar rendered here so it receives the real total from the API hook */}
      <FilterBar action={isRent ? "rent" : "buy"} total={loading || error ? undefined : resolvedTotal} />
      {loading ? (
        <PropertyGridSkeleton />
      ) : error ? (
        <div className="text-center py-20 space-y-4">
          <p className="text-[var(--coastal-text)] text-lg font-semibold">
            Current listing data is temporarily unavailable.
          </p>
          <p className="text-[var(--coastal-muted-text)] text-sm">
            Please try again shortly or ask the team about current availability.
          </p>
          <Link
            href="/contact?message=I%27d%20like%20help%20finding%20current%20listings."
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--coastal-primary)] px-5 py-2.5 font-semibold text-white hover:opacity-90"
          >
            Ask About Current Listings
          </Link>
        </div>
      ) : displayProperties.length === 0 ? (
        <div className="text-center py-20 space-y-6">
          <div className="space-y-3">
            <p className="text-[var(--coastal-muted-text)] text-lg">
              No properties found matching your criteria.
            </p>
            <p className="text-[var(--coastal-muted-text)] text-sm">
              Try adjusting your filters or browse all available properties.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => {
                router.push(pathname)
                setHasAppliedFilters(false)
                setCurrentPage(1)
              }}
              className="px-6 py-3 bg-[var(--coastal-primary)] text-white rounded-xl font-semibold hover:bg-[var(--coastal-secondary)] transition-colors duration-200"
            >
              Reset Filters
            </button>
            <div className="text-sm text-[var(--coastal-muted-text)]">
              <span className="font-medium">Suggestions:</span>
              <ul className="mt-2 space-y-1 text-left list-disc list-inside">
                <li>Remove price range restrictions</li>
                <li>Try different bedroom/bathroom counts</li>
                <li>Search in nearby cities or counties</li>
                <li>Browse all properties without filters</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {displayProperties.map((property: Property, index: number) => {
              const propertyKey = property.listing_key || property.id || `property-${index}`
              const insertAlert = showSaveSearch && index === Math.min(5, displayProperties.length - 1)

              return (
                <Fragment key={propertyKey}>
                  <PropertyCard property={property} />
                  {insertAlert && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <SaveSearchBannerClient filters={filters} resultCount={resolvedTotal} />
                    </div>
                  )}
                </Fragment>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={pageHref(searchParams, pathname, Math.max(1, currentPage - 1))}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>

                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNumber = i + 1
                    if (totalPages > 5) {
                      if (currentPage > 3) {
                        pageNumber = currentPage - 2 + i
                      }
                      if (pageNumber > totalPages) {
                        pageNumber = totalPages - (4 - i)
                      }
                    }

                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href={pageHref(searchParams, pathname, pageNumber)}
                          isActive={currentPage === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href={pageHref(searchParams, pathname, Math.min(totalPages, currentPage + 1))}
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function pageHref(searchParams: { toString(): string }, pathname: string, page: number): string {
  const params = new URLSearchParams(searchParams.toString())
  if (page <= 1) params.delete("page")
  else params.set("page", String(page))
  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}
