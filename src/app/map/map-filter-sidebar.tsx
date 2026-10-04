"use client"

// Map filter sidebar with city and keyword search functionality
import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Home, Building, MapPin, Wifi, Car, Waves, Trees, Utensils, Dumbbell, Search } from "lucide-react"
import type { FilterValues } from "./map-view-header"

interface MapFilterSidebarProps {
  initialValues?: FilterValues
  onApplyFilters?: (filters: FilterValues) => void
  onClearFilters?: () => void
  isMobile?: boolean
}

export default function MapFilterSidebar({
  initialValues,
  onApplyFilters,
  onClearFilters,
  isMobile = false,
}: MapFilterSidebarProps) {
  // Initialize state with initial values or defaults
  const [propertyTypes, setPropertyTypes] = useState<string[]>(initialValues?.propertyType || [])
  const [statusFilters, setStatusFilters] = useState<string[]>(initialValues?.status || [])
  const [priceRange, setPriceRange] = useState<[number, number]>(initialValues?.priceRange || [0, 50000000])
  const [bedsFilter, setBedsFilter] = useState<string>(initialValues?.beds || "Any")
  const [bathsFilter, setBathsFilter] = useState<string>(initialValues?.baths || "Any")
  const [areaRange, setAreaRange] = useState<[number, number]>(initialValues?.areaRange || [0, 10000])
  const [featuresFilter, setFeaturesFilter] = useState<string[]>(initialValues?.features || [])
  const [citySearch, setCitySearch] = useState<string>(initialValues?.city || "")
  const [keywordSearch, setKeywordSearch] = useState<string>(initialValues?.keywords || "")

  // Update state when initialValues change
  useEffect(() => {
    if (initialValues) {
      if (initialValues.propertyType) setPropertyTypes(initialValues.propertyType)
      if (initialValues.status) setStatusFilters(initialValues.status)
      if (initialValues.priceRange) setPriceRange(initialValues.priceRange)
      if (initialValues.beds) setBedsFilter(initialValues.beds)
      if (initialValues.baths) setBathsFilter(initialValues.baths)
      if (initialValues.areaRange) setAreaRange(initialValues.areaRange)
      if (initialValues.features) setFeaturesFilter(initialValues.features)
      if (initialValues.city) setCitySearch(initialValues.city)
      if (initialValues.keywords) setKeywordSearch(initialValues.keywords)
    }
  }, [initialValues])

  const togglePropertyType = (type: string) => {
    setPropertyTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const toggleStatus = (status: string) => {
    setStatusFilters((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const toggleFeature = (feature: string) => {
    setFeaturesFilter((prev) => (prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]))
  }

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      const filters: FilterValues = {}

      if (citySearch.trim()) filters.city = citySearch.trim()
      if (keywordSearch.trim()) filters.keywords = keywordSearch.trim()
      if (propertyTypes.length > 0) filters.propertyType = propertyTypes
      if (statusFilters.length > 0) filters.status = statusFilters
      if (priceRange[0] > 0 || priceRange[1] < 50000000) filters.priceRange = priceRange
      if (bedsFilter !== "Any") filters.beds = bedsFilter
      if (bathsFilter !== "Any") filters.baths = bathsFilter
      if (areaRange[0] > 0 || areaRange[1] < 10000) filters.areaRange = areaRange
      if (featuresFilter.length > 0) filters.features = featuresFilter

      onApplyFilters(filters)
    }
  }

  const handleClearFilters = () => {
    setCitySearch("")
    setKeywordSearch("")
    setPropertyTypes([])
    setStatusFilters([])
    setPriceRange([0, 50000000])
    setBedsFilter("Any")
    setBathsFilter("Any")
    setAreaRange([0, 10000])
    setFeaturesFilter([])

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

  return (
    <div className="bg-white dark:bg-slate-900 overflow-hidden">
      <div className={isMobile ? "px-4 py-2" : "p-4"}>
        {!isMobile && (
          <>
            <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Filter Properties</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Refine your map results</p>
          </>
        )}
      </div>

      <div className={isMobile ? "px-4 pb-4" : "p-4 max-h-[calc(100vh-180px)] overflow-y-auto"}>
        {/* Search Section */}
        <div className="space-y-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
          {/* City Search */}
          <div className="space-y-2">
            <Label htmlFor="city-search" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              City
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                id="city-search"
                type="text"
                placeholder="e.g., Malibu, Venice, Santa Monica"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Keyword Search */}
          <div className="space-y-2">
            <Label htmlFor="keyword-search" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Keywords
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                id="keyword-search"
                type="text"
                placeholder="Address, ZIP code, or MLS number"
                value={keywordSearch}
                onChange={(e) => setKeywordSearch(e.target.value)}
                className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        <Accordion
          type="multiple"
          defaultValue={["category", "status", "price", "bedsBaths", "features"]}
          className="space-y-2"
        >
          {/* Property Type */}
          <AccordionItem value="category" className="border rounded-lg overflow-hidden border-slate-200 dark:border-slate-700">
            <AccordionTrigger className="text-base font-medium px-4 py-3 hover:no-underline text-slate-900 dark:text-slate-100">
              Property Type
              {propertyTypes.length > 0 && (
                <Badge variant="outline" className="ml-2 bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100">
                  {propertyTypes.length}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div
                  className={`flex flex-col items-center gap-1 p-2 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-slate-200 dark:border-slate-700 ${
                    propertyTypes.includes("Homes") ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600" : ""
                  }`}
                  onClick={() => {
                    togglePropertyType("Homes")
                    // Apply filters immediately
                    setTimeout(() => {
                      const updatedFilters: FilterValues = {
                        propertyType: propertyTypes.includes("Homes") 
                          ? propertyTypes.filter(t => t !== "Homes")
                          : [...propertyTypes, "Homes"],
                        status: statusFilters.length > 0 ? statusFilters : undefined,
                        priceRange: priceRange[0] > 0 || priceRange[1] < 50000000 ? priceRange : undefined,
                        beds: bedsFilter !== "Any" ? bedsFilter : undefined,
                        baths: bathsFilter !== "Any" ? bathsFilter : undefined,
                        areaRange: areaRange[0] > 0 || areaRange[1] < 10000 ? areaRange : undefined,
                        features: featuresFilter.length > 0 ? featuresFilter : undefined,
                      }
                      if (onApplyFilters) onApplyFilters(updatedFilters)
                    }, 0)
                  }}
                >
                  <Home className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <span className="text-xs text-center text-slate-900 dark:text-slate-100">Homes</span>
                </div>
                <div
                  className={`flex flex-col items-center gap-1 p-2 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-slate-200 dark:border-slate-700 ${
                    propertyTypes.includes("Condos") ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600" : ""
                  }`}
                  onClick={() => {
                    togglePropertyType("Condos")
                    setTimeout(() => {
                      const updatedFilters: FilterValues = {
                        propertyType: propertyTypes.includes("Condos") 
                          ? propertyTypes.filter(t => t !== "Condos")
                          : [...propertyTypes, "Condos"],
                        status: statusFilters.length > 0 ? statusFilters : undefined,
                        priceRange: priceRange[0] > 0 || priceRange[1] < 50000000 ? priceRange : undefined,
                        beds: bedsFilter !== "Any" ? bedsFilter : undefined,
                        baths: bathsFilter !== "Any" ? bathsFilter : undefined,
                        areaRange: areaRange[0] > 0 || areaRange[1] < 10000 ? areaRange : undefined,
                        features: featuresFilter.length > 0 ? featuresFilter : undefined,
                      }
                      if (onApplyFilters) onApplyFilters(updatedFilters)
                    }, 0)
                  }}
                >
                  <Building className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <span className="text-xs text-center text-slate-900 dark:text-slate-100">Condos</span>
                </div>
                <div
                  className={`flex flex-col items-center gap-1 p-2 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-slate-200 dark:border-slate-700 ${
                    propertyTypes.includes("Townhouses") ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600" : ""
                  }`}
                  onClick={() => {
                    togglePropertyType("Townhouses")
                    setTimeout(() => {
                      const updatedFilters: FilterValues = {
                        propertyType: propertyTypes.includes("Townhouses") 
                          ? propertyTypes.filter(t => t !== "Townhouses")
                          : [...propertyTypes, "Townhouses"],
                        status: statusFilters.length > 0 ? statusFilters : undefined,
                        priceRange: priceRange[0] > 0 || priceRange[1] < 50000000 ? priceRange : undefined,
                        beds: bedsFilter !== "Any" ? bedsFilter : undefined,
                        baths: bathsFilter !== "Any" ? bathsFilter : undefined,
                        areaRange: areaRange[0] > 0 || areaRange[1] < 10000 ? areaRange : undefined,
                        features: featuresFilter.length > 0 ? featuresFilter : undefined,
                      }
                      if (onApplyFilters) onApplyFilters(updatedFilters)
                    }, 0)
                  }}
                >
                  <Building className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <span className="text-xs text-center text-slate-900 dark:text-slate-100">Townhouses</span>
                </div>
                <div
                  className={`flex flex-col items-center gap-1 p-2 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-slate-200 dark:border-slate-700 ${
                    propertyTypes.includes("Manufactured") ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600" : ""
                  }`}
                  onClick={() => {
                    togglePropertyType("Manufactured")
                    setTimeout(() => {
                      const updatedFilters: FilterValues = {
                        propertyType: propertyTypes.includes("Manufactured") 
                          ? propertyTypes.filter(t => t !== "Manufactured")
                          : [...propertyTypes, "Manufactured"],
                        status: statusFilters.length > 0 ? statusFilters : undefined,
                        priceRange: priceRange[0] > 0 || priceRange[1] < 50000000 ? priceRange : undefined,
                        beds: bedsFilter !== "Any" ? bedsFilter : undefined,
                        baths: bathsFilter !== "Any" ? bathsFilter : undefined,
                        areaRange: areaRange[0] > 0 || areaRange[1] < 10000 ? areaRange : undefined,
                        features: featuresFilter.length > 0 ? featuresFilter : undefined,
                      }
                      if (onApplyFilters) onApplyFilters(updatedFilters)
                    }, 0)
                  }}
                >
                  <Home className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <span className="text-xs text-center text-slate-900 dark:text-slate-100">Manufactured</span>
                </div>
                <div
                  className={`flex flex-col items-center gap-1 p-2 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-slate-200 dark:border-slate-700 ${
                    propertyTypes.includes("Land") ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600" : ""
                  }`}
                  onClick={() => {
                    togglePropertyType("Land")
                    setTimeout(() => {
                      const updatedFilters: FilterValues = {
                        propertyType: propertyTypes.includes("Land") 
                          ? propertyTypes.filter(t => t !== "Land")
                          : [...propertyTypes, "Land"],
                        status: statusFilters.length > 0 ? statusFilters : undefined,
                        priceRange: priceRange[0] > 0 || priceRange[1] < 50000000 ? priceRange : undefined,
                        beds: bedsFilter !== "Any" ? bedsFilter : undefined,
                        baths: bathsFilter !== "Any" ? bathsFilter : undefined,
                        areaRange: areaRange[0] > 0 || areaRange[1] < 10000 ? areaRange : undefined,
                        features: featuresFilter.length > 0 ? featuresFilter : undefined,
                      }
                      if (onApplyFilters) onApplyFilters(updatedFilters)
                    }, 0)
                  }}
                >
                  <MapPin className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <span className="text-xs text-center text-slate-900 dark:text-slate-100">Land</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Status */}
          <AccordionItem value="status" className="border rounded-lg overflow-hidden border-slate-200 dark:border-slate-700">
            <AccordionTrigger className="text-base font-medium px-4 py-3 hover:no-underline text-slate-900 dark:text-slate-100">
              Status
              {statusFilters.length > 0 && (
                <Badge variant="outline" className="ml-2 bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100">
                  {statusFilters.length}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div
                  className={`flex items-center justify-center gap-2 p-3 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-slate-200 dark:border-slate-700 ${
                    statusFilters.includes("For Sale") ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600" : ""
                  }`}
                  onClick={() => toggleStatus("For Sale")}
                >
                  <Checkbox checked={statusFilters.includes("For Sale")} className="pointer-events-none" />
                  <Label className="text-sm cursor-pointer text-slate-900 dark:text-slate-100">For Sale</Label>
                </div>
                <div
                  className={`flex items-center justify-center gap-2 p-3 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-slate-200 dark:border-slate-700 ${
                    statusFilters.includes("For Rent") ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600" : ""
                  }`}
                  onClick={() => toggleStatus("For Rent")}
                >
                  <Checkbox checked={statusFilters.includes("For Rent")} className="pointer-events-none" />
                  <Label className="text-sm cursor-pointer text-slate-900 dark:text-slate-100">For Rent</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Price Range */}
          <AccordionItem value="price" className="border rounded-lg overflow-hidden border-slate-200 dark:border-slate-700">
            <AccordionTrigger className="text-base font-medium px-4 py-3 hover:no-underline text-slate-900 dark:text-slate-100">
              Price Range
              {(priceRange[0] > 0 || priceRange[1] < 50000000) && (
                <Badge variant="outline" className="ml-2 bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100">
                  {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4 pt-2">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
                <Slider
                  aria-label="Price range"
                  thumbLabels={["Minimum price", "Maximum price"]}
                  value={priceRange}
                  min={0}
                  max={50000000}
                  step={50000}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="py-4"
                />
                <div className="flex items-center justify-between gap-4">
                  <div className="w-full">
                    <Label htmlFor="price-min" className="text-xs text-slate-500 dark:text-slate-400">
                      Min Price
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">$</span>
                      <Input
                        id="price-min"
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number.parseInt(e.target.value), priceRange[1]])}
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <Label htmlFor="price-max" className="text-xs text-slate-500 dark:text-slate-400">
                      Max Price
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">$</span>
                      <Input
                        id="price-max"
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                        className="pl-7"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Beds & Baths */}
          <AccordionItem value="bedsBaths" className="border rounded-lg overflow-hidden border-slate-200 dark:border-slate-700">
            <AccordionTrigger className="text-base font-medium px-4 py-3 hover:no-underline text-slate-900 dark:text-slate-100">
              Beds & Baths
              {(bedsFilter !== "Any" || bathsFilter !== "Any") && (
                <Badge variant="outline" className="ml-2 bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100">
                  {bedsFilter !== "Any" ? bedsFilter : ""} {bathsFilter !== "Any" ? bathsFilter : ""}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="text-sm mb-2 block text-slate-900 dark:text-slate-100">Bedrooms</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Any", "1+", "2+", "3+", "4+", "5+"].map((num) => (
                      <Button
                        key={num}
                        variant={bedsFilter === num ? "default" : "outline"}
                        className={`h-10 px-3 text-sm ${bedsFilter === num ? "bg-slate-800 dark:bg-slate-700" : ""}`}
                        onClick={() => setBedsFilter(num)}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm mb-2 block text-slate-900 dark:text-slate-100">Bathrooms</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Any", "1+", "2+", "3+", "4+", "5+"].map((num) => (
                      <Button
                        key={num}
                        variant={bathsFilter === num ? "default" : "outline"}
                        className={`h-10 px-3 text-sm ${bathsFilter === num ? "bg-slate-800 dark:bg-slate-700" : ""}`}
                        onClick={() => setBathsFilter(num)}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Area */}
          <AccordionItem value="area" className="border rounded-lg overflow-hidden border-slate-200 dark:border-slate-700">
            <AccordionTrigger className="text-base font-medium px-4 py-3 hover:no-underline text-slate-900 dark:text-slate-100">
              Area (Sq Ft)
              {(areaRange[0] > 0 || areaRange[1] < 10000) && (
                <Badge variant="outline" className="ml-2 bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100">
                  {areaRange[0].toLocaleString()} - {areaRange[1].toLocaleString()}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4 pt-2">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>{areaRange[0].toLocaleString()} sq ft</span>
                  <span>{areaRange[1].toLocaleString()} sq ft</span>
                </div>
                <Slider
                  aria-label="Living area range"
                  thumbLabels={["Minimum living area", "Maximum living area"]}
                  value={areaRange}
                  min={0}
                  max={10000}
                  step={100}
                  onValueChange={(value) => setAreaRange(value as [number, number])}
                  className="py-4"
                />
                <div className="flex items-center justify-between gap-4">
                  <div className="w-full">
                    <Label htmlFor="area-min" className="text-xs text-slate-500 dark:text-slate-400">
                      Min Area
                    </Label>
                    <Input
                      id="area-min"
                      type="number"
                      value={areaRange[0]}
                      onChange={(e) => setAreaRange([Number.parseInt(e.target.value), areaRange[1]])}
                    />
                  </div>
                  <div className="w-full">
                    <Label htmlFor="area-max" className="text-xs text-slate-500 dark:text-slate-400">
                      Max Area
                    </Label>
                    <Input
                      id="area-max"
                      type="number"
                      value={areaRange[1]}
                      onChange={(e) => setAreaRange([areaRange[0], Number.parseInt(e.target.value)])}
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Features */}
          <AccordionItem value="features" className="border rounded-lg overflow-hidden border-slate-200 dark:border-slate-700">
            <AccordionTrigger className="text-base font-medium px-4 py-3 hover:no-underline text-slate-900 dark:text-slate-100">
              Features & Amenities
              {featuresFilter.length > 0 && (
                <Badge variant="outline" className="ml-2 bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100">
                  {featuresFilter.length}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-1 gap-3 pt-2">
                <div
                  className={`flex items-center gap-2 p-3 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-slate-200 dark:border-slate-700 ${
                    featuresFilter.includes("Swimming Pool") ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600" : ""
                  }`}
                  onClick={() => toggleFeature("Swimming Pool")}
                >
                  <Checkbox checked={featuresFilter.includes("Swimming Pool")} className="pointer-events-none" />
                  <Label className="text-sm flex items-center cursor-pointer text-slate-900 dark:text-slate-100">
                    <Waves className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                    Swimming Pool
                  </Label>
                </div>
                <div
                  className={`flex items-center gap-2 p-3 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-slate-200 dark:border-slate-700 ${
                    featuresFilter.includes("Garage") ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600" : ""
                  }`}
                  onClick={() => toggleFeature("Garage")}
                >
                  <Checkbox checked={featuresFilter.includes("Garage")} className="pointer-events-none" />
                  <Label className="text-sm flex items-center cursor-pointer text-slate-900 dark:text-slate-100">
                    <Car className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                    Garage
                  </Label>
                </div>
                <div
                  className={`flex items-center gap-2 p-3 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-slate-200 dark:border-slate-700 ${
                    featuresFilter.includes("Garden") ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600" : ""
                  }`}
                  onClick={() => toggleFeature("Garden")}
                >
                  <Checkbox checked={featuresFilter.includes("Garden")} className="pointer-events-none" />
                  <Label className="text-sm flex items-center cursor-pointer text-slate-900 dark:text-slate-100">
                    <Trees className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                    Garden
                  </Label>
                </div>
                <div
                  className={`flex items-center gap-2 p-3 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-slate-200 dark:border-slate-700 ${
                    featuresFilter.includes("High-Speed Internet") ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600" : ""
                  }`}
                  onClick={() => toggleFeature("High-Speed Internet")}
                >
                  <Checkbox checked={featuresFilter.includes("High-Speed Internet")} className="pointer-events-none" />
                  <Label className="text-sm flex items-center cursor-pointer text-slate-900 dark:text-slate-100">
                    <Wifi className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                    High-Speed Internet
                  </Label>
                </div>
                <div
                  className={`flex items-center gap-2 p-3 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-slate-200 dark:border-slate-700 ${
                    featuresFilter.includes("Modern Kitchen") ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600" : ""
                  }`}
                  onClick={() => toggleFeature("Modern Kitchen")}
                >
                  <Checkbox checked={featuresFilter.includes("Modern Kitchen")} className="pointer-events-none" />
                  <Label className="text-sm flex items-center cursor-pointer text-slate-900 dark:text-slate-100">
                    <Utensils className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                    Modern Kitchen
                  </Label>
                </div>
                <div
                  className={`flex items-center gap-2 p-3 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-slate-200 dark:border-slate-700 ${
                    featuresFilter.includes("Fitness Center") ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600" : ""
                  }`}
                  onClick={() => toggleFeature("Fitness Center")}
                >
                  <Checkbox checked={featuresFilter.includes("Fitness Center")} className="pointer-events-none" />
                  <Label className="text-sm flex items-center cursor-pointer text-slate-900 dark:text-slate-100">
                    <Dumbbell className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                    Fitness Center
                  </Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {!isMobile && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="flex gap-2">
            <Button className="w-full bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
            <Button variant="outline" className="flex-shrink-0" onClick={handleClearFilters}>
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
