"use client"
import Link from "next/link"

import { MapPin, Bed, Bath, Maximize, Calendar, Share2, Building2, School, TrendingUp, ViewIcon as StreetViewIcon, Camera, Copy, Mail, MessageCircle, Link2, MessageSquareQuote, CircleAlert } from "lucide-react"
import Script from "next/script"
import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import PropertyGallery from "./property-gallery"
import ContactForm from "../../../../components/contact-form"
import { PropertyDetailData } from "@/lib/db/property-detail-repo"
import PropertyFAQ from "./property-faq"
import CRMLSDisclaimer from "@/components/crmls-disclaimer"
import WhatsAppButton from "@/components/whatsapp-button"
import { ClientTestimonialsBadge } from "@/components/client-testimonials-badge"
import { formatPriceWithCommasAndDecimals } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { propertyPathFor, propertyUrlFor } from "@/lib/property-url"
import { ViewportDeferred } from "@/components/performance/ViewportDeferred"
import { derivePropertyDetailContent, type PropertyFact } from "./property-detail-content"
import { isActivePropertyStatus, propertyDisplayStatus } from "@/lib/property-status"
import { useContactPanel } from "@/stores/use-contact-panel"
import { MobileListingCta } from "./mobile-cta"

// Dynamic import for PropertyMap to avoid SSR issues with Leaflet
const PropertyMap = dynamic(() => import("./property-map"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-[var(--surface-muted)] rounded-[1rem] flex items-center justify-center animate-pulse">
      <div className="text-center">
        <div className="w-12 h-12 bg-[var(--coastal-primary)] rounded-[var(--radius)] mx-auto mb-4 animate-spin flex items-center justify-center">
          <MapPin className="h-6 w-6 text-white" />
        </div>
        {/* Screen reader only - not visible to users or search engines */}
        <span className="sr-only">Loading interactive map</span>
      </div>
    </div>
  )
})

const PriceHistoryChart = dynamic(() => import("./price-history-chart"), {
  ssr: false,
  loading: () => (
    <div
      className="h-64 rounded-lg border border-[var(--coastal-border)] bg-[var(--surface-muted)] motion-safe:animate-pulse"
      role="status"
    >
      <span className="sr-only">Loading price history</span>
    </div>
  ),
})

const ListingPaymentEstimate = dynamic(() => import("./listing-payment-estimate"), {
  ssr: false,
})

const TourScheduler = dynamic(() => import("@/components/TourScheduler"), {
  ssr: false,
})

const NeighborhoodPanel = dynamic(
  () => import("./NeighborhoodPanel").then((module) => module.NeighborhoodPanel),
  { ssr: false }
)

const AffiliateServiceCards = dynamic(
  () => import("@/components/AffiliateServiceCards").then((module) => module.AffiliateServiceCards),
  { ssr: false }
)

/**
 * Client Component - Property Detail Interactive Features
 * Receives server-fetched data as props (SEO-friendly!)
 */
interface PropertyDetailClientPageProps {
  propertyData: PropertyDetailData
  historySection?: React.ReactNode
  marketContext?: React.ReactNode
}

function FactList({ title, facts }: { title: string; facts: PropertyFact[] }) {
  return (
    <section>
      <h3 className="mb-2 font-semibold text-[var(--coastal-text)]">{title}</h3>
      <dl className="space-y-3 text-sm">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-xs text-[var(--coastal-muted-text)]">{fact.label}</dt>
            <dd className="break-words font-medium text-[var(--coastal-text)]">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default function PropertyDetailClientPage({
  propertyData: property,
  historySection,
  marketContext,
}: PropertyDetailClientPageProps) {
  const [hasMounted, setHasMounted] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const openContactPanel = useContactPanel((state) => state.open)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Validate property data exists - if missing critical fields, show error
  if (!property || !property.listing_key) {
    return (
      <div className="bg-[var(--bg)] text-[var(--coastal-text)] min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <p className="text-[var(--coastal-muted-text)] mb-6">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/properties"
            className="inline-block bg-[var(--coastal-primary)] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Browse All Properties
          </Link>
        </div>
      </div>
    )
  }

  const listingKey = property.listing_key
  const rawListingStatus = property.standard_status || property.mls_status
  const isActiveListing = isActivePropertyStatus(rawListingStatus)
  const displayStatus = propertyDisplayStatus(rawListingStatus, property.property_type)
  const activeListingsHref = property.city
    ? `/properties?city=${encodeURIComponent(property.city)}`
    : "/properties"
  const propertyContactAddress = [
    property.address,
    property.city,
    ["CA", property.postal_code].filter(Boolean).join(" "),
  ].filter(Boolean).join(", ")
  const canonicalPropertyUrl = propertyUrlFor(property)
  const {
    faqs,
    featureGroups,
    homeFacts,
    communityFacts,
    schools,
    utilities,
    localCityPath,
    priceHistory,
    hasPriceHistory,
    isNewListing,
  } = derivePropertyDetailContent(property)

  // Property data is guaranteed to exist (fetched on server)
  // RealEstateListing + BreadcrumbList JSON-LD is emitted by the server page.tsx
  // so Googlebot reads structured data in the first-pass HTML render.

  return (
    <>
      {/* FAQPage Schema for property FAQs — generated from dynamic client data, intentionally client-side */}
      {faqs && faqs.length > 0 && (
        <Script id="property-faq-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map((faq: { question: string; answer: string }) => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })}
        </Script>
      )}

      <div className="bg-[var(--bg)] text-[var(--coastal-text)] min-h-screen">
        <div className="container mx-auto max-w-7xl px-4 pb-20 pt-3 sm:px-6 sm:pb-24 sm:pt-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-2 sm:mb-4">
            <ol
              className="flex items-center overflow-x-auto whitespace-nowrap text-xs sm:text-sm text-[var(--coastal-muted-text)] gap-0 pb-1"
            >
              <li>
                <Link href="/" className="text-[var(--coastal-link)] hover:text-[var(--coastal-primary)]">
                  <span>Home</span>
                </Link>
              </li>
              <li className="flex items-center">
                <span aria-hidden="true" className="mx-1 sm:mx-2">/</span>
                <Link href="/properties" className="text-[var(--coastal-link)] hover:text-[var(--coastal-primary)]">
                  <span>Properties</span>
                </Link>
              </li>
              {localCityPath && (
                  <li className="flex items-center">
                    <span aria-hidden="true" className="mx-1 sm:mx-2">/</span>
                    <Link href={localCityPath} className="text-[var(--coastal-link)] hover:text-[var(--coastal-primary)]">
                      <span>{property.city} Homes</span>
                    </Link>
                  </li>
              )}
              <li className="flex min-w-0 items-center text-[var(--coastal-text)]" aria-current="page">
                <span aria-hidden="true" className="mx-1 sm:mx-2">/</span>
                <span className="truncate">{property?.seo_title || property?.address || "Unknown Address"}</span>
              </li>
            </ol>
          </nav>

          <Tabs defaultValue="photos" className="w-full">
            <TabsList className="mb-2 inline-flex w-full gap-1 rounded-[var(--radius)] bg-[var(--surface-muted)] p-1 sm:mb-3 sm:w-auto">
              <TabsTrigger
                value="photos"
                className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-[var(--radius)] px-3 font-medium data-[state=active]:bg-[var(--surface)] data-[state=active]:text-[var(--coastal-primary)] data-[state=active]:shadow-sm sm:min-w-[120px] sm:flex-initial sm:px-5"
              >
                <Camera aria-hidden="true" className="h-4 w-4" />
                <span className="text-sm sm:text-base">Photos</span>
              </TabsTrigger>
              {property?.latitude && property?.longitude && (
                <TabsTrigger
                  value="streetview"
                  className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-[var(--radius)] px-3 font-medium data-[state=active]:bg-[var(--surface)] data-[state=active]:text-[var(--coastal-primary)] data-[state=active]:shadow-sm sm:min-w-[120px] sm:flex-initial sm:px-5"
                >
                  <StreetViewIcon aria-hidden="true" className="h-4 w-4" />
                  <span className="text-sm sm:text-base">Street View</span>
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="photos" className="mt-0">
              <PropertyGallery images={property?.images || []} />
            </TabsContent>
            {property?.latitude && property?.longitude && (
              <TabsContent value="streetview" className="mt-0">
                <div className="relative h-[300px] w-full overflow-hidden rounded-lg border border-[var(--coastal-border)] bg-[var(--surface-muted)] sm:h-[400px] md:h-[500px]">
                  {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                    <iframe
                      className="h-full w-full border-0"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/streetview?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&location=${property.latitude},${property.longitude}&heading=210&pitch=0&fov=90`}
                      title={`Street View of ${property?.address || "property"}`}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="max-w-md p-6 text-center">
                        <StreetViewIcon aria-hidden="true" className="mx-auto mb-4 h-12 w-12 text-[var(--coastal-muted-text)]" />
                        <h2 className="mb-2 text-lg font-semibold text-[var(--coastal-text)]">Street View</h2>
                        <p className="mb-4 text-sm text-[var(--coastal-muted-text)]">Street View is not available at this time.</p>
                        <a
                          href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&layer=c`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--coastal-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                        >
                          <MapPin aria-hidden="true" className="mr-2 h-4 w-4" />
                          View on Google Maps
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>

          <article itemScope itemType="https://schema.org/RealEstateListing">
            <meta itemProp="name" content={property?.address || "Unknown Address"} />
            <meta itemProp="description" content={property?.public_remarks || "No description available"} />
            <meta itemProp="price" content={property?.list_price.toString()} />
            <meta itemProp="priceCurrency" content="USD" />

            <div className="mb-5 mt-4 grid gap-4 sm:mb-8 sm:mt-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:items-end lg:gap-8">
              <div className="w-full">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {rawListingStatus && (
                    <Badge
                      variant="outline"
                      className={`${isActiveListing
                        ? "border-[var(--coastal-secondary)] bg-[var(--chip-active)] text-[#083133] dark:text-white"
                        : "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"} text-xs`}
                    >
                      {displayStatus.label}
                    </Badge>
                  )}
                  {isNewListing && isActiveListing && (
                    <Badge variant="outline" className="bg-[var(--surface-muted)] text-[var(--coastal-text)] hover:bg-[var(--surface-muted)] border-[var(--coastal-border)] text-xs">
                      New Listing
                    </Badge>
                  )}
                </div>
                {!isActiveListing && (
                  <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100" role="status">
                    <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-semibold">This property is not currently listed as Active.</p>
                      <p className="mt-1 text-sm opacity-90">
                        The page remains available as historical property information. Availability and prior pricing may have changed.
                      </p>
                      <Link href={activeListingsHref} className="mt-2 inline-flex text-sm font-semibold underline underline-offset-4">
                        View active homes{property.city ? ` in ${property.city}` : ""}
                      </Link>
                    </div>
                  </div>
                )}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 break-words text-[var(--coastal-text)]" itemProp="name">
                  {property?.address}
                </h1>
                <div className="flex items-center text-[var(--coastal-muted-text)] mb-3 text-sm sm:text-base">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span itemProp="address" className="truncate">
                    {[property.city, [property.state || "CA", property.postal_code].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 sm:gap-4 md:gap-6 mt-4">
                  {property.bedrooms != null && property.bedrooms > 0 && (
                    <div className="flex items-center text-sm sm:text-base text-[var(--coastal-text)]">
                      <Bed className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[var(--coastal-muted-text)] flex-shrink-0" />
                      <span><strong itemProp="numberOfRooms">{property.bedrooms}</strong> Beds</span>
                    </div>
                  )}
                  {property.bathrooms != null && property.bathrooms > 0 && (
                    <div className="flex items-center text-sm sm:text-base text-[var(--coastal-text)]">
                      <Bath className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[var(--coastal-muted-text)] flex-shrink-0" />
                      <span><strong itemProp="numberOfBathroomsTotal">{property.bathrooms}</strong> Baths</span>
                    </div>
                  )}
                  {property.living_area_sqft != null && property.living_area_sqft > 0 ? (
                    <div className="flex items-center text-sm sm:text-base text-[var(--coastal-text)]">
                      <Maximize className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[var(--coastal-muted-text)] flex-shrink-0" />
                      <span><strong itemProp="floorSize">{Math.round(property.living_area_sqft).toLocaleString("en-US")}</strong> Sq Ft</span>
                    </div>
                  ) : property.lot_size_sqft != null && property.lot_size_sqft > 0 ? (
                    <div className="flex items-center text-sm sm:text-base text-[var(--coastal-text)]">
                      <Maximize className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[var(--coastal-muted-text)] flex-shrink-0" />
                      <span><strong>{Math.round(property.lot_size_sqft).toLocaleString("en-US")}</strong> Lot Sq Ft</span>
                    </div>
                  ) : null}
                  {property.year_built != null && property.year_built > 0 && (
                    <div className="flex items-center text-sm sm:text-base text-[var(--coastal-text)]">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[var(--coastal-muted-text)] flex-shrink-0" />
                      <span>Built <strong itemProp="yearBuilt">{property.year_built}</strong></span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex w-full flex-col items-start gap-4 rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-4 shadow-sm lg:max-w-[380px]">
                <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--coastal-primary)]" itemProp="price">
                    {property?.list_price ? formatPriceWithCommasAndDecimals(property.list_price) : 'N/A'}
                  </div>
                </div>
                {property.previous_list_price != null &&
                  property.list_price < property.previous_list_price && (
                    <div className="order-3 mt-2 flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400">
                        <TrendingUp className="h-4 w-4 rotate-180" />
                        Price Reduced
                      </span>
                      <span className="text-sm text-[var(--coastal-muted-text)]">
                        Was {formatPriceWithCommasAndDecimals(property.previous_list_price)}
                        {" — "}
                        {formatPriceWithCommasAndDecimals(property.list_price)}
                        {" "}
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          (-{formatPriceWithCommasAndDecimals(property.previous_list_price - property.list_price)})
                        </span>
                      </span>
                      {hasMounted && property.price_change_timestamp && (
                        <span className="text-xs text-[var(--coastal-muted-text)]">
                          Reduced on {new Date(property.price_change_timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  )}
                <div className="order-2 hidden w-full space-y-2 md:block md:min-w-[320px]">
                  <div className="grid w-full grid-cols-[minmax(0,1fr)_44px] gap-2">
                    <Button
                      variant="default"
                      size="lg"
                      className="min-h-12 w-full bg-[var(--coastal-action)] text-white hover:bg-[var(--coastal-action-hover)]"
                      onClick={() => openContactPanel({
                        propertyKey: listingKey,
                        propertyAddress: propertyContactAddress,
                        mode: isActiveListing ? "tour" : "agent",
                      })}
                    >
                      {isActiveListing ? <Calendar aria-hidden="true" className="mr-2 h-5 w-5" /> : <Mail aria-hidden="true" className="mr-2 h-5 w-5" />}
                      {isActiveListing ? "Book Visit" : "Ask About Property"}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Share property"
                          className="h-11 w-11 border-[var(--coastal-border)] hover:bg-[var(--surface-muted)]"
                        >
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem
                        onClick={async () => {
                          const canonical = `${window.location.origin}${propertyPathFor(property)}`
                          try {
                            await navigator.clipboard.writeText(canonical)
                            toast({ title: "Link copied", description: "Property link copied to clipboard." })
                          } catch { /* ignore */ }
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Link2 className="h-4 w-4" /> Copy link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const canonical = `${window.location.origin}${propertyPathFor(property)}`
                          const text = `Check out this property: ${property.address} — ${canonical}`
                          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <MessageCircle className="h-4 w-4" /> Share via WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const canonical = `${window.location.origin}${propertyPathFor(property)}`
                          const subject = `${property.address} — Property Listing`
                          const body = `Check out this property:\n${property.address}\n${canonical}`
                          window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Mail className="h-4 w-4" /> Share via Email
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const canonical = `${window.location.origin}${propertyPathFor(property)}`
                          const text = `Check out this property: ${property.address} — ${canonical}`
                          window.location.href = `sms:?body=${encodeURIComponent(text)}`
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Copy className="h-4 w-4" /> Share via iMessage
                      </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <WhatsAppButton
                    message={`Hi Reza, I'm interested in ${propertyContactAddress} (Listing ID: ${listingKey}). ${canonicalPropertyUrl}`}
                    size="md"
                    variant="full"
                    className="min-h-11 w-full justify-center rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:mt-8 sm:gap-8 lg:grid-cols-3 lg:gap-10">
              <div className="lg:col-span-2 space-y-6 sm:space-y-10">
                {/* Property Overview - Only render if we have valid content */}
                {(() => {
                  if (!property?.public_remarks || !property.public_remarks.trim()) {
                    return null // Don't render empty overview section
                  }

                  // Clean public_remarks to remove markdown headings and empty content
                  const cleanedRemarks = property.public_remarks
                    .replace(/^#{1,6}\s*$/gm, '') // Remove empty markdown headings (###, ##, etc.)
                    .replace(/^#{1,6}\s+/gm, '') // MLS remarks are displayed as plain text
                    .trim()

                  // Only render if there's actual content after cleaning
                  if (!cleanedRemarks || cleanedRemarks.length < 10) {
                    return null // Don't render empty or too-short content
                  }

                  return (
                    <div className="rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-4 shadow-sm sm:p-6 md:p-8">
                      <h2 className="text-xl sm:text-2xl font-bold text-[var(--coastal-text)] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                        <Building2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-[var(--coastal-primary)] flex-shrink-0" />
                        Property Overview
                      </h2>
                      <div className="prose prose-sm sm:prose-base md:prose-lg dark:prose-invert max-w-none">
                        <p className={`whitespace-pre-line text-sm leading-relaxed text-[var(--coastal-text)] sm:text-base ${showFullDescription ? "" : "line-clamp-8 sm:line-clamp-none"}`} itemProp="description">
                          {cleanedRemarks}
                        </p>
                      </div>
                      {cleanedRemarks.length > 520 && (
                        <button
                          type="button"
                          className="mt-3 min-h-11 text-sm font-semibold text-[var(--coastal-link)] hover:text-[var(--coastal-primary)] sm:hidden"
                          aria-expanded={showFullDescription}
                          onClick={() => setShowFullDescription((current) => !current)}
                        >
                          {showFullDescription ? "Show less" : "Read full description"}
                        </button>
                      )}
                    </div>
                  )
                })()}

                {hasPriceHistory && (
                  <PriceHistoryChart
                    priceHistory={priceHistory}
                    currentPrice={property.list_price}
                    previousListPrice={property.previous_list_price}
                    priceChangeTimestamp={property.price_change_timestamp}
                    listingContractDate={property.listing_contract_date}
                  />
                )}

                {/* Home Details */}
                <div className="rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-4 shadow-sm sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-[var(--coastal-text)] mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
                    <Building2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-[var(--coastal-primary)] flex-shrink-0" />
                    Home Details
                  </h2>
                  <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                    {homeFacts.map((fact) => (
                      <div key={fact.label} className="grid min-h-12 min-w-0 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-4 border-b border-[var(--coastal-border)] py-3 text-sm">
                        <dt className="min-w-0 break-words text-[var(--coastal-muted-text)]">{fact.label}</dt>
                        <dd className="min-w-0 break-words text-right font-semibold text-[var(--coastal-text)]">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {featureGroups.length > 0 && (
                  <div className="rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-4 shadow-sm sm:p-6 md:p-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--coastal-text)] flex items-center gap-2 sm:gap-3 mb-5 sm:mb-7">
                      <Bath className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-[var(--coastal-secondary)] flex-shrink-0" />
                      Features & Amenities
                    </h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {featureGroups.map((group) => (
                        <section key={group.title}>
                          <h3 className="mb-2 font-semibold text-[var(--coastal-text)]">{group.title}</h3>
                          <ul className="space-y-1.5 text-sm text-[var(--coastal-muted-text)]">
                            {group.values.map((value) => <li key={value} className="break-words">{value}</li>)}
                          </ul>
                        </section>
                      ))}
                    </div>
                  </div>
                )}

                {(communityFacts.length > 0 || schools.length > 0 || utilities.length > 0) && (
                  <div className="rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-4 shadow-sm sm:p-6 md:p-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--coastal-text)] mb-6 flex items-center gap-2 sm:gap-3">
                      <School className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-[var(--coastal-primary)] flex-shrink-0" />
                      Community, Schools & Utilities
                    </h2>
                    <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
                      {communityFacts.length > 0 && <FactList title="Community" facts={communityFacts} />}
                      {schools.length > 0 && <FactList title="Schools" facts={schools} />}
                      {utilities.length > 0 && <FactList title="Utilities" facts={utilities} />}
                    </div>
                    {localCityPath && (
                      <Link href={localCityPath} className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--coastal-accent-text)] hover:underline">
                        Browse more homes for sale in {property.city}
                      </Link>
                    )}
                  </div>
                )}

                {historySection}

                {/* Neighborhood data panel (Feature 7) */}
                {property.latitude && property.longitude && (
                  <ViewportDeferred
                    minHeight={220}
                    fallback={<div className="h-[220px] animate-pulse rounded-lg bg-[var(--surface-muted)]" aria-hidden="true" />}
                  >
                    <NeighborhoodPanel
                      lat={property.latitude}
                      lng={property.longitude}
                      zip={property.postal_code}
                    />
                  </ViewportDeferred>
                )}

                {/* Location & Neighborhood */}
                <div className="rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-4 shadow-sm sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-[var(--coastal-text)] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3"><MapPin className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-[var(--coastal-primary)] flex-shrink-0" />Location & Neighborhood</h2>
                  {property?.latitude && property?.longitude ? (
                    <div className="space-y-4" itemProp="geo" itemScope itemType="https://schema.org/GeoCoordinates">
                      <meta itemProp="latitude" content={property?.latitude.toString()} />
                      <meta itemProp="longitude" content={property?.longitude.toString()} />
                      {/* Static map fallback for SSR/SEO */}
                      <div className="relative h-64 w-full overflow-hidden rounded-lg border border-[var(--coastal-border)] bg-[var(--surface-muted)] sm:h-80 md:h-96">
                        {/* Static fallback image for SEO - renders on server */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-900">
                          <div className="text-center p-6 max-w-md">
                            <MapPin className="h-12 w-12 sm:h-16 sm:w-16 text-[var(--coastal-primary)] mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-[var(--coastal-text)] mb-2">{property?.address}</h3>
                            <p className="text-sm text-[var(--coastal-muted-text)] mb-4">
                              {property?.city}, {property.state || "CA"} {property?.postal_code}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <a
                                href={`https://www.google.com/maps?q=${property?.latitude},${property?.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-4 py-2 bg-[var(--coastal-action)] text-white rounded-lg hover:bg-[var(--coastal-action-hover)] transition-colors text-sm font-medium"
                              >
                                <MapPin className="h-4 w-4 mr-2" />
                                Open in Google Maps
                              </a>
                              <a
                                href={`http://maps.apple.com/?q=${property?.latitude},${property?.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-4 py-2 border border-[var(--coastal-border)] bg-[var(--surface)] text-[var(--coastal-text)] rounded-lg hover:bg-[var(--surface-muted)] transition-colors text-sm font-medium"
                              >
                                <MapPin className="h-4 w-4 mr-2" />
                                Open in Apple Maps
                              </a>
                            </div>
                          </div>
                        </div>
                        {/* Interactive map loads on client */}
                        <ViewportDeferred className="absolute inset-0 z-10" rootMargin="350px 0px">
                          <PropertyMap location={{ lat: property?.latitude, lng: property?.longitude }} address={property?.address} />
                        </ViewportDeferred>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Button variant="outline" onClick={() => window.open(`https://www.google.com/maps?q=${property?.latitude},${property?.longitude}`, '_blank')} className="flex-1 border-[var(--coastal-border)] text-[var(--coastal-accent-text)] hover:bg-[var(--surface-muted)] text-sm sm:text-base"><MapPin aria-hidden="true" className="h-4 w-4 mr-2" />Open in Google Maps</Button>
                        <Button variant="outline" onClick={() => window.open(`http://maps.apple.com/?q=${property?.latitude},${property?.longitude}`, '_blank')} className="flex-1 border-[var(--coastal-border)] text-[var(--coastal-accent-text)] hover:bg-[var(--surface-muted)] text-sm sm:text-base"><MapPin aria-hidden="true" className="h-4 w-4 mr-2" />Open in Apple Maps</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center rounded-lg bg-[var(--surface-muted)] sm:h-80 md:h-96">
                      <div className="text-center">
                        <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-[var(--coastal-muted-text)] mx-auto mb-4" />
                        <p className="text-sm sm:text-base text-[var(--coastal-muted-text)] font-medium">Location data not available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tour scheduler – positioned before FAQ section */}
                {isActiveListing ? (
                  <section id="schedule-tour" className="mt-6 scroll-mt-24">
                    <ViewportDeferred
                      minHeight={360}
                      rootMargin="650px 0px"
                      fallback={<div className="h-[360px] animate-pulse rounded-lg bg-[var(--surface-muted)]" aria-hidden="true" />}
                    >
                      <TourScheduler
                        propertyAddress={propertyContactAddress}
                        propertyKey={property.listing_key}
                      />
                    </ViewportDeferred>
                  </section>
                ) : (
                  <section className="mt-6 rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-5 sm:p-6" aria-labelledby="inactive-listing-title">
                    <h2 id="inactive-listing-title" className="text-lg font-semibold text-[var(--coastal-text)]">Explore currently available homes</h2>
                    <p className="mt-2 text-sm text-[var(--coastal-muted-text)]">
                      Tours cannot be booked for an inactive listing, but our team can help find a similar active property.
                    </p>
                    <Button asChild className="mt-4 bg-[var(--coastal-action)] text-white hover:bg-[var(--coastal-action-hover)]">
                      <Link href={activeListingsHref}>View active homes{property.city ? ` in ${property.city}` : ""}</Link>
                    </Button>
                  </section>
                )}

                {/* FAQ Section */}
                {faqs && faqs.length > 0 && (
                  <div className="rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-4 shadow-sm sm:p-6 md:p-8">
                    <PropertyFAQ faqs={faqs} propertyType={property.property_type} propertyAddress={property.address} />
                  </div>
                )}

                {marketContext}

                <section className="rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-5 sm:p-6" aria-labelledby="client-trust-title">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 id="client-trust-title" className="flex items-center gap-2 text-lg font-bold text-[var(--coastal-text)]">
                        <MessageSquareQuote aria-hidden="true" className="h-5 w-5 text-[var(--coastal-primary)]" />
                        What clients say
                      </h2>
                      <blockquote className="mt-3 max-w-xl text-sm italic text-[var(--coastal-muted-text)]">
                        &ldquo;Reza was the best agent we have ever worked with.&rdquo;
                        <cite className="mt-1 block text-xs font-medium not-italic text-[var(--coastal-text)]">
                          Russell &amp; Susan McQueen
                        </cite>
                      </blockquote>
                    </div>
                    <ClientTestimonialsBadge showModal />
                  </div>
                </section>

                <ViewportDeferred
                  minHeight={260}
                  fallback={<div className="h-[260px] animate-pulse rounded-lg bg-[var(--surface-muted)]" aria-hidden="true" />}
                >
                  <AffiliateServiceCards services={["inspection", "insurance", "moving"]} />
                </ViewportDeferred>
              </div>

              <div className="lg:col-span-1" id="contact">
                <div className="space-y-4 sm:space-y-6">
                  {/* Contact Form */}
                  <div className="rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-4 shadow-sm sm:p-6 md:p-8">
                    <div className="mb-4 flex items-center gap-3 sm:mb-6">
                      <h3 className="text-lg sm:text-xl font-bold text-[var(--coastal-text)] flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[var(--coastal-primary)] rounded-[var(--radius)] flex items-center justify-center flex-shrink-0">
                          <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        Get More Info
                      </h3>
                    </div>
                    {/* Support Team header */}
                    <div className="flex items-center gap-3 mb-4 sm:mb-5">
                      <div>
                        <p className="text-sm font-semibold text-[var(--coastal-text)]">
                          Crown Coastal Support Team
                        </p>
                        <p className="text-xs text-[var(--coastal-muted-text)]">
                          Direct support from our real estate team
                        </p>
                      </div>
                    </div>
                    <ContactForm
                      propertyId={property?.listing_key ?? ''}
                      proertyData={property}
                      allowTourRequest={isActiveListing}
                    />
                  </div>

                  {/* Estimate Your Payment */}
                  <ViewportDeferred
                    minHeight={420}
                    fallback={<div className="h-[420px] animate-pulse rounded-lg bg-[var(--surface-muted)]" aria-hidden="true" />}
                  >
                    <ListingPaymentEstimate
                      listingPrice={property.list_price}
                      listingKey={listingKey}
                      propertyAddress={propertyContactAddress}
                      propertyPageUrl={canonicalPropertyUrl}
                    />
                  </ViewportDeferred>

                  {/* Listing Agent */}
                  {(property?.list_agent_full_name || property?.list_agent_email) && (
                    <div className="rounded-lg border border-[var(--coastal-border)] bg-[var(--surface-muted)] p-3 sm:p-4 md:p-6">
                      <p className="mb-3 text-xs font-medium text-[var(--coastal-text)] sm:text-sm">Listing Agent</p>
                      <div className="space-y-2 text-xs sm:text-sm">
                        {property?.list_agent_full_name && (
                          <div>
                            <span className="text-[var(--coastal-muted-text)]">Name: </span>
                            <span itemProp="agent" className="font-medium text-[var(--coastal-text)]">
                              {property.list_agent_full_name}
                            </span>
                          </div>
                        )}
                        {property?.list_agent_email && (
                          <div>
                            <span className="text-[var(--coastal-muted-text)]">Email: </span>
                            <a href={`mailto:${property.list_agent_email}`} className="break-all font-medium text-[var(--coastal-link)] hover:underline">
                              {property.list_agent_email}
                            </a>
                          </div>
                        )}
                        {property?.list_agent_phone && (
                          <div>
                            <span className="text-[var(--coastal-muted-text)]">Phone: </span>
                            <a href={`tel:${property.list_agent_phone}`} className="font-medium text-[var(--coastal-link)] hover:underline">
                              {property.list_agent_phone}
                            </a>
                          </div>
                        )}
                        {property?.list_agent_dre && (
                          <div>
                            <span className="text-[var(--coastal-muted-text)]">MLS ID: </span>
                            <span className="font-medium text-[var(--coastal-text)]">
                              {property.list_agent_dre}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      <MobileListingCta
        listingKey={listingKey}
        propertyAddress={propertyContactAddress}
        price={property.list_price}
        isActive={isActiveListing}
      />

      {/* CRMLS Disclaimer */}
      <CRMLSDisclaimer />

      {/* Legacy TourContactPanel replaced by global ContactSlidePanel + TourScheduler */}
    </>
  )
}
