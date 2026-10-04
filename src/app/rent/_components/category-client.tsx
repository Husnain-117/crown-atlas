"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useTrestlePropertiesIntegrated } from "@/hooks/useTrestlePropertiesIntegrated"
import { PropertyCard } from "@/components/property-card"
import { Property } from "@/interfaces"
import FilterBar from "@/components/city/FilterBar"

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

interface CategoryClientProps {
  initialProperties: Property[]
  propertyCategory: string[]
  categoryName: string
  defaultFilters?: {
    minPrice?: number
    maxPrice?: number
    city?: string
  }
}

export default function CategoryClient({ initialProperties, propertyCategory, categoryName, defaultFilters }: CategoryClientProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  // Sync filters with URL search params (FilterBar uses URL params)
  const [legacyFilters, setLegacyFilters] = useState<{
    status: string;
    propertyType: string;
    minPrice: number | undefined;
    maxPrice: number | undefined;
    city: string;
    county: string;
    minBathrooms: number | undefined;
    minBedrooms: number | undefined;
    yearBuilt: number | undefined;
    maxLivingArea: number | undefined;
    minLivingArea: number | undefined;
    sortBy: "recommended" | "price-asc" | "price-desc" | "date-desc" | "area-desc";
    propertyCategory: string;
    daysListed: number | undefined;
    keywords: string | undefined;
    minLotSize?: number;
    maxLotSize?: number;
    minYearBuilt?: number;
    maxYearBuilt?: number;
    maxHoaFee?: number;
    hasGarage?: boolean;
    hasPool?: boolean;
    isWaterfront?: boolean;
    priceReduced?: boolean;
    openHouseDate?: string;
  }>({
    status: "for_rent",
    propertyType: "ResidentialLease",
    minPrice: defaultFilters?.minPrice,
    maxPrice: defaultFilters?.maxPrice,
    city: defaultFilters?.city || "",
    county: "",
    minBathrooms: undefined,
    minBedrooms: undefined,
    yearBuilt: undefined,
    maxLivingArea: undefined,
    minLivingArea: undefined,
    sortBy: "recommended",
    propertyCategory: propertyCategory.join(","),
    daysListed: undefined,
    keywords: undefined
  })

  // Track if user has explicitly applied filters (not just initial page load)
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false)

  // Classify a search-bar term to the correct filter parameter:
  //   city name (letters/spaces/hyphens) → { city } exact match on city column
  //   ZIP code  (5 digits)              → { keywords } LIKE on postal_code
  //   address   (starts with house num) → { keywords } LIKE on address columns
  const classifySearchTerm = (term: string): { city?: string; keywords?: string } => {
    const t = term.trim()
    if (!t) return {}
    if (/^\d{5}(-\d{4})?$/.test(t)) return { keywords: t }  // ZIP code
    if (/^\d+\s/.test(t))           return { keywords: t }  // Street address
    return { city: t }                                        // City / neighborhood
  }

  // Map FilterBar type value → propertyCategory (same logic as buy pages).
  // Rent condos/townhouses are also stored as property_sub_type, so we must
  // use propertyCategory; setting propertyType='Condominium' returns 0 results.
  const mapTypeToCategory = (t: string): string => {
    if (t === "Residential") return "house"
    if (t === "Condominium") return "condo"
    if (t === "Townhouse") return "townhouse"
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
    const isWaterfront = searchParams.get("waterfront") === "true"
    const priceReduced = searchParams.get("priceReduced") === "true"
    const openHouseDate = searchParams.get("openHouseDate") || undefined
    const keywords = searchParams.get("keywords")

    if (search || minPrice || maxPrice || beds || baths || type || sort || newest || minSqft || maxSqft || minLot || maxLot || minYear || maxYear || maxHoa || hasGarage || hasPool || isWaterfront || priceReduced || openHouseDate || keywords) {
      setHasAppliedFilters(true)
      
      // Map FilterBar sort values to legacy format
      const mapSort = (s: string | null): "recommended" | "price-asc" | "price-desc" | "date-desc" | "area-desc" => {
        if (s === "updated") return "date-desc"
        if (s === "newest") return "date-desc"
        if (s === "price_asc") return "price-asc"
        if (s === "price_desc") return "price-desc"
        if (s === "area_desc") return "area-desc"
        return "recommended"
      }

      // Resolve propertyCategory from the type URL param.
      // When Any Type (type=null), fall back to the page's default category.
      const resolvedCategory = type
        ? mapTypeToCategory(type)
        : propertyCategory.join(",")

      // Route search-bar term: city name → city filter; ZIP/address → keywords
      const classified = classifySearchTerm(search || "")

      setLegacyFilters(prev => ({
        ...prev,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        minBedrooms: beds ? parseInt(beds) : undefined,
        minBathrooms: baths ? parseInt(baths) : undefined,
        // Always keep status=for_rent and propertyType=ResidentialLease for rent pages —
        // sub-type discrimination is done via propertyCategory.
        status: "for_rent",
        propertyType: "ResidentialLease",
        propertyCategory: resolvedCategory,
        sortBy: mapSort(sort),
        daysListed: newest === "true" ? 21 : undefined,
        minLivingArea: minSqft ? parseInt(minSqft) : undefined,
        maxLivingArea: maxSqft ? parseInt(maxSqft) : undefined,
        minLotSize: minLot ? parseInt(minLot) : undefined,
        maxLotSize: maxLot ? parseInt(maxLot) : undefined,
        minYearBuilt: minYear ? parseInt(minYear) : undefined,
        maxYearBuilt: maxYear ? parseInt(maxYear) : undefined,
        maxHoaFee: maxHoa ? parseInt(maxHoa) : undefined,
        hasGarage,
        hasPool,
        isWaterfront,
        priceReduced,
        openHouseDate,
        city: classified.city || "",
        county: search ? "" : prev.county,
        keywords: classified.keywords || keywords || undefined,
      }))
    }
  }, [searchParams, propertyCategory])

  const { properties, loading, total, error } = useTrestlePropertiesIntegrated(
    legacyFilters,
    12, // limit
    currentPage // page
  )

  const totalPages = Math.ceil(total / 12)
  // Show initialProperties on first load, only switch to filtered results after user applies filters
  // This prevents empty state on page load due to restrictive default filters
  const displayProperties = (!hasAppliedFilters && initialProperties.length > 0) 
    ? initialProperties 
    : (loading ? initialProperties : properties)

  return (
    <div className="min-h-screen bg-[var(--bg)] theme-transition">
      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <FilterBar action="rent" total={total} />
        </div>

        {loading ? (
          <PropertyGridSkeleton />
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-[var(--coastal-muted-text)] text-lg">
              Error loading properties. Please try again later.
            </p>
          </div>
        ) : displayProperties.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <div className="space-y-3">
              <p className="text-[var(--coastal-muted-text)] text-lg">
                No {categoryName} properties found matching your criteria.
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
                  <li>Browse all {categoryName} properties without filters</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {displayProperties.map((property: Property, index: number) => (
                <PropertyCard key={property.listing_key || property.id || index} property={property} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage > 1) {
                            setCurrentPage(prev => prev - 1)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }
                        }}
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
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setCurrentPage(pageNumber)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            isActive={currentPage === pageNumber}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage < totalPages) {
                            setCurrentPage(prev => prev + 1)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }
                        }}
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
    </div>
  )
}
