"use client"

import { useState, useEffect } from 'react'
import { Property } from '@/interfaces'
import PropertyComparison from '@/components/comparison/property-comparison'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'
import useListProperties from '@/hooks/queries/useGetListProperties'
import { useComparison } from '@/contexts/comparison-context'
import Image from '@/components/property-image'

export default function ComparePageClient() {
  const [propertyIds, setPropertyIds] = useState<string[]>([])
  const [showPropertySearch, setShowPropertySearch] = useState(false)
  const { comparisonProperties, addToComparison, removeFromComparison, getComparisonCount } = useComparison()
  
  // Get property IDs from URL parameters on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search)
      const ids = (sp.get('properties') || '').split(',').filter(Boolean)
      setPropertyIds(ids)
    }
  }, [])
  
  // Fetch properties based on IDs (you'll need to modify this based on your API)
  const { data: propertiesData, isLoading } = useListProperties({
    skip: 0,
    limit: 50 // Get enough properties for search
  })

  useEffect(() => {
    if (propertiesData?.data && propertyIds.length > 0) {
      const properties = propertiesData.data.filter((property: Property) => 
        propertyIds.includes(property.listing_key)
      )
      // Add these properties to comparison context
      properties.forEach((property: Property) => addToComparison(property))
    }
  }, [propertiesData, propertyIds, addToComparison])

  const handleAddProperty = () => {
    setShowPropertySearch(true)
  }

  const handlePropertySelect = (property: Property) => {
    addToComparison(property)
    setShowPropertySearch(false)
  }

  const handleRemoveProperty = (propertyId: string) => {
    removeFromComparison(propertyId)
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

  const getImageSrc = (property: Property) => {
    return property.images?.[0] || 
           property.image || 
           property.main_image_url || 
           property.main_image || 
           property.photo_url || 
           property.listing_photos?.[0] ||
           getPropertyFallbackImage(property.property_type, property.list_price, property.listing_key)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-[var(--coastal-muted-text)]">Loading comparison...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="container mx-auto px-3 py-4 md:px-4 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/properties">
              <Button variant="outline" size="sm" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Back to Properties</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-[var(--coastal-text)]">Property Comparison</h1>
              <p className="text-xs md:text-sm text-[var(--coastal-muted-text)]">
                {getComparisonCount()}/4 properties selected
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleAddProperty}
            disabled={getComparisonCount() >= 4}
            className="flex items-center gap-2 text-xs md:text-sm w-full sm:w-auto justify-center"
            size="sm"
          >
            <Search className="h-3 w-3 md:h-4 md:w-4" />
            Add Property
          </Button>
        </div>

        {/* Property Search Modal */}
        {showPropertySearch && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-[var(--surface)] rounded-t-2xl sm:rounded-xl w-full sm:max-w-4xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
              <div className="p-4 md:p-6 border-b border-[var(--coastal-border)] sticky top-0 bg-[var(--surface)] z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-base md:text-xl font-semibold text-[var(--coastal-text)]">Select Property to Compare</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowPropertySearch(false)}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    ×
                  </Button>
                </div>
              </div>
              
              <div className="p-3 md:p-6 overflow-y-auto max-h-[70vh] md:max-h-[60vh]">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                  {propertiesData?.data
                    ?.filter((property: Property) => !comparisonProperties.find(p => p.listing_key === property.listing_key))
                    ?.slice(0, 12)
                    ?.map((property: Property) => (
                    <div 
                      key={property.listing_key}
                      className="border border-[var(--coastal-border)] rounded-lg p-2 md:p-4 cursor-pointer hover:border-[var(--coastal-primary)] hover:shadow-md transition-all duration-200 bg-[var(--surface)]"
                      onClick={() => handlePropertySelect(property)}
                    >
                      <div className="aspect-video bg-[var(--surface-muted)] rounded-lg mb-2 md:mb-3 overflow-hidden">
                        <Image
                          src={getImageSrc(property)}
                          alt={property.address}
                          width={300}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-medium text-xs md:text-sm line-clamp-1 md:line-clamp-2 mb-1 md:mb-2 text-[var(--coastal-text)]">
                        {property.address?.split(',')[0] || property.address}
                      </h3>
                      <p className="text-sm md:text-lg font-bold text-primary mb-0.5 md:mb-1">
                        ${property.list_price?.toLocaleString()}
                      </p>
                      <div className="flex justify-between text-[10px] md:text-xs text-[var(--coastal-muted-text)]">
                        <span>{property.bedrooms || 0} beds</span>
                        <span>{property.bathrooms || 0} baths</span>
                        <span className="hidden sm:inline">{property.living_area_sqft?.toLocaleString() || '-'} sqft</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Component */}
        <PropertyComparison 
          initialProperties={comparisonProperties}
          onPropertyRemove={handleRemoveProperty}
          onPropertyAdd={handleAddProperty}
        />
      </div>
    </div>
  )
}
