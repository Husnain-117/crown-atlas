"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { X, SlidersHorizontal, RotateCcw, Search, Loader2 } from "lucide-react"

interface Props {
  action: "buy" | "rent"
  total?: number
}

const SORT_OPTIONS = [
  { value: "updated", label: "Recently Updated" },
  { value: "newest", label: "Recently Listed" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  
]

const PILL_LABELS: Record<string, string> = {
  search: "Search", minPrice: "Min $", maxPrice: "Max $", beds: "Beds", baths: "Baths",
  type: "Type", sort: "Sort", keywords: "Keywords", minSqft: "Min SqFt", maxSqft: "Max SqFt", newest: "Last 21 Days",
  minLot: "Min Lot", maxLot: "Max Lot", minYear: "Built After", maxYear: "Built Before",
  maxHoa: "Max HOA", hasGarage: "Garage", pool: "Pool", waterfront: "Waterfront",
  view: "View", oceanView: "Ocean/Water View", newConstruction: "New Construction",
  senior: "55+ Community", fireplace: "Fireplace", priceReduced: "Price Reduced", openHouseDate: "Open House",
}

export default function FilterBar({ action, total }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get("search") || searchParams.get("city") || searchParams.get("location") || "")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
  const [beds, setBeds] = useState(searchParams.get("beds") || "")
  const [baths, setBaths] = useState(searchParams.get("baths") || "")
  const [type, setType] = useState(searchParams.get("type") || "")
  const [sort, setSort] = useState(searchParams.get("sort") || "updated")
  const [keywords, setKeywords] = useState(searchParams.get("keywords") || "")
  const [minSqft, setMinSqft] = useState(searchParams.get("minSqft") || "")
  const [maxSqft, setMaxSqft] = useState(searchParams.get("maxSqft") || "")
  const [minLot, setMinLot] = useState(searchParams.get("minLot") || "")
  const [maxLot, setMaxLot] = useState(searchParams.get("maxLot") || "")
  const [minYear, setMinYear] = useState(searchParams.get("minYear") || "")
  const [maxYear, setMaxYear] = useState(searchParams.get("maxYear") || "")
  const [maxHoa, setMaxHoa] = useState(searchParams.get("maxHoa") || "")
  const [hasGarage, setHasGarage] = useState(searchParams.get("hasGarage") === "true")
  const [hasPool, setHasPool] = useState(searchParams.get("pool") === "true")
  const [hasView, setHasView] = useState(searchParams.get("view") === "true")
  const [hasOceanView, setHasOceanView] = useState(searchParams.get("oceanView") === "true")
  const [isWaterfront, setIsWaterfront] = useState(searchParams.get("waterfront") === "true")
  const [isNewConstruction, setIsNewConstruction] = useState(searchParams.get("newConstruction") === "true")
  const [isSeniorCommunity, setIsSeniorCommunity] = useState(searchParams.get("senior") === "true")
  const [hasFireplace, setHasFireplace] = useState(searchParams.get("fireplace") === "true")
  const [priceReduced, setPriceReduced] = useState(searchParams.get("priceReduced") === "true")
  const [openHouseDate, setOpenHouseDate] = useState(searchParams.get("openHouseDate") || "")
  const [newest, setNewest] = useState(searchParams.get("newest") === "true")
  const [showMore, setShowMore] = useState(false)
  const [rangeError, setRangeError] = useState("")

  useEffect(() => {
    const nextMinPrice = searchParams.get("minPrice") || ""
    const nextMaxPrice = searchParams.get("maxPrice") || ""
    const nextMinSqft = searchParams.get("minSqft") || ""
    const nextMaxSqft = searchParams.get("maxSqft") || ""
    const nextMinLot = searchParams.get("minLot") || ""
    const nextMaxLot = searchParams.get("maxLot") || ""
    const nextMinYear = searchParams.get("minYear") || ""
    const nextMaxYear = searchParams.get("maxYear") || ""
    const nextMaxHoa = searchParams.get("maxHoa") || ""
    const nextOpenHouseDate = searchParams.get("openHouseDate") || ""
    const nextKeywords = searchParams.get("keywords") || ""

    setSearch(searchParams.get("search") || searchParams.get("city") || searchParams.get("location") || "")
    setMinPrice(nextMinPrice)
    setMaxPrice(nextMaxPrice)
    setBeds(searchParams.get("beds") || "")
    setBaths(searchParams.get("baths") || "")
    setType(searchParams.get("type") || "")
    setSort(searchParams.get("sort") || "updated")
    setKeywords(nextKeywords)
    setMinSqft(nextMinSqft)
    setMaxSqft(nextMaxSqft)
    setMinLot(nextMinLot)
    setMaxLot(nextMaxLot)
    setMinYear(nextMinYear)
    setMaxYear(nextMaxYear)
    setMaxHoa(nextMaxHoa)
    setHasGarage(searchParams.get("hasGarage") === "true")
    setHasPool(searchParams.get("pool") === "true")
    setHasView(searchParams.get("view") === "true")
    setHasOceanView(searchParams.get("oceanView") === "true")
    setIsWaterfront(searchParams.get("waterfront") === "true")
    setIsNewConstruction(searchParams.get("newConstruction") === "true")
    setIsSeniorCommunity(searchParams.get("senior") === "true")
    setHasFireplace(searchParams.get("fireplace") === "true")
    setPriceReduced(searchParams.get("priceReduced") === "true")
    setOpenHouseDate(nextOpenHouseDate)
    setNewest(searchParams.get("newest") === "true")
    setShowMore(Boolean(
      nextMinPrice || nextMaxPrice || nextMinSqft || nextMaxSqft || nextMinLot || nextMaxLot ||
      nextMinYear || nextMaxYear || nextMaxHoa || nextOpenHouseDate || nextKeywords ||
      searchParams.get("hasGarage") || searchParams.get("pool") || searchParams.get("view") || searchParams.get("oceanView") ||
      searchParams.get("waterfront") || searchParams.get("newConstruction") || searchParams.get("senior") ||
      searchParams.get("fireplace") || searchParams.get("priceReduced")
    ))
    setRangeError("")
  }, [searchParams])

  function buildParams(overrides: Record<string, string> = {}) {
    const vals: Record<string, string> = {
      search, minPrice, maxPrice, beds, baths, type, sort, keywords, minSqft, maxSqft,
      minLot, maxLot, minYear, maxYear, maxHoa, openHouseDate,
      hasGarage: hasGarage ? "true" : "",
      pool: hasPool ? "true" : "",
      view: hasView ? "true" : "",
      oceanView: hasOceanView ? "true" : "",
      waterfront: isWaterfront ? "true" : "",
      newConstruction: isNewConstruction ? "true" : "",
      senior: isSeniorCommunity ? "true" : "",
      fireplace: hasFireplace ? "true" : "",
      priceReduced: priceReduced ? "true" : "",
      newest: newest ? "true" : "",
      status: action === "rent" ? "for_rent" : "",
      ...overrides,
    }
    const params = new URLSearchParams()
    Object.entries(vals).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    params.delete("page")
    return params
  }

  function applyFilters(overrides: Record<string, string> = {}) {
    const nextMinPrice = Number(overrides.minPrice ?? minPrice)
    const nextMaxPrice = Number(overrides.maxPrice ?? maxPrice)
    const nextMinSqft = Number(overrides.minSqft ?? minSqft)
    const nextMaxSqft = Number(overrides.maxSqft ?? maxSqft)
    const nextMinLot = Number(overrides.minLot ?? minLot)
    const nextMaxLot = Number(overrides.maxLot ?? maxLot)
    const nextMinYear = Number(overrides.minYear ?? minYear)
    const nextMaxYear = Number(overrides.maxYear ?? maxYear)

    if ((overrides.minPrice ?? minPrice) && (overrides.maxPrice ?? maxPrice) && nextMinPrice > nextMaxPrice) {
      setRangeError("Minimum price cannot be greater than maximum price.")
      return
    }
    if ((overrides.minSqft ?? minSqft) && (overrides.maxSqft ?? maxSqft) && nextMinSqft > nextMaxSqft) {
      setRangeError("Minimum square footage cannot be greater than maximum square footage.")
      return
    }
    if ((overrides.minLot ?? minLot) && (overrides.maxLot ?? maxLot) && nextMinLot > nextMaxLot) {
      setRangeError("Minimum lot size cannot be greater than maximum lot size.")
      return
    }
    if ((overrides.minYear ?? minYear) && (overrides.maxYear ?? maxYear) && nextMinYear > nextMaxYear) {
      setRangeError("Minimum year cannot be greater than maximum year.")
      return
    }

    setRangeError("")
    startTransition(() => {
      router.push(`?${buildParams(overrides).toString()}`)
    })
  }

  function clearAllFilters() {
    setSearch(""); setMinPrice(""); setMaxPrice(""); setBeds(""); setBaths("");
    setType(""); setKeywords(""); setMinSqft(""); setMaxSqft(""); setSort("updated"); setNewest(false);
    setMinLot(""); setMaxLot(""); setMinYear(""); setMaxYear(""); setMaxHoa(""); setOpenHouseDate("");
    setHasGarage(false); setHasPool(false); setHasView(false); setHasOceanView(false); setIsWaterfront(false);
    setIsNewConstruction(false); setIsSeniorCommunity(false); setHasFireplace(false); setPriceReduced(false);
    setShowMore(false)
    setRangeError("")
    startTransition(() => {
      router.push("?")
    })
  }

  function removeFilter(key: string) {
    const setters: Record<string, (v: string) => void> = {
      search: setSearch, minPrice: setMinPrice, maxPrice: setMaxPrice, beds: setBeds, baths: setBaths,
      type: setType, keywords: setKeywords, minSqft: setMinSqft, maxSqft: setMaxSqft,
      minLot: setMinLot, maxLot: setMaxLot, minYear: setMinYear, maxYear: setMaxYear,
      maxHoa: setMaxHoa, openHouseDate: setOpenHouseDate,
    }
    if (setters[key]) setters[key]("")
    if (key === "sort") { setSort("updated"); applyFilters({ [key]: "" }); return }
    if (key === "newest") { setNewest(false); applyFilters({ [key]: "" }); return }
    if (key === "hasGarage") { setHasGarage(false); applyFilters({ [key]: "" }); return }
    if (key === "pool") { setHasPool(false); applyFilters({ [key]: "" }); return }
    if (key === "view") { setHasView(false); applyFilters({ [key]: "" }); return }
    if (key === "oceanView") { setHasOceanView(false); applyFilters({ [key]: "" }); return }
    if (key === "waterfront") { setIsWaterfront(false); applyFilters({ [key]: "" }); return }
    if (key === "newConstruction") { setIsNewConstruction(false); applyFilters({ [key]: "" }); return }
    if (key === "senior") { setIsSeniorCommunity(false); applyFilters({ [key]: "" }); return }
    if (key === "fireplace") { setHasFireplace(false); applyFilters({ [key]: "" }); return }
    if (key === "priceReduced") { setPriceReduced(false); applyFilters({ [key]: "" }); return }
    applyFilters({ [key]: "" })
  }

  const activeFilters = Object.entries({
    search, minPrice, maxPrice, beds, baths, type, keywords, minSqft, maxSqft,
    minLot, maxLot, minYear, maxYear, maxHoa, openHouseDate,
    hasGarage: hasGarage ? "true" : "",
    pool: hasPool ? "true" : "",
    view: hasView ? "true" : "",
    oceanView: hasOceanView ? "true" : "",
    waterfront: isWaterfront ? "true" : "",
    newConstruction: isNewConstruction ? "true" : "",
    senior: isSeniorCommunity ? "true" : "",
    fireplace: hasFireplace ? "true" : "",
    priceReduced: priceReduced ? "true" : "",
    newest: newest ? "true" : "",
  }).filter(([, v]) => !!v)

  const selCls = "border border-[var(--coastal-border)] rounded-lg px-3 py-2 bg-[var(--surface)] text-[var(--coastal-text)] text-sm h-11"
  const inputCls = `${selCls} placeholder:text-[var(--coastal-muted-text)]`

  return (
    <div className={`bg-[var(--surface)] border border-[var(--coastal-border)] rounded-lg p-3 sm:p-4 md:p-5 space-y-3 theme-transition relative${isPending ? ' opacity-70 pointer-events-none' : ''}`}>
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center z-10 rounded-xl bg-[var(--surface)]/60 backdrop-blur-[1px]">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--coastal-primary)]" />
        </div>
      )}
      {/* Primary row */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3 sm:items-center">
        {/* Search Input with Button */}
        <div className="relative col-span-2 w-full min-w-0 sm:flex-1 sm:min-w-[280px] sm:max-w-md">
          <input
            type="text"
            aria-label="Search by city, address, or ZIP code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applyFilters({ search })
              }
            }}
            placeholder="Search by city, address, or ZIP code..."
            className={`${inputCls} w-full pr-20 md:pr-24`}
          />
          <button
            type="button"
            onClick={() => applyFilters({ search })}
            className="absolute right-0 top-0 flex h-11 min-w-20 items-center justify-center gap-1.5 rounded-r-lg bg-[var(--coastal-primary)] px-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--primary-hover)]"
          >
            <Search className="hidden h-4 w-4 md:block" aria-hidden="true" />
            <span>Search</span>
          </button>
        </div>

        <div className="w-px h-8 bg-[var(--coastal-border)] mx-1 hidden md:block"></div>

        <select aria-label="Property type" value={type} onChange={(e) => { setType(e.target.value); applyFilters({ type: e.target.value }) }} className={`${selCls} w-full sm:w-36`}>
          <option value="">Any Type</option>
          <option value="Residential">House</option>
          <option value="Condominium">Condo</option>
          <option value="Townhouse">Townhouse</option>
          <option value="Manufactured">Manufactured</option>
          <option value="MultiFamily">Multi-family</option>
          {action === "buy" && <option value="Land">Land</option>}
        </select>

        <select aria-label="Minimum bedrooms" value={beds} onChange={(e) => { setBeds(e.target.value); applyFilters({ beds: e.target.value }) }} className={`${selCls} w-full sm:w-24`}>
          <option value="">Beds</option>
          {[1, 2, 3, 4, 5].map(n => <option key={n} value={String(n)}>{n}+</option>)}
        </select>

        <select aria-label="Minimum bathrooms" value={baths} onChange={(e) => { setBaths(e.target.value); applyFilters({ baths: e.target.value }) }} className={`${selCls} w-full sm:w-24`}>
          <option value="">Baths</option>
          {[1, 2, 3, 4].map(n => <option key={n} value={String(n)}>{n}+</option>)}
        </select>

        <select aria-label="Sort properties" value={sort} onChange={(e) => { setSort(e.target.value); applyFilters({ sort: e.target.value }) }} className={`${selCls} col-span-2 w-full sm:w-44`}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div className="hidden h-8 w-px bg-[var(--coastal-border)] mx-1 md:block"></div>

        <button
          type="button"
          onClick={() => {
            const next = !newest
            setNewest(next)
            applyFilters({ newest: next ? "true" : "" })
          }}
          className={`min-h-11 w-full px-3 py-2 rounded-lg text-sm border transition-colors sm:w-auto ${
            newest 
              ? 'bg-[var(--coastal-primary)] text-white border-[var(--coastal-primary)]' 
              : 'border-[var(--coastal-border)] text-[var(--coastal-muted-text)] hover:text-[var(--coastal-text)]'
          }`}
          title="Show only properties listed in the last 21 days"
        >
          Last 21 Days
        </button>

        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className={`flex min-h-11 w-full items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-[var(--coastal-border)] sm:w-auto ${showMore ? 'text-[var(--coastal-primary)] font-semibold' : 'text-[var(--coastal-muted-text)]'}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          More
        </button>

        <button
          type="button"
          onClick={clearAllFilters}
          className="flex min-h-11 w-full items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-[var(--coastal-border)] text-[var(--coastal-muted-text)] hover:border-red-300 hover:text-red-500 transition-colors sm:w-auto"
          title="Clear all filters"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>

        {total !== undefined && (
          <span className="col-span-2 text-sm text-[var(--coastal-muted-text)] font-medium whitespace-nowrap sm:ml-auto">
            {total.toLocaleString("en-US")} result{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Expanded row */}
      {showMore && (
        <form
          className="grid grid-cols-2 gap-2 border-t border-[var(--coastal-border)] pt-3 sm:grid-cols-3 lg:grid-cols-5"
          onSubmit={(event) => {
            event.preventDefault()
            applyFilters()
          }}
        >
          <input aria-label="Minimum price" min="0" inputMode="numeric" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} type="number" placeholder="Min Price" className={`${inputCls} w-full`} />
          <input aria-label="Maximum price" min="0" inputMode="numeric" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" placeholder="Max Price" className={`${inputCls} w-full`} />
          <input aria-label="Minimum square footage" min="0" inputMode="numeric" value={minSqft} onChange={(e) => setMinSqft(e.target.value)} type="number" placeholder="Min Sq Ft" className={`${inputCls} w-full`} />
          <input aria-label="Maximum square footage" min="0" inputMode="numeric" value={maxSqft} onChange={(e) => setMaxSqft(e.target.value)} type="number" placeholder="Max Sq Ft" className={`${inputCls} w-full`} />
          <input aria-label="Minimum lot size in square feet" min="0" inputMode="numeric" value={minLot} onChange={(e) => setMinLot(e.target.value)} type="number" placeholder="Min Lot Sq Ft" className={`${inputCls} w-full`} />
          <input aria-label="Maximum lot size in square feet" min="0" inputMode="numeric" value={maxLot} onChange={(e) => setMaxLot(e.target.value)} type="number" placeholder="Max Lot Sq Ft" className={`${inputCls} w-full`} />
          <input aria-label="Minimum year built" min="1800" max={new Date().getFullYear() + 2} inputMode="numeric" value={minYear} onChange={(e) => setMinYear(e.target.value)} type="number" placeholder="Built After" className={`${inputCls} w-full`} />
          <input aria-label="Maximum year built" min="1800" max={new Date().getFullYear() + 2} inputMode="numeric" value={maxYear} onChange={(e) => setMaxYear(e.target.value)} type="number" placeholder="Built Before" className={`${inputCls} w-full`} />
          <input aria-label="Maximum monthly HOA fee" min="0" inputMode="numeric" value={maxHoa} onChange={(e) => setMaxHoa(e.target.value)} type="number" placeholder="Max HOA / mo" className={`${inputCls} w-full`} />
          <label className="col-span-2 flex min-h-11 items-center justify-between gap-2 rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] px-3 text-sm text-[var(--coastal-text)] sm:col-span-1">
            <span>Open house</span>
            <input
              aria-label="Open house date"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={openHouseDate}
              onChange={(event) => setOpenHouseDate(event.target.value)}
              className="min-w-0 bg-transparent"
            />
          </label>
          {[
            { label: "Price reduced", checked: priceReduced, setChecked: setPriceReduced },
            { label: "Garage", checked: hasGarage, setChecked: setHasGarage },
            { label: "Pool", checked: hasPool, setChecked: setHasPool },
            { label: "Any view", checked: hasView, setChecked: setHasView },
            { label: "Ocean/water view", checked: hasOceanView, setChecked: setHasOceanView },
            { label: "Waterfront", checked: isWaterfront, setChecked: setIsWaterfront },
            { label: "New construction", checked: isNewConstruction, setChecked: setIsNewConstruction },
            { label: "55+ community", checked: isSeniorCommunity, setChecked: setIsSeniorCommunity },
            { label: "Fireplace", checked: hasFireplace, setChecked: setHasFireplace },
          ].map((option) => (
            <label key={option.label} className="flex min-h-11 items-center gap-2 rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] px-3 text-sm text-[var(--coastal-text)]">
              <input
                type="checkbox"
                checked={option.checked}
                onChange={(event) => option.setChecked(event.target.checked)}
                className="h-4 w-4 rounded border-[var(--coastal-border)] accent-[var(--coastal-primary)]"
              />
              {option.label}
            </label>
          ))}
          <input aria-label="Property features or keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Keywords (solar, guest house...)" className={`${inputCls} col-span-2 w-full sm:col-span-2`} />
          <button type="submit" className="col-span-2 min-h-11 px-4 py-2 rounded-lg bg-[var(--coastal-primary)] text-white text-sm font-semibold sm:col-span-1">
            Apply
          </button>
          {rangeError && (
            <p className="basis-full text-sm text-red-600 dark:text-red-400" role="alert" aria-live="polite">
              {rangeError}
            </p>
          )}
        </form>
      )}

      {/* Active pills */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {activeFilters.map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-[var(--coastal-primary)]/10 text-[var(--coastal-primary)] rounded-full text-xs font-medium border border-[var(--coastal-primary)]/20"
            >
              {PILL_LABELS[key] || key}: {value}
              <button onClick={() => removeFilter(key)} className="p-0.5 rounded-full hover:bg-[var(--coastal-primary)]/20" aria-label={`Remove ${key}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-xs text-[var(--coastal-muted-text)] hover:text-[var(--coastal-primary)]"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
