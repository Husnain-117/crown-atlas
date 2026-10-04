"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { PropertyCard } from "@/components/property-card"
import type { Property as CanonicalProperty } from "@/interfaces"

// Map view property type extends the canonical Property with a derived square_feet field
export type Property = CanonicalProperty & {
  square_feet?: number
}

interface Data {
  faq_content: string
  amenities_content: string
  page_content: string
  meta_description: string
  title: string
  seo_title?: string
}

interface FaqItem {
  question: string
  answer: string
}

function parseFaqs(value: string | undefined): FaqItem[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is FaqItem => Boolean(item?.question && item?.answer))
      : []
  } catch {
    return []
  }
}

interface PropertyListPanelProps {
  onPropertyClick?: () => void
  filteredPropertyIds?: string[]
  properties: Property[]
  onPropertyHover?: (id: string | null) => void
  data?: Data | null
  isLoading: boolean
}

export default function PropertyListPanel({
  onPropertyClick,
  filteredPropertyIds,
  onPropertyHover,
  properties,
  data,
  isLoading,
}: PropertyListPanelProps) {
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null)
  const faqs = parseFaqs(data?.faq_content)

  const handlePropertyHover = (id: string | null) => {
    setHoveredProperty(id)
    if (onPropertyHover) {
      onPropertyHover(id)
    }
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-shrink-0 px-3 py-2.5 md:p-4 border-b border-[var(--coastal-border)] bg-[var(--surface)] sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base md:text-lg text-[var(--coastal-text)]">Properties</h2>
          <span className="text-xs md:text-sm text-[var(--coastal-muted-text)] bg-[var(--surface-muted)] px-2 py-1 rounded-full">
            {isLoading ? "Updating..." : `${properties.length} found`}
          </span>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8 text-center min-h-0">
          <div>
            <MapPin className="h-12 w-12 text-[var(--coastal-muted-text)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--coastal-text)] mb-2">No properties found</h3>
            <p className="text-sm text-[var(--coastal-muted-text)]">
              {filteredPropertyIds
                ? "There are no properties in your selected area. Try drawing a different area on the map."
                : "No properties match your current filters. Try adjusting your search criteria."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 pb-20">
          {/* 2-column grid of property cards - compact for map view */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 map-property-grid">
            {properties.map((property) => (
              <div
                key={property.listing_key || property.id}
                onClick={onPropertyClick}
                onMouseEnter={() => handlePropertyHover(property.listing_key)}
                onMouseLeave={() => handlePropertyHover(null)}
                className={hoveredProperty === property.listing_key ? "ring-2 ring-[var(--coastal-primary)] rounded-2xl" : ""}
              >
                <PropertyCard
                  property={property}
                  showCompareButton={false}
                />
              </div>
            ))}
          </div>
          
           {/* SEO Content Section */}
           {data && (
            <div className="p-6 border-t border-[var(--coastal-border)] bg-gradient-to-r from-[var(--surface-muted)] to-[var(--surface)]">
              {data.title && (
                <h3 className="font-bold text-2xl text-[var(--coastal-text)] mb-3">{data.seo_title || data.title}</h3>
              )}
              
              {data.page_content && (
                <div className="prose prose-lg text-[var(--coastal-text)] mb-6">
                  <ReactMarkdown>
                    {data.page_content}
                  </ReactMarkdown>
                </div>
              )}
              
              {data.amenities_content && (
                <div className="mb-6">
                  <h4 className="font-semibold text-lg text-[var(--coastal-secondary)] mb-2">Amenities</h4>
                  <div className="prose prose-base text-[var(--coastal-text)]">
                    <ReactMarkdown>
                      {data.amenities_content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              
              {faqs && faqs.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg text-[var(--coastal-primary)] mb-3">Frequently Asked Questions</h4>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="bg-[var(--surface-muted)] rounded-lg p-4 shadow-sm">
                        <h5 className="font-semibold text-[var(--coastal-text)] mb-1">{faq.question}</h5>
                        <p className="text-[var(--coastal-muted-text)]">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--coastal-border);
          border-radius: 8px;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: var(--coastal-border) transparent;
        }

        /* Compact property cards for map view */
        .map-property-grid a {
          max-width: 100%;
        }
        .map-property-grid .h-64 {
          height: 180px !important;
        }
        .map-property-grid .p-6 {
          padding: 1rem !important;
        }
        .map-property-grid .text-xl {
          font-size: 0.95rem !important;
          line-height: 1.3 !important;
        }
        .map-property-grid .text-2xl {
          font-size: 1.25rem !important;
        }
        .map-property-grid .mb-4 {
          margin-bottom: 0.75rem !important;
        }
        .map-property-grid .gap-3 {
          gap: 0.5rem !important;
        }
      `}</style>
    </div>
  )
}
