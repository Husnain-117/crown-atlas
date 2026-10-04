"use client"

import { FormEvent, useState, useRef, useEffect } from "react"
import { MapPin, Home, Map, Loader2, ChevronDown, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useAutoComplete } from "@/hooks/queries/useAutoComplete"

interface SearchBarProps {
  defaultSearchMethod?: "properties" | "map"
  compact?: boolean
  className?: string
  showToggle?: boolean
  hideTitle?: boolean
  hideFilters?: boolean
  variant?: string
}

type SearchMethod = "properties" | "map"

export default function SearchBar({ defaultSearchMethod = "properties", compact = false, className = "", showToggle = false, hideTitle = false, hideFilters = false, variant }: SearchBarProps) {
  const [searchType, setSearchType] = useState("all")
  const [location, setLocation] = useState("")
  // Advanced inline filters (Feature 1)
  const PRICE_OPTS = [
    { label: "Any price", min: 0, max: 0 },
    { label: "Under $1M", min: 0, max: 1_000_000 },
    { label: "$1M – $2M", min: 1_000_000, max: 2_000_000 },
    { label: "$2M – $3M", min: 2_000_000, max: 3_000_000 },
    { label: "$3M – $5M", min: 3_000_000, max: 5_000_000 },
    { label: "$5M+", min: 5_000_000, max: 0 },
  ]
  const BEDS_OPTS = ["Any", "1+", "2+", "3+", "4+", "5+"]
  const TYPE_OPTS = [
    { label: "All types", value: "all" },
    { label: "Home", value: "Residential" },
    { label: "Condo", value: "Condominium" },
    { label: "Townhouse", value: "Townhouse" },
    { label: "New Build", value: "NewBuild" },
  ]

  const [priceIndex, setPriceIndex] = useState(0)
  const [bedsFilter, setBedsFilter] = useState("Any")
  const [typeFilter, setTypeFilter] = useState("all")

  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const [searchMethod, setSearchMethod] = useState<SearchMethod>(defaultSearchMethod)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)

  const searchTypeOptions = [
    { value: "buy", label: "For Sale" },
    { value: "rent", label: "For Rent" },
    { value: "all", label: "All Properties" },
  ]

  // Use autocomplete hook
  const { data: autoCompleteResults, isLoading: isAutoCompleteLoading } = useAutoComplete(location)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    setIsSearching(true)

    try {
      const params = new URLSearchParams()
      if (location) {
        params.append("city", location)
        params.append("search", location)
      }
      if (searchType && searchType !== "all") {
        if (searchType === "buy") {
          params.append("status", "for_sale")
        } else if (searchType === "rent") {
          params.append("status", "for_rent")
        }
      }

      // Map advanced filters into /properties query params
      const price = PRICE_OPTS[priceIndex]
      if (price.min) params.append("minPrice", String(price.min))
      if (price.max) params.append("maxPrice", String(price.max))

      if (bedsFilter !== "Any") {
        // strip "+" and use as "3" etc. PropertiesPage already parses "3+"
        params.append("beds", bedsFilter.replace("+", ""))
      }

      if (typeFilter && typeFilter !== "all") {
        params.append("propertyType", typeFilter)
      }

      if (searchMethod === "properties") {
        router.push(`/properties?${params.toString()}`)
      } else if (searchMethod === "map") {
        router.push(`/map?${params.toString()}`)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search type change - apply filter immediately for map view
  const handleSearchTypeChange = (value: string) => {
    setSearchType(value)
    setDropdownOpen(false)

    // If we're on the map page, apply filter immediately
    if (searchMethod === "map") {
      const params = new URLSearchParams()
      if (location) {
        params.append("city", location)
        params.append("search", location)
      }
      if (value && value !== "all") {
        if (value === "buy") {
          params.append("status", "for_sale")
        } else if (value === "rent") {
          params.append("status", "for_rent")
        }
      }
      router.push(`/map?${params.toString()}`)
    }
  }

  const handleAutoCompleteClick = (cityName: string) => {
    setLocation(cityName)

    const params = new URLSearchParams()
    params.append("city", cityName)
    params.append("search", cityName)

    if (searchType && searchType !== "all") {
      params.append("searchType", searchType)
      if (searchType === "buy") {
        params.append("status", "for_sale")
      } else if (searchType === "rent") {
        params.append("status", "for_rent")
      }
    }

    if (searchMethod === "properties") {
      router.push(`/properties?${params.toString()}`)
    } else if (searchMethod === "map") {
      router.push(`/map?${params.toString()}`)
    }
  }

  // Compact mode for inline header usage (e.g. map page header)
  if (compact) {
    return (
      <div className="w-full relative z-[100]">
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-[var(--surface)] rounded-full text-left text-[var(--coastal-text)] border border-[var(--coastal-border)] shadow-sm px-2 py-1 w-full gap-0 relative"
        >
          <div className="relative flex items-center pr-1.5 border-r border-[var(--coastal-border)]" ref={dropdownRef}>
            <button
              type="button"
              className="flex min-h-11 min-w-[70px] cursor-pointer items-center rounded-md bg-transparent px-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coastal-secondary)]"
              onClick={() => setDropdownOpen(v => !v)}
            >
              <span className="truncate">{searchTypeOptions.find(opt => opt.value === searchType)?.label}</span>
              <svg className="w-3 h-3 ml-1 text-[var(--coastal-muted-text)] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 top-9 z-[200] w-44 bg-[var(--surface)] rounded-xl shadow-2xl border border-[var(--coastal-border)] py-1">
                {searchTypeOptions.map((opt, idx) => (
                  <div key={opt.value}>
                    <button
                      type="button"
                      className={`flex min-h-11 w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-[var(--surface-muted)] ${searchType === opt.value ? 'font-semibold' : ''}`}
                      onClick={() => handleSearchTypeChange(opt.value)}
                    >
                      {opt.label}
                      {searchType === opt.value && (
                        <svg className="w-4 h-4 text-[var(--coastal-secondary)]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </button>
                    {idx < searchTypeOptions.length - 1 && <div className="border-t border-[var(--coastal-border)] mx-3" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center flex-1 px-1.5 relative" ref={inputContainerRef}>
            <MapPin className="h-3.5 w-3.5 text-[var(--coastal-muted-text)] mr-1.5 flex-shrink-0" />
            <Input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Search city..."
              aria-label="Search by city"
              className="bg-transparent border-0 focus:ring-0 focus:border-0 text-xs h-7 w-full px-0"
              style={{ boxShadow: 'none' }}
            />
            {(autoCompleteResults || isAutoCompleteLoading) && location && (
              <div
                className="absolute left-0 right-0 top-full mt-1 bg-[var(--surface)] border border-[var(--coastal-border)] rounded-xl shadow-2xl z-[99999] max-h-[300px] overflow-y-auto"
                style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)', minWidth: '250px' }}
              >
                {isAutoCompleteLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--coastal-secondary)] mr-2" />
                    <span className="text-[var(--coastal-muted-text)] text-xs">Searching...</span>
                  </div>
                )}

                {!isAutoCompleteLoading && autoCompleteResults && autoCompleteResults.length > 0 && (
                  <div className="py-1">
                    <div className="px-3 pt-2 pb-1 text-[var(--coastal-muted-text)] font-bold text-[10px] tracking-wide">CITIES</div>
                    {autoCompleteResults.map((result, index) => {
                      const cityName = result.value.city;
                      const propertyCount = result.value.propertyCount || 0;

                      return (
                        <button
                          type="button"
                          key={index}
                          className="min-h-11 w-full cursor-pointer px-3 py-2 text-left transition-colors hover:bg-[var(--surface-muted)]"
                          onClick={() => handleAutoCompleteClick(cityName)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-medium text-[var(--coastal-text)] text-sm">{cityName}</div>
                            {propertyCount > 0 && (
                              <span className="text-[10px] bg-[var(--surface-muted)] text-[var(--coastal-muted-text)] px-1.5 py-0.5 rounded-full">
                                {propertyCount.toLocaleString("en-US")}
                              </span>
                            )}
                          </div>
                          <div className="text-[var(--coastal-muted-text)] text-xs">City</div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {!isAutoCompleteLoading && autoCompleteResults && autoCompleteResults.length === 0 && (
                  <div className="px-3 py-4 text-center">
                    <div className="text-[var(--coastal-muted-text)] text-xs">No results found</div>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="flex size-11 cursor-pointer items-center justify-center rounded-md border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coastal-secondary)]"
            disabled={isSearching}
            style={{ background: 'none' }}
            aria-label="Search properties"
          >
            <Search aria-hidden="true" className="h-4 w-4 text-[var(--coastal-primary)]" strokeWidth={2.5} />
          </button>
        </form>
      </div>
    )
  }

  // Unified variant (desktop hero with inline dropdown - matches Image 2)
  if (variant === 'unified') {
    return (
      <div className={`w-full relative z-[100] ${className}`}>
        {showToggle && (
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-full p-1 flex items-center">
              <button 
                type="button"
                onClick={() => {
                  setSearchMethod("properties")
                  router.push('/properties')
                }}
                aria-pressed={searchMethod === "properties"}
                className={`flex min-h-11 items-center gap-2 rounded-full px-6 py-2 text-sm font-bold transition-all ${searchMethod === 'properties' ? 'bg-[#0F2A44] text-white shadow-md' : 'text-[#0F2A44] hover:bg-gray-200'}`}
              >
                <Home className="w-4 h-4" />
                List
              </button>
              <button 
                type="button"
                onClick={() => {
                  setSearchMethod("map")
                  router.push('/map')
                }}
                aria-pressed={searchMethod === "map"}
                className={`flex min-h-11 items-center gap-2 rounded-full px-6 py-2 text-sm font-bold transition-all ${searchMethod === 'map' ? 'bg-[#0F2A44] text-white shadow-md' : 'text-[#0F2A44] hover:bg-gray-200'}`}
              >
                <Map className="w-4 h-4" />
                Map
              </button>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSearch}
          className="flex items-center bg-white rounded-full shadow-2xl border border-gray-200 overflow-hidden"
        >
          {/* Property Type Dropdown */}
          <div className="relative border-r border-gray-200">
            <select
              value={searchType}
              onChange={(e) => handleSearchTypeChange(e.target.value)}
              className="appearance-none bg-transparent border-none pl-6 pr-10 py-4 text-sm font-medium text-gray-700 cursor-pointer focus:outline-none focus:ring-0"
            >
              <option value="all">All Properties</option>
              <option value="buy">For Sale</option>
              <option value="rent">For Rent</option>
              <option value="new_build">New Build</option>
              <option value="open_house">Open Homes</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Location Input with Icon */}
          <div className="relative flex-1 flex items-center" ref={inputContainerRef}>
            <MapPin className="absolute left-4 w-5 h-5 text-gray-400" />
            <Input
              id="hero-search-input"
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder='City or ZIP Code (e.g., "Los Angeles" or "90001")'
              aria-label="Search by city or ZIP code"
              className="w-full bg-transparent border-none pl-12 pr-4 py-4 text-base focus:ring-0 focus:outline-none text-gray-700 placeholder:text-gray-500"
              style={{ fontSize: '16px' }}
            />
            
            {/* Autocomplete Dropdown */}
            {(autoCompleteResults || isAutoCompleteLoading) && location && (
              <div
                className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[99999] max-h-[300px] overflow-y-auto"
              >
                {isAutoCompleteLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--coastal-secondary)] mr-2" />
                    <span className="text-gray-500 text-xs">Searching...</span>
                  </div>
                )}

                {!isAutoCompleteLoading && autoCompleteResults && autoCompleteResults.length > 0 && (
                  <div className="py-1">
                    <div className="px-3 pt-2 pb-1 text-gray-500 font-bold text-[10px] tracking-wide">CITIES</div>
                    {autoCompleteResults.map((result, index) => {
                      const cityName = result.value.city;
                      const propertyCount = result.value.propertyCount || 0;

                      return (
                        <button
                          type="button"
                          key={index}
                          className="min-h-11 w-full cursor-pointer px-3 py-2 text-left transition-colors hover:bg-gray-50"
                          onClick={() => handleAutoCompleteClick(cityName)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-medium text-gray-800 text-sm">{cityName}</div>
                            {propertyCount > 0 && (
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                                {propertyCount.toLocaleString("en-US")}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {!isAutoCompleteLoading && autoCompleteResults && autoCompleteResults.length === 0 && (
                  <div className="px-3 py-4 text-center">
                    <div className="text-gray-500 text-xs">No results found</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="flex-shrink-0 w-14 h-14 bg-[#0F2A44] flex items-center justify-center hover:bg-[#1a3a52] transition-colors m-1 rounded-full"
            disabled={isSearching}
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
        </form>
      </div>
    )
  }

  // Full-size search bar (home page, etc.)
  return (
    <div className={`search-card relative z-[100] w-full rounded-lg border border-gray-200 !bg-white p-3 shadow-xl dark:!bg-white sm:p-5 sm:shadow-2xl ${className}`}>
      {showToggle && (
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 rounded-full p-1 flex items-center">
            <button 
              type="button"
              onClick={() => {
                setSearchMethod("properties")
                router.push('/properties')
              }}
              aria-pressed={searchMethod === "properties"}
              className={`flex min-h-11 items-center gap-2 rounded-full px-6 py-2 text-sm font-bold transition-all ${searchMethod === 'properties' ? 'bg-[#0F2A44] text-white shadow-md' : 'text-[#0F2A44] hover:bg-gray-200'}`}
            >
              <Home className="w-4 h-4" />
              List
            </button>
            <button 
              type="button"
              onClick={() => {
                setSearchMethod("map")
                router.push('/map')
              }}
              aria-pressed={searchMethod === "map"}
              className={`flex min-h-11 items-center gap-2 rounded-full px-6 py-2 text-sm font-bold transition-all ${searchMethod === 'map' ? 'bg-[#0F2A44] text-white shadow-md' : 'text-[#0F2A44] hover:bg-gray-200'}`}
            >
              <Map className="w-4 h-4" />
              Map
            </button>
          </div>
        </div>
      )}

      {!hideTitle && (
        <div className="text-[10px] sm:text-xs font-bold text-gray-600 tracking-wider mb-2.5 sm:mb-3 uppercase">
          Search by City, Zip, or Neighborhood
        </div>
      )}
      
      <form
        onSubmit={handleSearch}
        className="flex gap-2 sm:gap-3 relative"
      >
        <div className="relative flex-1" ref={inputContainerRef}>
          <Input
            id="mobile-search-input"
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="La Jolla, Newport Beach..."
            aria-label="Search by city, ZIP code, or neighborhood"
            className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#0F2340] sm:h-12 sm:px-4 sm:text-base"
            style={{ fontSize: '16px' }}
          />
          
          {/* Autocomplete Dropdown */}
          {(autoCompleteResults || isAutoCompleteLoading) && location && (
            <div
              className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[99999] max-h-[300px] overflow-y-auto"
            >
              {isAutoCompleteLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-[#0F2340] mr-2" />
                  <span className="text-gray-500 text-xs">Searching...</span>
                </div>
              )}

              {!isAutoCompleteLoading && autoCompleteResults && autoCompleteResults.length > 0 && (
                <div className="py-1">
                  <div className="px-3 pt-2 pb-1 text-gray-500 font-bold text-[10px] tracking-wide">CITIES</div>
                  {autoCompleteResults.map((result, index) => {
                    const cityName = result.value.city;
                    const propertyCount = result.value.propertyCount || 0;

                    return (
                      <button
                        type="button"
                        key={index}
                        className="min-h-11 w-full cursor-pointer px-3 py-2 text-left transition-colors hover:bg-gray-50"
                        onClick={() => handleAutoCompleteClick(cityName)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-gray-900 text-sm">{cityName}</div>
                          {propertyCount > 0 && (
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                              {propertyCount.toLocaleString("en-US")}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {!isAutoCompleteLoading && autoCompleteResults && autoCompleteResults.length === 0 && (
                <div className="px-3 py-4 text-center">
                  <div className="text-gray-500 text-xs">No results found</div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[#0F2340] shadow-lg transition-colors hover:bg-[#1a3a52] active:scale-95 sm:h-12 sm:w-12"
          disabled={isSearching}
          aria-label="Search"
        >
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-[#38bdf8] animate-spin" />
          ) : (
            <Search aria-hidden="true" className="h-5 w-5 text-[#38bdf8]" strokeWidth={2.5} />
          )}
        </button>
      </form>

      {/* Advanced inline filter pills (Feature 1) – desktop / tablet */}
      {!hideFilters && (
        <div className="hidden sm:flex flex-wrap gap-2 mt-1">
          {/* Price pill */}
          <button
            type="button"
            onClick={() => setPriceIndex((priceIndex + 1) % PRICE_OPTS.length)}
            className={`min-h-11 rounded-full border px-3 py-1.5 text-xs transition-all sm:text-sm
              ${priceIndex === 0
                ? "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]"
                : "bg-[#0F2340] text-white border-[#0F2340] shadow-sm"}`}
          >
            {PRICE_OPTS[priceIndex].label}
          </button>

          {/* Beds pill */}
          <div className="inline-flex items-center gap-1">
            {BEDS_OPTS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setBedsFilter(bedsFilter === opt ? "Any" : opt)}
                className={`min-h-11 rounded-full border px-3 py-1.5 text-xs transition-all sm:text-sm
                  ${bedsFilter === opt
                    ? "bg-[#0F2340] text-white border-[#0F2340] shadow-sm"
                    : "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]"}`}
              >
                Beds {opt === "Any" ? "" : opt}
              </button>
            ))}
          </div>

          {/* Type pill */}
          <div className="inline-flex items-center gap-1">
            {TYPE_OPTS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTypeFilter(typeFilter === opt.value ? "all" : opt.value)}
                className={`min-h-11 rounded-full border px-3 py-1.5 text-xs transition-all sm:text-sm
                  ${typeFilter === opt.value
                    ? "bg-[#0F2340] text-white border-[#0F2340] shadow-sm"
                    : "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
