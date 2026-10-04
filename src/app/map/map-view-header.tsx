"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, SlidersHorizontal, X, ChevronDown, ChevronUp, HelpCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import MapFilterSidebar from "./map-filter-sidebar"
import { useMediaQuery } from "@/hooks/use-media-query"
import SearchBar from "@/components/home/search-bar"

export interface FilterValues {
  city?: string
  keywords?: string
  propertyType?: string[]
  status?: string[]
  priceRange?: [number, number]
  beds?: string
  baths?: string
  areaRange?: [number, number]
  features?: string[]
}

interface MapViewHeaderProps {
  activeFilters?: FilterValues
  onFilterChange?: (filters: FilterValues) => void
  onClearFilters?: () => void
  onToggleFAQ?: () => void
  sortBy?: string
  onSortChange?: (value: string) => void
}

export default function MapViewHeader({
  activeFilters,
  onFilterChange,
  onClearFilters,
  onToggleFAQ,
  sortBy = "recommended",
  onSortChange,
}: MapViewHeaderProps) {
  const [open, setOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Hide expanded filters when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setShowFilters(false)
    }
  }, [isMobile])

  const handleFilterApply = (filters: FilterValues) => {
    if (onFilterChange) {
      onFilterChange(filters)
    }
    setOpen(false)
  }

  const handleClearFilter = (filterKey: keyof FilterValues) => {
    if (activeFilters && onFilterChange) {
      const newFilters = { ...activeFilters }
      delete newFilters[filterKey]
      onFilterChange(newFilters)
    }
  }

  const clearAllFilters = () => {
    if (onClearFilters) {
      onClearFilters()
    }
  }

  // Format price for display
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`
    } else {
      return `$${price}`
    }
  }

  // Format area for display
  const formatArea = (area: number) => {
    return `${area.toLocaleString()} sq ft`
  }

  // Check if there are any active filters
  const hasActiveFilters = activeFilters && Object.keys(activeFilters).length > 0
  const filterCount = hasActiveFilters ? Object.keys(activeFilters).length : 0

  return (
    <div className="bg-[var(--surface)] border-b border-[var(--coastal-border)] py-3 px-4">
      <div className="container mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <Link href="/properties">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-base md:text-lg font-semibold text-[var(--coastal-text)] whitespace-nowrap">Map View</h1>
        </div>

        {/* Compact Search Bar - centered */}
        <div className="flex-1 max-w-sm hidden md:block">
          <SearchBar defaultSearchMethod="map" compact />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* FAQ Button */}
          {onToggleFAQ && (
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={onToggleFAQ}>
              <HelpCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Help & FAQ</span>
            </Button>
          )}

          {/* Desktop Filter Button */}
          {!isMobile && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-[var(--coastal-primary)] text-white">
                      {filterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md p-0 z-[9998] bg-[var(--surface)]">
                <SheetHeader className="p-4 border-b border-[var(--coastal-border)] bg-[var(--surface)]">
                  <SheetTitle className="text-[var(--coastal-text)]">Filters</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-[calc(100vh-5rem)]">
                  <div className="flex-1 overflow-y-auto bg-[var(--bg)]">
                    <MapFilterSidebar
                      initialValues={activeFilters}
                      onApplyFilters={handleFilterApply}
                      onClearFilters={clearAllFilters}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-8 text-xs w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="date-desc">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="container mx-auto mt-2">
          {isMobile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Badge className="bg-[var(--coastal-primary)] text-white">{filterCount} Filters</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs ml-1"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? (
                    <>
                      Hide <ChevronUp className="h-3 w-3 ml-1" />
                    </>
                  ) : (
                    <>
                      Show <ChevronDown className="h-3 w-3 ml-1" />
                    </>
                  )}
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[var(--coastal-muted-text)]" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 items-center">
              {activeFilters.propertyType && activeFilters.propertyType.length > 0 && (
                <Badge variant="outline" className="bg-[var(--surface-muted)] flex items-center gap-1">
                  Type: {activeFilters.propertyType.join(", ")}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleClearFilter("propertyType")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {activeFilters.status && activeFilters.status.length > 0 && (
                <Badge variant="outline" className="bg-[var(--surface-muted)] flex items-center gap-1">
                  Status: {activeFilters.status.join(", ")}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleClearFilter("status")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {activeFilters.priceRange && (
                <Badge variant="outline" className="bg-[var(--surface-muted)] flex items-center gap-1">
                  Price: {formatPrice(activeFilters.priceRange[0])} - {formatPrice(activeFilters.priceRange[1])}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleClearFilter("priceRange")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {activeFilters.beds && (
                <Badge variant="outline" className="bg-[var(--surface-muted)] flex items-center gap-1">
                  Beds: {activeFilters.beds}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleClearFilter("beds")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {activeFilters.baths && (
                <Badge variant="outline" className="bg-[var(--surface-muted)] flex items-center gap-1">
                  Baths: {activeFilters.baths}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleClearFilter("baths")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {activeFilters.areaRange && (
                <Badge variant="outline" className="bg-[var(--surface-muted)] flex items-center gap-1">
                  Area: {formatArea(activeFilters.areaRange[0])} - {formatArea(activeFilters.areaRange[1])}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleClearFilter("areaRange")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {activeFilters.features && activeFilters.features.length > 0 && (
                <Badge variant="outline" className="bg-[var(--surface-muted)] flex items-center gap-1">
                  Features: {activeFilters.features.join(", ")}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleClearFilter("features")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
          )}

          {/* Mobile expanded filters */}
          {isMobile && showFilters && (
            <div className="flex flex-wrap gap-2 mt-2">
              {activeFilters.propertyType && activeFilters.propertyType.length > 0 && (
                <Badge variant="outline" className="bg-[var(--surface-muted)] flex items-center gap-1">
                  Type: {activeFilters.propertyType.join(", ")}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleClearFilter("propertyType")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {activeFilters.status && activeFilters.status.length > 0 && (
                <Badge variant="outline" className="bg-[var(--surface-muted)] flex items-center gap-1">
                  Status: {activeFilters.status.join(", ")}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleClearFilter("status")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {activeFilters.priceRange && (
                <Badge variant="outline" className="bg-[var(--surface-muted)] flex items-center gap-1">
                  Price: {formatPrice(activeFilters.priceRange[0])} - {formatPrice(activeFilters.priceRange[1])}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleClearFilter("priceRange")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {activeFilters.beds && (
                <Badge variant="outline" className="bg-[var(--surface-muted)] flex items-center gap-1">
                  Beds: {activeFilters.beds}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleClearFilter("beds")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {activeFilters.baths && (
                <Badge variant="outline" className="bg-[var(--surface-muted)] flex items-center gap-1">
                  Baths: {activeFilters.baths}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleClearFilter("baths")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {activeFilters.areaRange && (
                <Badge variant="outline" className="bg-[var(--surface-muted)] flex items-center gap-1">
                  Area: {formatArea(activeFilters.areaRange[0])} - {formatArea(activeFilters.areaRange[1])}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleClearFilter("areaRange")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {activeFilters.features && activeFilters.features.length > 0 && (
                <Badge variant="outline" className="bg-[var(--surface-muted)] flex items-center gap-1">
                  Features: {activeFilters.features.length} selected
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleClearFilter("features")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
