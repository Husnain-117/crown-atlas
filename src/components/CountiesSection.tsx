"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronDown, MoveRight } from "lucide-react"
import { useMemo, useState } from "react"
import { CALIFORNIA_COUNTIES_DISPLAY } from "@/lib/california-counties"

interface County {
  name: string
  slug: string
  region: string
  popular: boolean
  desc: string
}

interface CountyWithMetrics extends County {
  listings: number | null
  medianPrice: string | null
}

interface CountiesSectionProps {
  countyListingCounts?: Record<string, number>
  countyMedianPrices?: Record<string, number>
}

// Map slug to image from CALIFORNIA_COUNTIES_DISPLAY
const COUNTY_DISPLAY_IMAGES = CALIFORNIA_COUNTIES_DISPLAY.reduce((acc, county) => {
  if (county.image) {
    acc[county.slug] = county.image;
  }
  return acc;
}, {} as Record<string, string>);

const REGION_IMAGES: Record<string, string[]> = {
  "Southern CA": [
    "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=1200&q=80",
    "https://images.unsplash.com/photo-1619468129361-605ebea04b44?w=1200&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80",
  ],
  "Bay Area": [
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80",
    "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=80",
    "https://images.unsplash.com/photo-1581349485608-9469926a8e5e?w=1200&q=80",
  ],
  "Central Valley": [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80",
  ],
  "Northern CA": [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
    "https://images.unsplash.com/photo-1482192505345-5852ba6b3b5c?w=1200&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
  ],
  "Mountain & Rural": [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
    "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1200&q=80",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80",
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&q=80",
  ],
  "Far North": [
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80",
    "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1200&q=80",
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=80",
  ],
}

function getImage(region: string, index: number): string {
  const pool = REGION_IMAGES[region] ?? REGION_IMAGES["Southern CA"]
  return pool[index % pool.length]
}

// TODO: replace Unsplash URLs with actual county photos from CMS/assets
const ALL_COUNTIES: County[] = [
  // Southern CA
  { name: "Los Angeles", slug: "los-angeles", region: "Southern CA", popular: true, desc: "Luxury homes and estates across the nation's largest county - from Beverly Hills to Malibu." },
  { name: "San Diego", slug: "san-diego", region: "Southern CA", popular: true, desc: "Coastal properties along sunny San Diego - La Jolla, Coronado, and Del Mar await." },
  { name: "Orange", slug: "orange", region: "Southern CA", popular: true, desc: "Upscale communities from Newport Beach to Irvine in the heart of Orange County." },
  { name: "Riverside", slug: "riverside", region: "Southern CA", popular: false, desc: "Explore homes for sale and rent across Riverside County, Southern California." },
  { name: "San Bernardino", slug: "san-bernardino", region: "Southern CA", popular: false, desc: "Explore homes for sale and rent across San Bernardino County, California." },
  { name: "Ventura", slug: "ventura", region: "Southern CA", popular: false, desc: "Coastal charm meets suburban living across Ventura County." },
  { name: "Santa Barbara", slug: "santa-barbara", region: "Southern CA", popular: false, desc: "Mediterranean-inspired estates and vineyard retreats in Santa Barbara County." },
  { name: "Imperial", slug: "imperial", region: "Southern CA", popular: false, desc: "Explore homes for sale and rent across Imperial County, California." },

  // Bay Area
  { name: "San Francisco", slug: "san-francisco", region: "Bay Area", popular: true, desc: "Iconic Victorian homes and modern condos in the heart of San Francisco." },
  { name: "Santa Clara", slug: "santa-clara", region: "Bay Area", popular: true, desc: "Silicon Valley's most sought-after neighborhoods and luxury estates." },
  { name: "Alameda", slug: "alameda", region: "Bay Area", popular: false, desc: "Explore homes for sale and rent across Alameda County in the East Bay." },
  { name: "Contra Costa", slug: "contra-costa", region: "Bay Area", popular: false, desc: "Explore homes for sale and rent across Contra Costa County, Bay Area." },
  { name: "San Mateo", slug: "san-mateo", region: "Bay Area", popular: false, desc: "Premium Peninsula communities from Palo Alto to Half Moon Bay." },
  { name: "Marin", slug: "marin", region: "Bay Area", popular: false, desc: "Luxury living amid redwoods and bay views in Marin County." },
  { name: "Napa", slug: "napa", region: "Bay Area", popular: false, desc: "Wine country estates and vineyard properties in beautiful Napa County." },
  { name: "Sonoma", slug: "sonoma", region: "Bay Area", popular: false, desc: "Explore homes for sale and rent across Sonoma County wine country." },
  { name: "Solano", slug: "solano", region: "Bay Area", popular: false, desc: "Explore homes for sale and rent across Solano County, Bay Area." },

  // Central Valley
  { name: "Fresno", slug: "fresno", region: "Central Valley", popular: false, desc: "Explore homes for sale and rent across Fresno County, Central Valley." },
  { name: "Kern", slug: "kern", region: "Central Valley", popular: false, desc: "Explore homes for sale and rent across Kern County, California." },
  { name: "Kings", slug: "kings", region: "Central Valley", popular: false, desc: "Explore homes for sale and rent across Kings County, California." },
  { name: "Madera", slug: "madera", region: "Central Valley", popular: false, desc: "Explore homes for sale and rent across Madera County, California." },
  { name: "Merced", slug: "merced", region: "Central Valley", popular: false, desc: "Explore homes for sale and rent across Merced County, California." },
  { name: "Stanislaus", slug: "stanislaus", region: "Central Valley", popular: false, desc: "Explore homes for sale and rent across Stanislaus County, California." },
  { name: "San Joaquin", slug: "san-joaquin", region: "Central Valley", popular: false, desc: "Explore homes for sale and rent across San Joaquin County, California." },
  { name: "Tulare", slug: "tulare", region: "Central Valley", popular: false, desc: "Explore homes for sale and rent across Tulare County, California." },

  // Northern CA
  { name: "Sacramento", slug: "sacramento", region: "Northern CA", popular: true, desc: "California's capital city offers diverse neighborhoods and great value." },
  { name: "Placer", slug: "placer", region: "Northern CA", popular: false, desc: "Explore homes for sale and rent across Placer County, Northern California." },
  { name: "El Dorado", slug: "el-dorado", region: "Northern CA", popular: false, desc: "Foothills living with stunning Sierra views in El Dorado County." },
  { name: "Nevada", slug: "nevada", region: "Northern CA", popular: false, desc: "Explore homes for sale and rent across Nevada County, California." },
  { name: "Yolo", slug: "yolo", region: "Northern CA", popular: false, desc: "Explore homes for sale and rent across Yolo County, California." },
  { name: "Butte", slug: "butte", region: "Northern CA", popular: false, desc: "Explore homes for sale and rent across Butte County, Northern California." },
  { name: "Shasta", slug: "shasta", region: "Northern CA", popular: false, desc: "Explore homes for sale and rent across Shasta County, California." },
  { name: "Tehama", slug: "tehama", region: "Northern CA", popular: false, desc: "Explore homes for sale and rent across Tehama County, California." },
  { name: "Glenn", slug: "glenn", region: "Northern CA", popular: false, desc: "Explore homes for sale and rent across Glenn County, California." },
  { name: "Colusa", slug: "colusa", region: "Northern CA", popular: false, desc: "Explore homes for sale and rent across Colusa County, California." },
  { name: "Sutter", slug: "sutter", region: "Northern CA", popular: false, desc: "Explore homes for sale and rent across Sutter County, California." },
  { name: "Yuba", slug: "yuba", region: "Northern CA", popular: false, desc: "Explore homes for sale and rent across Yuba County, California." },

  // Mountain & Rural
  { name: "Mono", slug: "mono", region: "Mountain & Rural", popular: false, desc: "Mountain retreats and ski-town charm in stunning Mono County." },
  { name: "Inyo", slug: "inyo", region: "Mountain & Rural", popular: false, desc: "Explore homes for sale and rent across Inyo County, California." },
  { name: "San Luis Obispo", slug: "san-luis-obispo", region: "Mountain & Rural", popular: false, desc: "Central Coast gems from Paso Robles wine country to Pismo Beach." },
  { name: "Monterey", slug: "monterey", region: "Mountain & Rural", popular: false, desc: "Iconic coastal living along the Monterey Peninsula and Big Sur." },
  { name: "Santa Cruz", slug: "santa-cruz", region: "Mountain & Rural", popular: false, desc: "Surf-side living and redwood forests in beautiful Santa Cruz County." },
  { name: "Alpine", slug: "alpine", region: "Mountain & Rural", popular: false, desc: "Explore homes for sale and rent across Alpine County, California." },
  { name: "Amador", slug: "amador", region: "Mountain & Rural", popular: false, desc: "Explore homes for sale and rent across Amador County, California." },
  { name: "Calaveras", slug: "calaveras", region: "Mountain & Rural", popular: false, desc: "Explore homes for sale and rent across Calaveras County, California." },
  { name: "Tuolumne", slug: "tuolumne", region: "Mountain & Rural", popular: false, desc: "Explore homes for sale and rent across Tuolumne County, California." },
  { name: "Mariposa", slug: "mariposa", region: "Mountain & Rural", popular: false, desc: "Gateway to Yosemite - explore homes in scenic Mariposa County." },
  { name: "San Benito", slug: "san-benito", region: "Mountain & Rural", popular: false, desc: "Explore homes for sale and rent across San Benito County, California." },

  // Far North
  { name: "Humboldt", slug: "humboldt", region: "Far North", popular: false, desc: "Coastal redwood country - explore unique homes in Humboldt County." },
  { name: "Del Norte", slug: "del-norte", region: "Far North", popular: false, desc: "Explore homes for sale and rent across Del Norte County, California." },
  { name: "Siskiyou", slug: "siskiyou", region: "Far North", popular: false, desc: "Explore homes for sale and rent across Siskiyou County, California." },
  { name: "Modoc", slug: "modoc", region: "Far North", popular: false, desc: "Explore homes for sale and rent across Modoc County, California." },
  { name: "Lassen", slug: "lassen", region: "Far North", popular: false, desc: "Explore homes for sale and rent across Lassen County, California." },
  { name: "Plumas", slug: "plumas", region: "Far North", popular: false, desc: "Explore homes for sale and rent across Plumas County, California." },
  { name: "Sierra", slug: "sierra", region: "Far North", popular: false, desc: "Explore homes for sale and rent across Sierra County, California." },
  { name: "Trinity", slug: "trinity", region: "Far North", popular: false, desc: "Explore homes for sale and rent across Trinity County, California." },
  { name: "Mendocino", slug: "mendocino", region: "Far North", popular: false, desc: "Rugged coastline and vineyard retreats in Mendocino County." },
  { name: "Lake", slug: "lake", region: "Far North", popular: false, desc: "Explore homes for sale and rent across Lake County, California." },
]

const REGIONS = ["All", "Southern CA", "Bay Area", "Central Valley", "Northern CA", "Mountain & Rural", "Far North"] as const
type RegionFilter = (typeof REGIONS)[number]

const VISIBLE_COUNTIES_INITIAL = 15

export default function CountiesSection({ countyListingCounts = {}, countyMedianPrices = {} }: CountiesSectionProps) {
  const [activeRegion, setActiveRegion] = useState<RegionFilter>("All")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"popular" | "listings" | "alpha">("popular")
  const [visibleCount, setVisibleCount] = useState(VISIBLE_COUNTIES_INITIAL)

  const counties = useMemo<CountyWithMetrics[]>(
    () =>
      ALL_COUNTIES.map((county) => {
        const realListings = countyListingCounts[county.slug]
        const realMedian = countyMedianPrices[county.slug]

        return {
          ...county,
          listings:
            typeof realListings === "number" && realListings >= 0
              ? realListings
              : null,
          medianPrice:
            typeof realMedian === "number" && realMedian > 0
              ? `$${(realMedian / 1000).toFixed(0)}K`
              : null,
        }
      }),
    [countyListingCounts, countyMedianPrices]
  )

  const countyImages = useMemo(() => {
    const imageMap: Record<string, string> = {}
    counties.forEach((county, index) => {
      imageMap[county.slug] = COUNTY_DISPLAY_IMAGES[county.slug] || getImage(county.region, index)
    })
    return imageMap
  }, [counties])

  const filtered = useMemo(() => {
    let list = counties
    if (activeRegion !== "All") list = list.filter((county) => county.region === activeRegion)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((county) => county.name.toLowerCase().includes(q))
    }

    if (sortBy === "popular") {
      return [...list].sort(
        (a, b) =>
          Number(b.popular) - Number(a.popular) ||
          (b.listings ?? -1) - (a.listings ?? -1) ||
          a.name.localeCompare(b.name)
      )
    }
    if (sortBy === "listings") return [...list].sort((a, b) => (b.listings ?? -1) - (a.listings ?? -1))
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }, [activeRegion, counties, search, sortBy])

  const hasListingData = filtered.some((county) => county.listings !== null)
  const totalListings = filtered.reduce((sum, county) => sum + (county.listings ?? 0), 0)
  const visibleCounties = filtered.slice(0, visibleCount)
  const hasMoreCounties = filtered.length > visibleCount

  return (
    <section
      id="discover-cities"
      className="pt-20 md:pt-24 pb-12 md:pb-16 coastal-section-alt relative overflow-hidden theme-transition"
      aria-labelledby="counties-heading"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-[2px] bg-gradient-primary rounded-full" />
            <span className="text-[var(--coastal-primary)] font-semibold text-sm uppercase tracking-wider">
              Explore Counties
            </span>
            <div className="w-8 h-[2px] bg-gradient-primary rounded-full" />
          </div>
          <h2
            id="counties-heading"
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--coastal-primary)] mb-4 text-balance theme-transition"
          >
            Explore Popular
            <span className="block text-gradient-luxury bg-clip-text text-transparent">
              California Counties
            </span>
          </h2>
          <p className="text-[var(--coastal-muted-text)] text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-balance theme-transition">
            Browse all 58 California counties by region, search by name, and compare current
            listing data when available.
          </p>
        </div>

        <div className="glass-card mb-8 rounded-lg border border-[var(--coastal-border)] p-4 md:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="w-full lg:flex-1">
              <label htmlFor="county-search" className="sr-only">
                Search counties
              </label>
              <input
                id="county-search"
                type="text"
                placeholder="Search counties (e.g. Alameda, Orange, Napa)..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-md border border-[var(--coastal-border)] bg-[var(--surface)] px-4 py-3 text-[var(--coastal-text)] placeholder:text-[var(--coastal-muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--coastal-secondary)]"
              />
            </div>
            <div className="w-full lg:w-64">
              <label htmlFor="county-sort" className="sr-only">
                Sort counties
              </label>
              <select
                id="county-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as "popular" | "listings" | "alpha")}
                className="w-full rounded-md border border-[var(--coastal-border)] bg-[var(--surface)] px-4 py-3 text-[var(--coastal-text)] focus:outline-none focus:ring-2 focus:ring-[var(--coastal-secondary)]"
              >
                <option value="popular">Sort: Popular</option>
                <option value="listings">Sort: Most Listings</option>
                <option value="alpha">Sort: A-Z</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {REGIONS.map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => setActiveRegion(region)}
                className={`min-h-11 rounded-md border px-3.5 py-2 text-sm font-semibold transition-all ${activeRegion === region
                  ? "bg-[#0F2A44] border-[#0F2A44] text-white"
                  : "bg-[var(--surface)] border-[var(--coastal-border)] text-[var(--coastal-muted-text)] hover:text-[var(--coastal-primary)] hover:border-[var(--coastal-secondary)]"
                  }`}
                aria-pressed={activeRegion === region}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm md:text-base text-[var(--coastal-muted-text)]">
          <div>
            Showing{" "}
            <span className="font-semibold text-[var(--coastal-text)]">
              {visibleCounties.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[var(--coastal-text)]">
              {filtered.length}
            </span>{" "}
            counties
            {hasListingData && (
              <>
                {" · "}
                <span className="font-semibold text-[var(--coastal-text)]">
                  {totalListings.toLocaleString("en-US")}
                </span>{" "}
                active listings
              </>
            )}
          </div>
          {hasMoreCounties && (
            <button
              type="button"
              onClick={() => setVisibleCount(filtered.length)}
              className="inline-flex min-h-11 items-center gap-1 font-semibold text-[var(--coastal-primary)] hover:text-[var(--coastal-link)]"
            >
              Show all counties
              <ChevronDown aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleCounties.map((county) => {
            const homesText = county.listings?.toLocaleString("en-US")
            return (
              <Link
                key={county.slug}
                href={`/discover/${county.slug}`}
                aria-label={`Browse homes for sale in ${county.name} County, California`}
                className="group glass-card overflow-hidden rounded-lg border border-[var(--coastal-border)] transition-all duration-300 hover-lift"
              >
                <div className="relative h-56">
                  <Image
                    src={countyImages[county.slug]}
                    alt={`${county.name} County, California`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent md:from-black/75 md:via-black/40 md:to-black/10" />
                  
                  {/* Desktop: Region badge on left, Popular badge on right */}
                  <div className="hidden sm:block absolute top-3 left-3 rounded-full bg-[var(--coastal-secondary)]/90 text-[var(--secondary-foreground)] text-xs font-bold px-3 py-1">
                    {county.region}
                  </div>
                  {county.popular && (
                    <div className="hidden sm:block absolute top-3 right-3 rounded-full bg-[var(--coastal-accent)]/95 text-[var(--coastal-primary)] text-xs font-bold px-3 py-1">
                      Popular
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-5">
                  <h3 className="font-display text-base sm:text-2xl font-bold text-[var(--coastal-text)] mb-2 theme-transition">
                    {county.name} County
                  </h3>
                  <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed line-clamp-2 min-h-10 mb-3 sm:mb-4 theme-transition">
                    {county.desc}
                  </p>
                  {county.listings !== null && (
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-[var(--coastal-muted-text)]">Active listings</p>
                        <p className="text-base sm:text-lg font-bold text-[var(--coastal-text)]">{homesText}</p>
                      </div>
                      {county.medianPrice && (
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-wide text-[var(--coastal-muted-text)]">Median price</p>
                          <p className="text-base sm:text-lg font-bold text-[var(--coastal-primary)]">{county.medianPrice}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <span className="hidden sm:inline-flex items-center gap-2 text-[var(--coastal-primary)] font-semibold text-sm sm:text-base">
                    View Homes
                    <MoveRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section >
  )
}
