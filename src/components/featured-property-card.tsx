"use client"

import { buildPropertyContactHref } from "@/lib/contact-context";

import { buildPropertyMediaUrls } from "@/lib/property-normalization";
import Link from "next/link"
import Image from "@/components/property-image"
import { CalendarDays, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { Property } from "@/interfaces"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { formatPriceWithCommasAndDecimals } from "@/lib/utils"
import { propertyPathFor } from "@/lib/property-url"

interface FeaturedPropertyCardProps {
  property: Property
}

export function FeaturedPropertyCard({ property }: FeaturedPropertyCardProps) {
  const router = useRouter()
  const {
    address,
    city,
    state,
    list_price,
    bedrooms,
    bathrooms,
    living_area_sqft,
    property_type,
    listing_key
  } = property

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  // Reset image error state and index when property changes
  useEffect(() => {
    setImageError(false)
    setCurrentImageIndex(0)
  }, [listing_key])

  const getAllImages = (): string[] => {
    const images = buildPropertyMediaUrls(property);
    return images.length ? images : ['/property-photo-pending.svg'];
  }

  const allImages = getAllImages()

  // Get current image source with fallback
  const getImageSrc = () => {
    if (imageError) {
      return '/property-photo-pending.svg'
    }
    return allImages[currentImageIndex] || allImages[0]
  }

  // Navigate to next image
  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  // Navigate to previous image
  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const formattedPrice = list_price ? formatPriceWithCommasAndDecimals(list_price) : 'Price on Request'

  const propertyUrl = propertyPathFor(property as any);

  return (
      <article 
        className="mx-auto flex h-full w-full max-w-[340px] min-w-0 cursor-pointer flex-col overflow-hidden rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] shadow-sm transition-shadow duration-300 hover:shadow-lg theme-transition"
        aria-labelledby={`featured-title-${listing_key}`}
        onClick={() => router.push(propertyUrl)}
      >
        {/* Image Container */}
        <div className="relative h-64 w-full bg-[#1a3b5c] group">
          <Image
            src={getImageSrc()}
            alt={`Property at ${address}`}
            fill
            sizes="340px"
            className="object-cover hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        
        {/* Image Navigation - Show on hover or if multiple images */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePrevImage(e);
              }}
              className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 opacity-100 transition-colors hover:bg-black/80 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNextImage(e);
              }}
              className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 opacity-100 transition-colors hover:bg-black/80 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
            {/* Image Counter */}
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          </>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4">
          <span className="bg-[#D7C39A] text-[#0F2340] text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider">
            For Sale
          </span>
        </div>
        
      </div>

      {/* Content Body */}
      <div className="flex min-w-0 flex-grow flex-col p-4 text-left">
        {/* Type */}
        <div className="mb-2 truncate text-xs font-bold text-[var(--coastal-link)]">
          {property_type || 'RESIDENTIAL'}
        </div>

        {/* Address */}
        <h3 
          id={`featured-title-${listing_key}`} 
          className="mb-0.5 min-h-[2.75rem] line-clamp-2 font-display text-[19px] font-medium leading-snug text-[var(--coastal-text)]"
        >
          {address}
        </h3>
        <div className="mb-3 truncate text-[13px] text-[var(--coastal-muted-text)]" title={[city, state].filter(Boolean).join(", ")}>
          {[city, state].filter(Boolean).join(", ") || "California"}
        </div>

        {/* Price */}
        <div className="mb-4 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
          <span 
            className="break-words font-display text-[22px] font-bold text-[var(--coastal-text)]"
          >
            {formattedPrice}
          </span>
          <span className="text-[var(--coastal-muted-text)] text-xs font-normal">listing price</span>
        </div>

        {/* Meta Stats */}
        <div className="mb-5 grid min-h-11 grid-cols-3 gap-2 border-b border-[var(--coastal-border)] pb-5 text-[var(--coastal-text)]">
          <div className="min-w-0">
            <span className="block truncate text-[15px] font-bold text-[var(--coastal-text)]">{bedrooms || 0}</span>
            <span className="block truncate text-xs text-[var(--coastal-muted-text)]">beds</span>
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[15px] font-bold text-[var(--coastal-text)]">{bathrooms || 0}</span>
            <span className="block truncate text-xs text-[var(--coastal-muted-text)]">baths</span>
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[15px] font-bold text-[var(--coastal-text)]" title={living_area_sqft?.toLocaleString("en-US") || "0"}>{living_area_sqft?.toLocaleString("en-US") || 0}</span>
            <span className="block truncate text-xs text-[var(--coastal-muted-text)]">sqft</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-2">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = propertyUrl;
            }}
            className="flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] px-2 py-2.5 text-sm font-bold text-[var(--coastal-primary)] transition-colors hover:bg-[var(--surface-muted)]"
          >
            <Eye className="h-4 w-4 shrink-0" />
            <span className="truncate">View home</span>
          </button>
          <Link 
            href={buildPropertyContactHref({
              listingKey: String(property.listing_key || property.id || ""),
              propertyAddress: [property.address, property.city, property.state].filter(Boolean).join(", "),
              propertyPageUrl: propertyPathFor(property),
            })}
            onClick={(e) => e.stopPropagation()}
            className="flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-lg bg-[var(--coastal-primary)] px-2 py-2.5 text-sm font-bold text-white shadow-medium transition-colors hover:bg-[var(--primary-hover)]"
          >
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span className="truncate">Book a tour</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
