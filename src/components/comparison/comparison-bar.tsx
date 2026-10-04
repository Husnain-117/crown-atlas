"use client"

import React from 'react'
import { useComparison } from '@/contexts/comparison-context'
import { Button } from '@/components/ui/button'
import { X, Scale, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from '@/components/property-image'
import { formatPriceWithCommasAndDecimals } from "@/lib/utils"

// Format price compactly for mobile
const formatPriceCompact = (price: number) => {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `$${(price / 1000).toFixed(0)}K`;
  }
  return formatPriceWithCommasAndDecimals(price);
};

export default function ComparisonBar() {
  const { comparisonProperties, removeFromComparison, clearComparison, getComparisonCount } = useComparison()

  if (comparisonProperties.length === 0) {
    return null
  }

  const getPropertyFallbackImage = (propertyType: string, price: number, listingKey?: string) => {
    const propertyImages = [
      "/property-photo-pending.svg",
      "/modern-beach-house.png", 
      "/modern-ocean-living.png",
      "/luxury-master-bedroom.png",
      "/california-coastal-sunset.png",
      "/san-diego-bay-sunset.png",
      "/los.jpg",
      "/city/california/san-francisco/san-francisco-ca.webp"
    ]

    let imageIndex = 0
    const varietyFactor = listingKey ? parseInt(listingKey.slice(-1)) || 0 : 0
    
    if (propertyType?.toLowerCase().includes('lease') || propertyType?.toLowerCase().includes('rent')) {
      imageIndex = (1 + varietyFactor) % 4
    } else if (price > 800000) {
      imageIndex = varietyFactor % 2 === 0 ? 0 : 2
    } else if (price > 500000) {
      imageIndex = (2 + varietyFactor) % 6
    } else if (price > 300000) {
      imageIndex = (1 + varietyFactor) % 5
    } else {
      imageIndex = varietyFactor % 8
    }

    return propertyImages[imageIndex] || "/california-coastal-sunset.png"
  }

  const getImageSrc = (property: any) => {
    return property.images?.[0] || 
           property.image || 
           property.main_image_url || 
           property.main_image || 
           property.photo_url || 
           property.listing_photos?.[0] ||
           getPropertyFallbackImage(property.property_type, property.list_price, property.listing_key)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-[var(--surface)] shadow-[0_-4px_20px_rgba(0,0,0,0.15)] border-t border-[var(--coastal-border)] safe-area-bottom theme-transition">
      {/* Main container with proper padding */}
      <div className="px-2 sm:px-3 md:px-6 py-3 md:py-4 max-w-6xl mx-auto w-full">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 md:h-5 md:w-5 text-[#6FA8A3]" />
            <h3 className="font-semibold text-sm md:text-base text-[var(--coastal-text)]">
              Comparing {getComparisonCount()} {getComparisonCount() === 1 ? "home" : "homes"}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearComparison}
            className="text-[var(--coastal-muted-text)] hover:text-[var(--coastal-text)] text-xs md:text-sm h-7 md:h-8 px-2 md:px-3 theme-transition"
          >
            Clear All
          </Button>
        </div>

        {/* Content row - thumbnails and button */}
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          {/* Property thumbnails - scrollable on mobile */}
          <div className="flex gap-2 flex-1 min-w-0 overflow-x-auto pb-1 scrollbar-hide">
            {comparisonProperties.map((property) => (
              <div
                key={property.listing_key}
                className="relative group bg-[var(--surface-muted)] rounded-lg overflow-hidden flex-shrink-0 theme-transition"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 relative">
                  <Image
                    src={getImageSrc(property)}
                    alt={property.address || 'Property'}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Remove button - always visible on mobile, hover on desktop */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-0.5 -right-0.5 h-5 w-5 md:h-6 md:w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-md z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromComparison(property.listing_key);
                  }}
                >
                  <X className="h-2.5 w-2.5 md:h-3 md:w-3" />
                </Button>
                {/* Price label */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-[10px] md:text-xs py-0.5 px-1 text-center truncate">
                  {formatPriceCompact(property.list_price)}
                </div>
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: 4 - comparisonProperties.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="w-14 h-14 md:w-16 md:h-16 border-2 border-dashed border-[var(--coastal-border)] rounded-lg flex items-center justify-center flex-shrink-0 theme-transition"
              >
                <span className="text-[var(--coastal-muted-text)] text-lg">+</span>
              </div>
            ))}
          </div>

          {/* Compare button - always visible and not cut off */}
          <Link
            href={`/compare?properties=${encodeURIComponent(
              comparisonProperties.map((p) => p.listing_key).join(",")
            )}`}
            className="flex-shrink-0"
          >
            <Button 
              className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 h-9 sm:h-10 md:h-11 px-2.5 sm:px-3 md:px-4 lg:px-5 bg-[#6FA8A3] hover:bg-[#5a8d88] text-white rounded-lg sm:rounded-xl shadow-md whitespace-nowrap transition-all duration-300"
              size="sm"
            >
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs md:text-sm font-medium">View comparison</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
