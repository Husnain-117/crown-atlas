/**
 * CountyDiscoveryPage Component
 * 
 * A high-end, dynamic template used for rendering premium County Discovery pages.
 * Supports features like rich hero sections, interactive maps, lifestyle insights, 
 * and localized market analytics.
 */

'use client'

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import Image from "next/image"
import { CountyConfig, CountyCity } from "@/lib/counties"
import BreadcrumbNav from "@/components/seo/BreadcrumbNav"
import RelatedCountyCities from "@/components/discover/RelatedCountyCities"
import { CityCountStats } from "@/lib/county-stats"
import { getCityData } from "@/lib/city-data"
import { Home, Key, MapPin, Tag, TrendingUp, Train, Briefcase, GraduationCap, LineChart } from "lucide-react"

// Defer heavy client components to reduce main-thread work (Lighthouse)
const LeadForm = dynamic(() => import("@/components/forms/LeadForm"), { ssr: true })
const FeaturedPropertiesRow = dynamic(
  () => import("./CityPageContent").then((m) => ({ default: m.FeaturedPropertiesRow })),
  { ssr: true }
)
// Below-the-fold: load in separate chunks to reduce initial parse/eval (Lighthouse main-thread)
const MarketSnapshot = dynamic(
  () => import("./CityPageContent").then((m) => ({ default: m.MarketSnapshot })),
  { ssr: true }
)
const AgentCard = dynamic(
  () => import("./CityPageContent").then((m) => ({ default: m.AgentCard })),
  { ssr: true }
)
import { CONTACT } from "@/lib/constants/contact"
import { MessageSquare, Heart, Plus, Clock, Globe } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { CITY_CARD_IMAGE_MAPPING, COUNTY_HERO_IMAGE_MAP } from "@/lib/location-images"
import type { StringMap } from "@/lib/location-images"
import { getValidatedCountyImage } from "@/lib/image-validator"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

export interface Props {
  county: CountyConfig
  buyCounts: CityCountStats[]
  rentCounts: CityCountStats[]
  featuredProperties: any[] // Passed from the server page
  marketTrends: any[] // Aggregated from city_statistics for county cities
  lastUpdated?: string // Latest last_updated from city_statistics (ISO or date string)
  totalActive?: number
  totalRent?: number
  avgMedian?: number | null
  /** When set, only these cities are shown in the neighborhood grid (for pagination). */
  displayCities?: CountyCity[]
  /** Current page (1-based) for city grid pagination. */
  cityPage?: number
  /** Total number of pages for city grid. */
  cityTotalPages?: number
  /** Base path for pagination links, e.g. /discover/orange. */
  cityBasePath?: string
}

export default function CountyDiscoveryPageContent(props: Props) {
  useEffect(() => {
    const applyDarkModeStyles = () => {
      const isMobile = window.innerWidth <= 770;
      const isDark = document.documentElement.classList.contains('dark');

      // Use unique data attribute selector to avoid conflicts
      const cards = document.querySelectorAll('[data-county-discovery-card="true"]');
      
      if (cards.length === 0) {
        setTimeout(applyDarkModeStyles, 100);
        return;
      }
      
      if (isMobile && isDark) {
        cards.forEach((card) => {
          // Force card background and text color
          (card as HTMLElement).style.setProperty('background', 'rgba(47, 58, 74, 0.95)', 'important');
          (card as HTMLElement).style.setProperty('color', '#E7EEF5', 'important');
          
          // Force stat values using data attributes
          const statValues = card.querySelectorAll('[data-county-stat-value]');
          statValues.forEach(el => {
            (el as HTMLElement).style.setProperty('color', '#E7EEF5', 'important');
          });
          
          // Force stat labels using data attributes
          const statLabels = card.querySelectorAll('[data-county-stat-label]');
          statLabels.forEach(el => {
            (el as HTMLElement).style.setProperty('color', '#B7C7D6', 'important');
          });
          
          // Force stat icons using data attributes
          const statIcons = card.querySelectorAll('[data-county-stat-icon]');
          statIcons.forEach(icon => {
            (icon as unknown as HTMLElement).style.setProperty('color', '#E7EEF5', 'important');
          });
          
          // Force buy button using data attribute
          const buyBtn = card.querySelector('[data-county-action-button="buy"]');
          if (buyBtn) {
            (buyBtn as HTMLElement).style.setProperty('color', '#FFFFFF', 'important');
            (buyBtn as HTMLElement).style.setProperty('background', 'var(--coastal-primary)', 'important');
          }
          
          // Force rent button using data attribute
          const rentBtn = card.querySelector('[data-county-action-button="rent"]');
          if (rentBtn) {
            (rentBtn as HTMLElement).style.setProperty('color', '#E7EEF5', 'important');
            (rentBtn as HTMLElement).style.setProperty('border-color', 'rgba(255, 255, 255, 0.3)', 'important');
          }
        });
      } else {
        // Remove all inline styles to restore normal CSS behavior
        cards.forEach((card) => {
          (card as HTMLElement).style.removeProperty('background');
          (card as HTMLElement).style.removeProperty('color');
          
          const statValues = card.querySelectorAll('[data-county-stat-value]');
          statValues.forEach(el => {
            (el as HTMLElement).style.removeProperty('color');
          });
          
          const statLabels = card.querySelectorAll('[data-county-stat-label]');
          statLabels.forEach(el => {
            (el as HTMLElement).style.removeProperty('color');
          });
          
          const statIcons = card.querySelectorAll('[data-county-stat-icon]');
          statIcons.forEach(icon => {
            (icon as unknown as HTMLElement).style.removeProperty('color');
          });
          
          const buyBtn = card.querySelector('[data-county-action-button="buy"]');
          if (buyBtn) {
            (buyBtn as HTMLElement).style.removeProperty('color');
            (buyBtn as HTMLElement).style.removeProperty('background');
          }
          
          const rentBtn = card.querySelector('[data-county-action-button="rent"]');
          if (rentBtn) {
            (rentBtn as HTMLElement).style.removeProperty('color');
            (rentBtn as HTMLElement).style.removeProperty('border-color');
          }
        });
      }
    };
    
    // Apply on mount with multiple attempts to ensure DOM is ready
    setTimeout(applyDarkModeStyles, 0);
    setTimeout(applyDarkModeStyles, 100);
    setTimeout(applyDarkModeStyles, 300);
    setTimeout(applyDarkModeStyles, 500);
    
    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setTimeout(applyDarkModeStyles, 50);
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Watch for window resize
    const handleResize = () => {
      setTimeout(applyDarkModeStyles, 50);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return React.createElement(CountyDiscoveryPageBody, props);
}

function CountyDiscoveryPageBody({ 
  county, 
  buyCounts, 
  rentCounts, 
  featuredProperties, 
  marketTrends, 
  lastUpdated, 
  displayCities, 
  cityPage = 1, 
  cityTotalPages, 
  cityBasePath,
  totalActive: serverTotalActive,
  totalRent: serverTotalRent,
  avgMedian: serverAvgMedian
}: Props) {
  const [isDesktopViewport, setIsDesktopViewport] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const updateViewport = () => setIsDesktopViewport(mediaQuery.matches)
    updateViewport()
    mediaQuery.addEventListener("change", updateViewport)
    return () => mediaQuery.removeEventListener("change", updateViewport)
  }, [])

  const citiesToShow = displayCities ?? county.cities
  const buyMap = new Map(buyCounts.map((c) => [c.slug, c]))
  const rentMap = new Map(rentCounts.map((c) => [c.slug, c]))

  // Use server-provided totals or fallback to client-side (though server is preferred for correctness)
  const totalBuy = serverTotalActive ?? county.cities.reduce((sum, c) => {
    if (!c.zipCodes || c.zipCodes.length === 0) return sum
    const buy = buyMap.get(c.slug)
    return sum + (buy?.count || 0)
  }, 0)
  const totalRent = serverTotalRent ?? county.cities.reduce((sum, c) => {
    if (!c.zipCodes || c.zipCodes.length === 0) return sum
    const rent = rentMap.get(c.slug)
    return sum + (rent?.count || 0)
  }, 0)
  
  const avgMedian = serverAvgMedian !== undefined ? serverAvgMedian : (() => {
    let totalWeightedPrice = 0
    let totalWeight = 0
    buyCounts.forEach(c => {
      if (c.medianPrice != null && c.medianPrice > 0 && c.count > 0) {
        totalWeightedPrice += c.medianPrice * c.count
        totalWeight += c.count
      }
    })
    return totalWeight > 0 ? Math.round(totalWeightedPrice / totalWeight) : null
  })()
  const hasMarketMetrics = marketTrends.length > 0 || totalBuy > 0 || totalRent > 0 || avgMedian != null

  // Fetch city data for images if it exists
  const cityData = getCityData(county.slug)
  const neighborhoodImageMap: StringMap = new Map()
  if (cityData?.neighborhoodCategories) {
    cityData.neighborhoodCategories.forEach(cat => {
      cat.neighborhoods.forEach(n => {
        if (n.image) {
          neighborhoodImageMap.set(n.name.toLowerCase(), n.image)
        }
      })
    })
  }

  // Get display name without " County" suffix
  const displayName = county.name.replace(" County", "")

  return (
    <div className="bg-[var(--bg)] theme-transition">
      {/* Breadcrumb - Hidden on mobile for cleaner hero */}
      <div className="hidden sm:block">
        <BreadcrumbNav
          items={[
            { name: 'Home',                  href: '/' },
            { name: 'California Real Estate', href: '/buy' },
            { name: county.name },             // no href = current page
          ]}
        />
      </div>

      {/* ══════ MOBILE HERO (lg:hidden) ══════ */}
      <section className="lg:hidden relative min-h-[450px] sm:min-h-[500px] flex flex-col justify-end overflow-hidden">
        <Image
          src={COUNTY_HERO_IMAGE_MAP[county.slug] || cityData?.heroImage || '/placeholder.svg'}
          alt={`${county.name} real estate - scenic county view`}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F2A44]/75 via-[#0F2A44]/65 to-[#0F2A44]/90 z-10" />
        
        {/* Mobile Breadcrumb - Styled version */}
        <div className="absolute top-4 left-0 right-0 z-20 px-4">
          <Breadcrumbs 
            items={[
              { label: 'California Real Estate', href: '/buy' },
              { label: displayName, href: `/discover/${county.slug}` }
            ]}
            emitJsonLd={false}
          />
        </div>

        <div className="relative z-20 px-5 sm:px-6 pb-10 pt-24">
          <div className="animate-fade-in-up max-w-xl">
            {/* Updated date badge */}
            {hasMarketMetrics && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4">
                <div className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-pulse"></div>
                <span className="text-white/90 text-xs font-medium uppercase tracking-wide">
                  {totalBuy.toLocaleString()} Active Listings{lastUpdated ? ` - Updated ${new Date(lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                </span>
              </div>
            )}

            {isDesktopViewport ? (
              <div role="heading" aria-level={1} className="font-display text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-4">
                Exploring
                <span className="block mt-2 bg-gradient-to-r from-[#C9A84C] via-[#E5C76B] to-[#C9A84C] bg-clip-text text-transparent">
                  {displayName} Real Estate
                </span>
              </div>
            ) : (
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-4">
                Exploring
                <span className="block mt-2 bg-gradient-to-r from-[#C9A84C] via-[#E5C76B] to-[#C9A84C] bg-clip-text text-transparent">
                  {displayName} Real Estate
                </span>
              </h1>
            )}
            
            <p className="text-white/90 text-base sm:text-lg font-light mb-2 leading-relaxed">
              Opportunities & Trends in {displayName}
            </p>
            
            <p className="text-white/75 text-sm mb-8 leading-relaxed uppercase tracking-wide font-medium">
              {displayName}, California
            </p>

            {/* Stats bar */}
            {avgMedian != null && (
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/20">
                <div>
                  <div className="text-white/60 text-xs font-medium mb-1">Median Price</div>
                  <div className="text-white text-xl font-bold">${avgMedian.toLocaleString()}</div>
                </div>
                <div className="w-px h-10 bg-white/20"></div>
                <div>
                  <div className="text-white/60 text-xs font-medium mb-1">For Sale</div>
                  <div className="text-white text-xl font-bold">{totalBuy.toLocaleString()}</div>
                </div>
                <div className="w-px h-10 bg-white/20"></div>
                <div>
                  <div className="text-white/60 text-xs font-medium mb-1">For Rent</div>
                  <div className="text-white text-xl font-bold">{totalRent.toLocaleString()}</div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Mobile Lead Form (below hero) */}
      <div className="lg:hidden mx-4 sm:mx-6 -mt-6 relative z-30 mb-10">
        <div className="bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--coastal-border)] p-6 theme-transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[var(--coastal-primary)] rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-[var(--coastal-primary)] text-lg theme-transition">
                Connect with a {displayName} Expert
              </div>
              <div className="text-[var(--coastal-muted-text)] text-xs theme-transition">
                Get personalized assistance
              </div>
            </div>
          </div>
          <LeadForm defaults={{ county: county.name, state: "CA" }} />
        </div>
      </div>

      {/* ══════ DESKTOP HERO (hidden lg:block) — unchanged ══════ */}
      <section className="hidden lg:block mt-4 md:mt-6">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="overflow-hidden grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] min-h-[300px] md:min-h-[400px] bg-[var(--surface)] border border-[var(--coastal-border)] rounded-2xl">
            {/* Left: Image + copy */}
            <div className="relative p-6 md:p-8 lg:p-9">
              <Image
                src={COUNTY_HERO_IMAGE_MAP[county.slug] || cityData?.heroImage || '/placeholder.svg'}
                alt={`${county.name} real estate - scenic county view`}
                fill
                priority
                fetchPriority="high"
                sizes="100vw"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(90deg, rgba(250,247,242,0.92) 0%, rgba(250,247,242,0.85) 45%, rgba(250,247,242,0.30) 100%)",
                }}
              />
              <div className="relative max-w-full lg:max-w-[620px]">
                {isDesktopViewport ? (
                  <h1 className="m-0 text-3xl sm:text-4xl md:text-5xl lg:text-[54px] leading-tight text-[var(--coastal-primary)] tracking-tight font-bold">
                    Discover the Best of <br />
                    <span className="text-gradient-luxury bg-clip-text text-transparent">{displayName} Real Estate</span>
                  </h1>
                ) : (
                  <div role="heading" aria-level={1} className="m-0 text-3xl sm:text-4xl md:text-5xl lg:text-[54px] leading-tight text-[var(--coastal-primary)] tracking-tight font-bold">
                    Discover the Best of <br />
                    <span className="text-gradient-luxury bg-clip-text text-transparent">{displayName} Real Estate</span>
                  </div>
                )}
                <p className="mt-4 md:mt-6 text-base md:text-lg text-[var(--coastal-text)] font-medium leading-relaxed">
                  {hasMarketMetrics
                    ? `Explore ${totalBuy.toLocaleString()} active listings${avgMedian != null ? ` with a median price of $${avgMedian.toLocaleString()}` : ''}. `
                    : `Browse current property searches and neighborhood information for ${displayName}. `}
                  From coastal retreats to downtown condos, {displayName} offers a mix of lifestyle, neighborhood character, and access to top amenities.
                </p>
              </div>
            </div>

            {/* Right: Lead form */}
            <div id="dream-home-form" className="bg-[var(--surface)] border-t lg:border-t-0 lg:border-l border-[var(--coastal-border)] p-4 md:p-5 lg:p-6 grid content-center">
              <div className="font-bold text-[var(--coastal-primary)] text-base md:text-lg mb-3 md:mb-4">
                Connect with a {county.name} Expert
              </div>
              <LeadForm defaults={{ county: county.name, state: "CA" }} />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="mt-3">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--coastal-border)] bg-[var(--surface-muted)] px-4 py-3 text-[13px] theme-transition">
            <span className="text-[var(--coastal-muted-text)] font-medium theme-transition">CRMLS-backed listings for {county.name}</span>
            <Link href="/team/reza-barghlameno" className="font-semibold text-[var(--coastal-primary)] hover:underline">
              Licensed California agent · CA DRE #02211952
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES CAROUSEL */}
      {featuredProperties && featuredProperties.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-12 md:mt-16">
          <h2 className="font-display font-bold text-[var(--coastal-text)] text-2xl md:text-3xl lg:text-4xl mb-2 text-center theme-transition">
            Featured Properties in
            <span className="lg:hidden block mt-1 text-gradient-luxury bg-clip-text text-transparent">{county.name}</span>
            <span className="hidden lg:inline"> {county.name}</span>
          </h2>
          <p className="text-[var(--coastal-muted-text)] mb-8 text-base md:text-lg text-center max-w-2xl mx-auto">
            Browse current listings from the local MLS feed.
          </p>
          <FeaturedPropertiesRow properties={featuredProperties} />
          <div className="mt-8 text-center flex justify-center gap-4">
            <Link
              href={`/buy/${county.slug}`}
              className="inline-flex items-center px-8 py-4 bg-[var(--coastal-primary)] text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all text-sm md:text-base border border-transparent"
            >
              View All {county.name} Listings
            </Link>
          </div>
        </section>
      )}

      {/* BROWSE CITIES (Neighborhood Grid with Buy/Rent Buttons) */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-16 md:mt-24">
        <h2 className="font-display font-bold text-[var(--coastal-text)] text-2xl md:text-3xl lg:text-4xl mb-4 text-center theme-transition">
          Explore
          <span className="lg:hidden block mt-1 text-gradient-luxury bg-clip-text text-transparent">{county.name} Neighborhoods</span>
          <span className="hidden lg:inline"> {county.name} Neighborhoods</span>
        </h2>
        <p className="text-[var(--coastal-muted-text)] mb-10 text-base md:text-lg text-center max-w-2xl mx-auto">
          Select a city to review current listings, area information, and links for independent local research.
        </p>

        {citiesToShow.length === 0 ? (
          <div className="max-w-xl mx-auto text-center text-[var(--coastal-muted-text)] text-base md:text-lg bg-[var(--surface)] border border-[var(--coastal-border)] rounded-lg p-6">
            City-level cards are not available for {county.name}. You can still browse current county listings on the buy and rent pages.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {citiesToShow.map((city) => {
              const buy = buyMap.get(city.slug)
              const rent = rentMap.get(city.slug)
              const generatedCityImage = CITY_CARD_IMAGE_MAPPING[city.slug]
              // Use improved image validation with fallback
              const cityImage = getValidatedCountyImage(generatedCityImage, city.slug, 'city')
              return (
                <div
                  key={city.slug}
                  className="group county-city-card text-visible rounded-lg overflow-hidden border border-[var(--coastal-border)] transition-all duration-500 shadow-sm hover:shadow-xl bg-[var(--surface)]"
                  data-county-discovery-card="true"
                  data-city-slug={city.slug}
                >
                  <div className="relative h-44 w-full overflow-hidden bg-[var(--surface-muted)]">
                    <Image
                      src={cityImage}
                      alt={`${city.displayName}, ${county.name} - neighbourhood view`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/25 lg:bg-black/40 group-hover:bg-black/20 lg:group-hover:bg-black/30 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="city-name-overlay text-center relative z-10 !text-white font-bold text-xl drop-shadow-md px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg border border-white/20">
                        {city.displayName}
                      </span>
                    </div>
                  </div>

                  {/* City info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-4 text-sm mb-4 pb-4 border-b border-[var(--coastal-border)] theme-transition">
                      <div className="flex flex-col gap-1 items-center">
                        <Home className="w-5 h-5 text-[var(--coastal-primary)] theme-transition" data-county-stat-icon="sale" />
                        <span className="county-stat-value font-bold text-[var(--coastal-text)] text-base theme-transition" data-county-stat-value="sale">
                          {typeof buy?.count === "number"
                            ? buy.count.toLocaleString()
                            : "—"}
                        </span>
                        <span className="county-stat-label text-xs text-[var(--coastal-muted-text)] theme-transition" data-county-stat-label="sale">Sale</span>
                      </div>
                      <div className="flex flex-col gap-1 items-center">
                        <Key className="w-5 h-5 text-[var(--coastal-secondary)] theme-transition" data-county-stat-icon="rent" />
                        <span className="county-stat-value font-bold text-[var(--coastal-text)] text-base theme-transition" data-county-stat-value="rent">
                          {typeof rent?.count === "number"
                            ? rent.count.toLocaleString()
                            : "—"}
                        </span>
                        <span className="county-stat-label text-xs text-[var(--coastal-muted-text)] theme-transition" data-county-stat-label="rent">Rent</span>
                      </div>
                      {typeof buy?.medianPrice === "number" && buy.medianPrice > 0 && (
                        <div className="flex flex-col gap-1 items-center">
                          <Tag className="w-5 h-5 text-emerald-500 dark:text-emerald-400 theme-transition" data-county-stat-icon="median" />
                          <span className="county-stat-value font-bold text-[var(--coastal-text)] text-base theme-transition" data-county-stat-value="median">
                            ${(buy.medianPrice / 1000).toFixed(0)}k
                          </span>
                          <span className="county-stat-label text-xs text-[var(--coastal-muted-text)] theme-transition" data-county-stat-label="median">Median</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/buy/${county.slug}/${city.slug}`}
                        className="county-buy-button flex-1 text-center px-3 py-2.5 rounded-xl bg-[var(--coastal-primary)] !text-white text-sm font-bold hover:shadow-md transition-all hover:scale-[1.02] theme-transition"
                        data-county-action-button="buy"
                      >
                        Buy
                      </Link>
                      <Link
                        href={`/rent/${county.slug}/${city.slug}`}
                        className="county-rent-button flex-1 text-center px-3 py-2.5 rounded-xl border-2 border-[var(--coastal-border)] !text-[var(--coastal-text)] text-sm font-bold hover:bg-[var(--surface-muted)] transition-all hover:scale-[1.02] theme-transition"
                        data-county-action-button="rent"
                      >
                        Rent
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {cityTotalPages != null && cityTotalPages > 1 && cityBasePath && (
          <Pagination className="mt-10">
            <PaginationContent className="flex flex-wrap justify-center gap-1">
              {cityPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious href={`${cityBasePath}?page=${cityPage - 1}`} aria-label="Previous page" />
                </PaginationItem>
              )}
              {Array.from({ length: cityTotalPages }, (_, i) => i + 1).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink href={`${cityBasePath}?page=${pageNum}`} isActive={pageNum === cityPage} aria-current={pageNum === cityPage ? "page" : undefined}>
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {cityPage < cityTotalPages && (
                <PaginationItem>
                  <PaginationNext href={`${cityBasePath}?page=${cityPage + 1}`} aria-label="Next page" />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        )}
      </section>

      {/* MARKET INSIGHTS */}
      {marketTrends && marketTrends.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-16 md:mt-24">
          <MarketSnapshot
            trends={marketTrends}
            cityName={county.name}
            lastUpdated={lastUpdated ?? new Date().toISOString()}
          />
        </section>
      )}

      {/* LIFESTYLE / SCHOOLS / WEATHER */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-12 lg:mt-24 grid lg:grid-cols-3 gap-6 md:gap-8">
        {/* Education & Schools */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[var(--surface)] to-[var(--surface-muted)] p-6 md:p-8 rounded-2xl border border-[var(--coastal-border)] shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[var(--coastal-primary)] rounded-xl">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl">
              Schools & Education
            </h2>
          </div>
          <div className="prose prose-lg max-w-none text-[var(--coastal-muted-text)]">
            {county.slug === "san-francisco" ? (
              <>
                <p>
                  San Francisco is home to the San Francisco Unified School District (SFUSD), which serves over 50,000 students across the city. Many of its schools, particularly in neighborhoods like Lowell and those in the Richmond and Sunset districts, are consistently top-ranked and receive national recognition for academic excellence.
                </p>
                <p className="mt-4">
                  The city is a global hub for higher education and research, anchored by the University of California San Francisco (UCSF), renowned for its medical and life sciences research, and San Francisco State University (SFSU). Proximity to Stanford and UC Berkeley further cements the city as a core part of the world-leading Bay Area knowledge economy.
                </p>
              </>
            ) : (
              <>
                <p>
                  {county.name} includes a broad mix of public, charter, private, and specialized education options across its cities and communities. School boundaries and district programs vary by address, so buyers should verify assigned schools for each property before making decisions.
                </p>
                <p className="mt-4">
                  Higher-education access, workforce training, and nearby regional campuses help shape local demand throughout {displayName}. Our team can help compare neighborhoods around commute patterns, school priorities, and lifestyle needs.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Highlight Stats (Replaces Investment Insights box for space) */}
        <div className="bg-[var(--coastal-primary)] p-6 md:p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h2 className="font-bold text-xl md:text-2xl mb-6">County Highlights</h2>
            <div className="space-y-6">
              <div>
                <div className="text-white/80 text-sm font-medium mb-1">Total Active Listings</div>
                <div className="text-3xl font-bold">{totalBuy.toLocaleString()}</div>
              </div>
              <div className="w-full h-px bg-white/20"></div>
              <div>
                <div className="text-white/80 text-sm font-medium mb-1">Total Rental Units</div>
                <div className="text-3xl font-bold">{totalRent.toLocaleString()}</div>
              </div>
              <div className="w-full h-px bg-white/20"></div>
              <div>
                <div className="text-white/80 text-sm font-medium mb-1">Cities & Communities</div>
                <div className="text-3xl font-bold">{county.cities.length}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIFESTYLE & AMENITIES */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-16 mb-16 md:mt-24">
        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-muted)] p-6 md:p-8 lg:p-10 rounded-2xl border border-[var(--coastal-border)] shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
              <Heart className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <h2 className="font-display font-bold text-[var(--coastal-text)] text-xl md:text-2xl lg:text-3xl theme-transition">
              <span className="lg:hidden">Lifestyle<span className="block text-gradient-luxury bg-clip-text text-transparent">in {displayName}</span></span>
              <span className="hidden lg:inline">Lifestyle & Amenities in {displayName}</span>
            </h2>
          </div>
          <div className="prose prose-lg max-w-none text-[var(--coastal-muted-text)]">
            <p>
              {county.slug === 'san-francisco'
                ? "San Francisco includes distinct residential and commercial districts, parks, waterfront areas, and a range of housing types. Compare current listings and verify transit, services, boundaries, building rules, parking, and other address-specific priorities through official sources and property visits."
                : `${county.name} includes cities and communities with different housing types, services, transportation options, and local rules. Compare current listings and verify commute routes, school assignments, public services, insurance, and other address-specific priorities through authoritative sources.`}
            </p>
          </div>
        </div>
      </section>

      {/* ══════ MOBILE INVESTMENT INSIGHTS (lg:hidden) ══════ */}
      <section className="lg:hidden mt-8 py-12 bg-[var(--surface)] relative overflow-hidden theme-transition">
        <div className="container mx-auto px-4">
          <div className="text-left mb-16 mt-2 px-2">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-6 h-[2px] bg-[var(--coastal-accent)] rounded-full" />
              <span className="text-[var(--coastal-primary)] font-semibold text-xs uppercase tracking-wider theme-transition">Investment</span>
              <div className="w-6 h-[2px] bg-[var(--coastal-accent)] rounded-full" />
            </div>
            <h2 className="font-display text-3xl font-bold text-[var(--coastal-text)] leading-tight theme-transition">
              Investment
              <span className="block text-gradient-luxury bg-clip-text text-transparent mt-1">Insights for {displayName}</span>
            </h2>
          </div>
          <div className="space-y-4 max-w-2xl">
            {[
              { icon: <TrendingUp className="w-6 h-6 text-white" />, title: "Comparable Sales", desc: `Review recent ${displayName} sales by property type, location, condition, and closing date.`, stat: "CRMLS", statLabel: "market context", color: "bg-green-600" },
              { icon: <Home className="w-6 h-6 text-white" />, title: "Rental Scenario", desc: "Model property-specific rent, vacancy, management, maintenance, insurance, taxes, and financing.", stat: "Inputs", statLabel: "verify assumptions", color: "bg-blue-600" },
              { icon: <Briefcase className="w-6 h-6 text-white" />, title: "Due Diligence", desc: "Review condition, title, insurance, zoning, HOA rules, permits, and applicable rental restrictions.", stat: "Property", statLabel: "review required", color: "bg-purple-600" },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 items-start bg-[var(--surface)] p-5 rounded-xl border border-[var(--coastal-border)] shadow-soft hover:shadow-medium transition-all duration-300 theme-transition">
                <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold text-[var(--coastal-text)] mb-1 theme-transition">{item.title}</h3>
                  <p className="text-[var(--coastal-muted-text)] text-sm mb-2 leading-relaxed theme-transition">{item.desc}</p>
                  <span className="text-lg font-bold" style={{ color: item.color === "bg-green-600" ? "#16a34a" : item.color === "bg-blue-600" ? "#2563eb" : "#9333ea" }}>{item.stat}</span>
                  <span className="text-xs text-[var(--coastal-muted-text)] ml-2">{item.statLabel}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 mx-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-[var(--coastal-muted-text)]">
              <strong className="text-[var(--coastal-text)]">Investment note:</strong> Estimates depend on verified property data and assumptions. Consult qualified financial, tax, legal, insurance, and property-management professionals as needed.
            </p>
          </div>
        </div>
      </section>

      {/* ══════ DESKTOP INVESTMENT INSIGHTS (hidden lg:block) ══════ */}
      <section className="hidden lg:block max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-16 md:mt-24">
        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-muted)] p-6 md:p-8 lg:p-10 rounded-2xl border border-[var(--coastal-border)] shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
              <LineChart className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl lg:text-3xl">
              Investment Insights for {displayName}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--coastal-border)] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--coastal-text)]">Comparable Sales</h3>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed mb-3">
                Review recent {displayName} sales by property type, location, condition, and closing date.
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-600">CRMLS</span>
                <span className="text-xs text-[var(--coastal-muted-text)]">market context</span>
              </div>
            </div>
            <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--coastal-border)] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--coastal-text)]">Rental Scenario</h3>
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed mb-3">
                Model property-specific rent, vacancy, management, maintenance, insurance, taxes, and financing.
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-600">Inputs</span>
                <span className="text-xs text-[var(--coastal-muted-text)]">verify assumptions</span>
              </div>
            </div>
            <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--coastal-border)] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--coastal-text)]">Due Diligence</h3>
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed mb-3">
                Review condition, title, insurance, zoning, HOA rules, permits, and applicable rental restrictions.
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-purple-600">Property</span>
                <span className="text-xs text-[var(--coastal-muted-text)]">review required</span>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-[var(--coastal-muted-text)]">
              <strong className="text-[var(--coastal-text)]">Investment note:</strong> Estimates depend on verified property data and assumptions.
              Consult qualified financial, tax, legal, insurance, and property-management professionals as needed.
            </p>
          </div>
        </div>
      </section>

      {/* ══════ MOBILE BUYER'S GUIDE (lg:hidden) ══════ */}
      <section className="lg:hidden py-12 bg-[var(--surface)] theme-transition">
        <div className="container mx-auto px-4">
          <div className="text-left mb-8 px-2">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-6 h-[2px] bg-[var(--coastal-accent)] rounded-full" />
              <span className="text-[var(--coastal-primary)] font-semibold text-xs uppercase tracking-wider theme-transition">Guide</span>
              <div className="w-6 h-[2px] bg-[var(--coastal-accent)] rounded-full" />
            </div>
            <h2 className="font-display text-3xl font-bold text-[var(--coastal-text)] leading-tight theme-transition">
              Buyer&apos;s Guide
              <span className="block text-gradient-luxury bg-clip-text text-transparent mt-1">Buying in {displayName}</span>
            </h2>
          </div>
          <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed mb-6 px-2 theme-transition">
            Our experienced agents guide you through every step, from finding the perfect property to closing the deal.
          </p>
          <div className="space-y-4 max-w-2xl">
            {[
              { step: "1", title: "Get Pre-Approved", desc: "Understand your budget and financing options before you start looking." },
              { step: "2", title: "Work with a Local Expert", desc: `Our agents know ${displayName} neighborhoods and can help you find the right fit.` },
              { step: "3", title: "Schedule Property Tours", desc: "View homes in person to get a feel for the property and neighborhood." },
              { step: "4", title: "Make an Informed Offer", desc: "We'll help you analyze comparable sales and market conditions." },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start bg-[var(--surface)] p-5 rounded-xl border border-[var(--coastal-border)] shadow-soft theme-transition">
                <div className="w-12 h-12 bg-[var(--coastal-primary)] rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg theme-transition">
                  {item.step}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold text-[var(--coastal-text)] mb-1 theme-transition">{item.title}</h3>
                  <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed theme-transition">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 px-2">
            <Link href="/contact" className="inline-flex items-center px-6 py-3 bg-[var(--coastal-primary)] text-white rounded-xl font-bold hover:shadow-lg transition-all text-sm">
              Get Expert Buyer Guidance
            </Link>
          </div>
        </div>
      </section>

      {/* ══════ DESKTOP BUYER'S GUIDE (hidden lg:block) — unchanged ══════ */}
      <section className="hidden lg:block max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-16 md:mt-24">
        <div className="bg-[var(--surface)] p-6 md:p-10 lg:p-12 rounded-2xl border border-[var(--coastal-border)] shadow-md">
          <h2 className="font-bold text-[var(--coastal-text)] text-2xl md:text-3xl lg:text-4xl mb-6">
            Buyer&apos;s Guide: How to Buy a Home in {displayName}
          </h2>
          <div className="prose prose-lg max-w-none text-[var(--coastal-muted-text)] mb-8">
            <p className="text-lg leading-relaxed">
              Buying a home in {displayName} requires understanding the local market, financing options, and the home buying process.
              Our experienced real estate agents can guide you through every step, from finding the perfect property to closing the deal.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--coastal-primary)] text-white flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-bold text-[var(--coastal-text)] mb-1">Get Pre-Approved</h4>
                    <p className="text-sm">Understand your budget and financing options before you start looking.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--coastal-primary)] text-white flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-bold text-[var(--coastal-text)] mb-1">Work with a Local Expert</h4>
                    <p className="text-sm">Our agents know {displayName} neighborhoods and can help you find the right fit.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--coastal-primary)] text-white flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-bold text-[var(--coastal-text)] mb-1">Schedule Property Tours</h4>
                    <p className="text-sm">View homes in person to get a feel for the property and neighborhood.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--coastal-primary)] text-white flex items-center justify-center font-bold text-sm">4</div>
                  <div>
                    <h4 className="font-bold text-[var(--coastal-text)] mb-1">Make an Informed Offer</h4>
                    <p className="text-sm">We&apos;ll help you analyze comparable sales and market conditions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-[var(--coastal-border)] pt-8">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-[var(--coastal-primary)] text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Get Expert Buyer Guidance
            </Link>
          </div>
        </div>
      </section>

      {/* TRANSPORTATION */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-6 md:mt-8">
        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-muted)] p-6 md:p-8 lg:p-10 rounded-2xl border border-[var(--coastal-border)] shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl">
              <Train className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl lg:text-3xl">
              Transportation & Connectivity
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--coastal-border)] shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--coastal-primary)] mb-3">Public Transit</h3>
                <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed mb-3">
                  {county.slug === 'san-francisco'
                    ? "BART, Muni, cable cars, ferries, and Caltrain serve different routes and destinations. Verify the current schedule, stop, transfer, accessibility, and service alerts for the specific property."
                    : `Transit options in ${county.name} vary by city and corridor. Verify current routes, schedules, transfers, accessibility, and service alerts with the responsible transit agency.`}
                </p>
              </div>
              <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--coastal-border)] shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--coastal-primary)] mb-3">Major Highways</h3>
                <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed">
                  {county.slug === 'san-francisco'
                    ? "Direct access to US-101 (North/South), I-80 (Bay Bridge/East), and I-280 (Peninsula) for regional access."
                    : `Major-road access depends on the city, direction, and property location. Test likely routes at the times relevant to your routine.`}
                </p>
              </div>
            </div>
            <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--coastal-border)] bg-white shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--coastal-primary)] mb-3">Airport Access</h3>
              <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed mb-4">
                {county.slug === 'san-francisco'
                  ? "SFO and OAK are regional airport options. Compare the exact ground route, transit service, parking, and current flight schedule for your needs."
                  : `Airport access for ${county.name} depends on the property, route, schedule, and current traffic or transit service.`}
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[var(--surface-muted)] rounded-lg">
                  <span className="text-sm font-medium text-[var(--coastal-text)]">Exact destination</span>
                  <span className="text-sm text-[var(--coastal-muted-text)]">Test the route</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--surface-muted)] rounded-lg">
                  <span className="text-sm font-medium text-[var(--coastal-text)]">Relevant schedule</span>
                  <span className="text-sm text-[var(--coastal-muted-text)]">Check peak and off-peak</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--surface-muted)] rounded-lg">
                  <span className="text-sm font-medium text-[var(--coastal-text)]">Alternatives</span>
                  <span className="text-sm text-[var(--coastal-muted-text)]">Transit, parking, tolls</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ADDRESS SECTION */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-16 md:mt-24">
        <div className="bg-[var(--coastal-primary)] rounded-2xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Globe className="w-64 h-64" />
          </div>
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-amber-400 font-bold text-lg mb-4 uppercase tracking-widest">Office Location</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{CONTACT.business.name}</h2>
              <div className="space-y-2 text-white/90 text-lg leading-relaxed">
                <p>{CONTACT.business.fullAddress.street}</p>
                <p>{CONTACT.business.fullAddress.city}, {CONTACT.business.fullAddress.state} {CONTACT.business.fullAddress.zip}</p>
                <p className="text-sm mt-4 text-white/70 italic">{CONTACT.business.fullAddress.serviceArea}</p>
              </div>
              <div className="mt-8">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${CONTACT.business.fullAddress.street}, ${CONTACT.business.fullAddress.city}, ${CONTACT.business.fullAddress.state} ${CONTACT.business.fullAddress.zip}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[var(--coastal-primary)] rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <MapPin className="w-5 h-5" />
                  View on Google Maps
                </a>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="font-bold text-xl mb-4">Direct Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg"><Plus className="w-5 h-5" /></div>
                  <div>
                    <div className="text-xs text-white/60">Phone Support</div>
                    <div className="font-semibold">{CONTACT.phone.display}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg"><Clock className="w-5 h-5" /></div>
                  <div>
                    <div className="text-xs text-white/60">Business Hours</div>
                    <div className="font-semibold">Mon-Fri: 9am - 6pm</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQS */}
      {cityData?.faqs && cityData.faqs.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-16 md:mt-24">
          <h2 className="font-display font-bold text-[var(--coastal-text)] text-2xl md:text-3xl lg:text-4xl mb-8 text-center theme-transition">
            Common Questions
            <span className="lg:hidden block mt-1 text-gradient-luxury bg-clip-text text-transparent">{displayName} Real Estate</span>
            <span className="hidden lg:inline"> About {displayName} Real Estate</span>
          </h2>
          <div className="max-w-3xl mx-auto">
            <HomeBuyingQuestions faqs={cityData.faqs} />
          </div>
        </section>
      )}

      {/* RELATED CITIES & COUNTIES */}
      {/*
       * Dense internal‑linking block: cities in this county → individual buy
       * pages; plus a curated list of other California county discover pages.
       * Helps Google crawl the full city/county graph and distributes PageRank
       * from the authoritative county page down to individual city pages.
       */}
      <RelatedCountyCities county={county} />

      {/* LOCAL EXPERT */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-16 md:mt-24 mb-16">
        <AgentCard cityName={county.name} />
      </section>
    </div>
  )
}

/* ─────────────────────── Home Buying Questions ─────────────────────── */
function HomeBuyingQuestions({ faqs }: { faqs: any[] }) {
  return (
    <aside itemScope itemType="https://schema.org/FAQPage">
      <div className="w-full">
        {faqs.map((faq: any, index: number) => (
          <details
            key={faq.question || index}
            className="group border-b border-[var(--coastal-border)] last:border-b-0"
            open={index === 0}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <summary className="cursor-pointer py-4 text-lg font-medium text-[var(--coastal-text)] hover:text-[var(--coastal-primary)] transition-colors list-none flex items-center justify-between">
              <span className="flex-1 pr-4" itemProp="name">{faq.question}</span>
              <svg
                className="w-5 h-5 text-[var(--coastal-muted-text)] transition-transform duration-200 group-open:rotate-180 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div
              className="text-[var(--coastal-muted-text)] leading-relaxed pt-2 pb-4"
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
            >
              <div itemProp="text" className="prose prose-sm max-w-none text-[var(--coastal-muted-text)]">
                {faq.answer}
              </div>
            </div>
          </details>
        ))}
      </div>
    </aside>
  )
}
