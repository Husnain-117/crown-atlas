"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useMemo } from "react"
import dynamic from "next/dynamic"

// Load the client-only CountyHighlightMap dynamically with SSR disabled so
// Leaflet (which depends on window) isn't evaluated during server builds.
// Using @ alias which is configured in webpack to resolve correctly
const CountyHighlightMap = dynamic(
  () => import("@/components/county-highlight-map"),
  { 
    ssr: false,
    loading: () => <div className="w-full h-[400px] bg-gray-100 animate-pulse rounded-lg" />
  }
)

interface IPropertyListingHeaderProps {
  // Simple mode props
  title?: string
  subtitle?: string
  // Full mode props
  totalProperties?: number
  currentPage?: number
  sortBy?: "recommended" | "price-asc" | "price-desc" | "date-desc" | "area-desc"
  propertyType?: string
  onSortChange?: (sort: "recommended" | "price-asc" | "price-desc" | "date-desc" | "area-desc") => void
  onBuyClick?: (type: "Residential" | "ResidentialLease") => void
}

export default function PropertyListingHeader({ 
  title, 
  subtitle, 
  totalProperties = 0, 
  currentPage = 1,
  sortBy = "recommended",
  onSortChange,
}: IPropertyListingHeaderProps) {
  const searchParams = useSearchParams()
  const startIndex = (currentPage - 1) * 12 + 1
  const endIndex = Math.min(startIndex + 11, totalProperties)

  // Extract county from URL parameters
  const countyName: string | null = useMemo(() => {
    // useSearchParams() can return null in some contexts, guard with fallback
    const params = searchParams ?? new URLSearchParams()
    const county = params.get("county")
    const location = params.get("location")
    const searchLocationType = params.get("searchLocationType")

    // Check if we have a county parameter or if location is a county
    if (county) {
      return county
    } else if (searchLocationType === "county" && location) {
      return location
    }
    return null
  }, [searchParams])

  return (
    <div className="coastal-section-light border-b border-[var(--coastal-border)] shadow-soft theme-transition">
      <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-10 md:py-14">
        <div className="flex flex-col gap-5 md:gap-6">
          <div className="text-center lg:text-left">
            <div className="mb-3 inline-flex items-center gap-3">
              <div className="w-8 h-[2px] bg-gradient-primary rounded-full"></div>
              <span className="text-[var(--coastal-primary)] font-semibold text-sm uppercase tracking-wider">Property Listings</span>
              <div className="w-8 h-[2px] bg-gradient-primary rounded-full"></div>
            </div>
            <h1 className="mb-3 font-display text-3xl font-bold text-[var(--coastal-text)] md:text-4xl lg:text-5xl theme-transition">
              {title || (
                <>
                  Search California
                  <span className="block text-gradient-luxury bg-clip-text text-transparent">Property Listings</span>
                </>
              )}
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-[var(--coastal-muted-text)] md:text-lg lg:mx-0 lg:text-xl theme-transition">
              {subtitle || "Compare current listing details, photos, prices, and property features from CRMLS-backed data."}
            </p>
          </div>

          {/* County Map Section - Only show when county is detected */}
          {countyName && (
            <div className="overflow-hidden rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)]/60 p-4 shadow-soft backdrop-blur-sm sm:p-6 theme-transition">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-[var(--coastal-text)] mb-2">
                  <span className="inline-flex items-center gap-2"><MapPin className="h-5 w-5" aria-hidden />{countyName} Properties</span>
                </h2>
                <p className="text-[var(--coastal-muted-text)] text-sm">
                  Exploring properties in {countyName}. The highlighted area shows the county boundary.
                </p>
              </div>
              <div className="w-full overflow-hidden">
                <CountyHighlightMap 
                  countyName={countyName}
                  height="400px"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {onSortChange && totalProperties !== undefined && (
            <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)]/60 p-4 shadow-soft backdrop-blur-sm sm:p-6 lg:flex-row lg:items-center theme-transition">
              <div className="flex items-center text-[var(--coastal-muted-text)] font-medium theme-transition">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--coastal-secondary)] rounded-full"></div>
                  <span className="text-sm sm:text-base">
                    Showing <span className="font-bold text-[var(--coastal-text)]">{startIndex}-{endIndex}</span> of <span className="font-bold text-[var(--coastal-text)]">{totalProperties.toLocaleString("en-US")}</span> properties
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Select value={sortBy} onValueChange={(value) => {
                  onSortChange(value as "recommended" | "price-asc" | "price-desc" | "date-desc" | "area-desc");
                }}>
                  <SelectTrigger className="h-11 w-[160px] rounded-lg border-[var(--coastal-border)] bg-[var(--surface)] text-sm font-semibold text-[var(--coastal-text)] shadow-soft transition-shadow duration-200 hover:shadow-medium md:w-[200px] theme-transition">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-[var(--coastal-border)] bg-[var(--surface)]/95 shadow-strong backdrop-blur-xl theme-transition">
                    <SelectItem value="recommended" className="rounded-md font-medium">Recommended</SelectItem>
                    <SelectItem value="price-asc" className="rounded-md font-medium">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc" className="rounded-md font-medium">Price: High to Low</SelectItem>
                    <SelectItem value="date-desc" className="rounded-md font-medium">Newest First</SelectItem>
                    <SelectItem value="area-desc" className="rounded-md font-medium">Largest Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
