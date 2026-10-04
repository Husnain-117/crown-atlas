"use client"

import Image from "@/components/property-image"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Home, Building2 } from "lucide-react"
import type { CityData } from "@/lib/city-data"
import { propertyPathFor } from "@/lib/property-url"

interface ClusterMetadata {
  id: string
  name: string
  description: string
  category: 'property-type' | 'price-range' | 'feature' | 'geographic' | 'intent'
}

interface ClusterPageContentProps {
  cityData: CityData & {
    marketTrends?: Array<{
      metric: string
      value: string
      change?: string
      changeType?: "positive" | "negative" | "neutral"
    }>
  }
  clusterMetadata: ClusterMetadata
  intro: string
  faqs: Array<{ question: string; answer: string }>
  buyerTips: string
  properties: any[]
  totalProperties: number
  dataAvailable: boolean
  canonical: string
}

export default function ClusterPageContent({
  cityData,
  clusterMetadata,
  intro,
  faqs,
  buyerTips,
  properties,
  totalProperties,
  dataAvailable,
}: ClusterPageContentProps) {
  // Generate related cluster links
  const relatedClusters = getRelatedClusters(clusterMetadata, cityData)
  
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div>
        {/* Breadcrumbs */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-4 md:mt-6">
          <Breadcrumbs
            items={[
              { label: "Buy", href: "/buy" },
              { label: cityData.name, href: `/discover/${cityData.id}` },
              { label: clusterMetadata.name, href: `/discover/${cityData.id}/${clusterMetadata.id}` }
            ]}
            className="text-sm"
          />
        </section>

        {/* Hero Section */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-4 md:mt-6">
          <div className="relative h-[40vh] min-h-[300px] rounded-2xl overflow-hidden">
            <Image
              src={cityData.heroImage}
              alt={`${clusterMetadata.name} in ${cityData.name}`}
              fill
              className="object-cover"
              priority
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-end">
              <div className="container mx-auto px-4 pb-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
                  {clusterMetadata.name} in {cityData.name}, California
                </h1>
                <p className="text-lg md:text-xl text-white/90 max-w-3xl mb-4">
                  {intro}
                </p>
                {dataAvailable && (
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                      <Building2 className="h-4 w-4" />
                      {totalProperties} {totalProperties === 1 ? 'Property' : 'Properties'} Available
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Intro Content Section */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-7 md:mt-10">
          <div className="bg-[var(--surface)] p-5 md:p-6 lg:p-8 rounded-2xl border border-[var(--coastal-border)]">
            <div className="prose prose-lg max-w-none text-[var(--coastal-text)]">
              <p className="text-[var(--coastal-muted-text)] leading-relaxed mb-4">
                {intro}
              </p>
              <p className="text-[var(--coastal-muted-text)] leading-relaxed">
                {buyerTips}
              </p>
            </div>
          </div>
        </section>

        {/* Mini Market Stats */}
        {cityData.marketTrends && cityData.marketTrends.length > 0 && (
          <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-7 md:mt-10">
            <div className="bg-[var(--surface)] border border-[var(--coastal-border)] rounded-2xl p-6 md:p-8">
              <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl mb-5">
                {cityData.name} Market Snapshot
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {cityData.marketTrends?.slice(0, 4).map((trend: any, index: number) => (
                  <div
                    key={index}
                    className="bg-[var(--surface-muted)] p-4 rounded-lg text-center border border-[var(--coastal-border)]"
                  >
                    <Home className="h-8 w-8 mx-auto mb-2 text-[var(--coastal-secondary)]" />
                    <p className="font-bold text-[var(--coastal-text)] text-xl mb-1">
                      {trend.value}
                    </p>
                    <p className="text-sm text-[var(--coastal-muted-text)]">
                      {trend.metric}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--coastal-muted-text)] mt-4 text-center">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Source: MLS/CRMLS
              </p>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-7 md:mt-10">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faqs.map((faq) => ({
                    "@type": "Question",
                    name: faq.question,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: faq.answer.replace(/\[.*?\]/g, '').replace(/<[^>]*>/g, '')
                    }
                  }))
                })
              }}
            />
            <div className="bg-[var(--surface)] p-5 md:p-6 lg:p-8 rounded-2xl border border-[var(--coastal-border)]">
              <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl lg:text-3xl mb-4 md:mb-6 text-center">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                {faqs.map((faq, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-lg text-left hover:text-[var(--coastal-secondary)] text-[var(--coastal-text)]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[var(--coastal-muted-text)] leading-relaxed pt-2">
                      <div className="prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ 
                          __html: faq.answer
                            .replace(/\[neighborhoods\]/g, `<a href="/neighborhoods?city=${encodeURIComponent(cityData.name)}" class="text-[var(--coastal-primary)] hover:underline">neighborhoods page</a>`)
                            .replace(/\[contact\]/g, `<a href="/contact" class="text-[var(--coastal-primary)] hover:underline">contact our agents</a>`)
                            .replace(/\[affordability\]/g, `<a href="/contact" class="text-[var(--coastal-primary)] hover:underline">affordability calculator</a>`)
                        }} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}

        {/* Property Listings */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-7 md:mt-10">
          <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl mb-4 md:mb-6">
            {clusterMetadata.name} in {cityData.name}
          </h2>
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((property: any) => {
                const price = property.list_price || property.current_price
                  ? `$${Math.round(property.list_price || property.current_price || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                  : "Price TBD"
                const beds = property.bedrooms || 0
                const baths = property.bathrooms || 0
                const sqft = property.living_area_sqft || 0
                const img = property.images?.[0] || property.main_image_url || property.image || "/placeholder.svg"
                const address = property.address || property.city || cityData.name
                const propertyId = property.listing_key || property.id
                const detailUrl = propertyPathFor(property)

                return (
                  <article
                    key={propertyId}
                    className="bg-[var(--surface)] border border-[var(--coastal-border)] rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <Link href={detailUrl} className="block">
                      <div className="relative h-48">
                        <Image
                          src={img}
                          alt={address}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="font-bold text-[var(--coastal-primary)] text-lg mb-2">
                          {price}
                        </div>
                        {(beds > 0 || baths > 0) && (
                          <div className="text-sm text-[var(--coastal-muted-text)] mb-2">
                            {beds > 0 && `${beds} Beds`}
                            {beds > 0 && baths > 0 && " · "}
                            {baths > 0 && `${baths} Ba`}
                            {sqft > 0 && ` · ${sqft.toLocaleString()} sqft`}
                          </div>
                        )}
                        <div className="text-sm text-[var(--coastal-muted-text)]">
                          {address}
                        </div>
                      </div>
                    </Link>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="bg-[var(--surface)] p-8 rounded-2xl border border-[var(--coastal-border)] text-center">
              <p className="text-[var(--coastal-muted-text)] mb-4">
                No properties found in this category. Check back soon or <Link href="/contact" className="text-[var(--coastal-primary)] hover:underline">contact us</Link> to be notified when new listings become available.
              </p>
            </div>
          )}
        </section>

        {/* Related Clusters */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-7 md:mt-10">
          <div className="bg-[var(--surface)] p-5 md:p-6 lg:p-8 rounded-2xl border border-[var(--coastal-border)]">
            <h2 className="font-bold text-[var(--coastal-text)] text-xl md:text-2xl mb-4 md:mb-6">
              Explore More in {cityData.name}
            </h2>
            <p className="text-[var(--coastal-muted-text)] mb-6 leading-relaxed">
              Browse other property types and price ranges in {cityData.name}:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedClusters.map((cluster) => (
                <Link
                  key={cluster.id}
                  href={`/discover/${cityData.id}/${cluster.id}`}
                  className="p-4 bg-[var(--surface-muted)] rounded-lg border border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] transition-colors"
                >
                  <h3 className="font-semibold text-[var(--coastal-text)] mb-2">
                    {cluster.name}
                  </h3>
                  <p className="text-sm text-[var(--coastal-muted-text)]">
                    {cluster.description}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-[var(--coastal-border)]">
              <Link
                href={`/discover/${cityData.id}`}
                className="text-[var(--coastal-primary)] hover:underline font-medium"
              >
                ← Back to {cityData.name} Overview
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function getRelatedClusters(clusterMetadata: ClusterMetadata, _cityData: { id: string; name: string }) {
  // Return 6 related clusters (different from current)
  const allClusters = [
    { id: 'houses-for-sale', name: 'Homes for Sale', description: 'Single-family homes' },
    { id: 'condos-for-sale', name: 'Condos for Sale', description: 'Condominiums and townhomes' },
    { id: 'under-500k', name: 'Under $500K', description: 'Affordable homes' },
    { id: 'under-1m', name: 'Under $1M', description: 'Homes under $1 million' },
    { id: 'luxury-homes', name: 'Luxury Homes', description: 'Premium properties $2M+' },
    { id: 'pool', name: 'Homes with Pool', description: 'Properties with private pools' },
  ]
  
  return allClusters
    .filter(c => c.id !== clusterMetadata.id)
    .slice(0, 6)
}
