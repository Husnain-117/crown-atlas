"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "@/components/property-image"
import { Bed, Bath, Maximize, MapPin, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { propertyPathFor } from "@/lib/property-url"

interface Property {
  _id: string
  listing_key: string
  main_image_url: string
  title: string
  status: string
  statusColor: string
  list_price: number
  bedrooms: number
  bathrooms: number
  living_area_sqft: number | string
  lot_size_sqft: number | string
  city: string
  address: string
  images: string[]
  property_type: string
}

export default function PropertiesGrid({ properties }: { properties: Property[] }) {
  const [favoriteProperties, setFavoriteProperties] = useState<string[]>([])

  const toggleFavorite = (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault()
    e.stopPropagation()

    setFavoriteProperties((prev) =>
      prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId],
    )
  }


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {properties.map((property) => (
          <Link href={propertyPathFor(property)} key={property.listing_key || property._id}>
            <Card className="overflow-hidden h-full hover:shadow-md transition-all group">
              <div className="relative">
                <div className="relative h-48 sm:h-56 md:h-64">
                  <Image
                    src={property.images[0] || "/property-photo-pending.svg"}
                    alt={property.title || property.address}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Badge className={`absolute top-2 left-2 md:top-3 md:left-3 text-xs bg-green-600`}>
                    {property.property_type}
                  </Badge>
                  <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-[var(--surface)]/90 backdrop-blur-sm rounded-md px-2 py-1 md:px-3 md:py-1 text-xs md:text-sm font-medium">
                    ${property?.list_price?.toLocaleString?.() ?? property.list_price}
                  </div>

                  {/* Favorite Button */}
                  <Button
                    aria-label={`Save ${property.address || "property"}`}
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 md:top-3 md:right-3 h-8 w-8 rounded-full bg-[var(--surface)]/80 hover:bg-[var(--surface)]/90 text-[var(--coastal-muted-text)] hover:text-rose-500"
                    onClick={(e) => toggleFavorite(e, property._id)}
                  >
                    <Heart
                      className={`h-4 w-4 ${favoriteProperties.includes(property._id) ? "fill-rose-500 text-rose-500" : ""}`}
                    />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3 md:p-5">
                <h3 className="text-base md:text-xl font-semibold mb-1 md:mb-2 line-clamp-1 group-hover:text-[var(--coastal-primary)] transition-colors">
                  {property.address}
                </h3>
                <div className="flex items-center text-[var(--coastal-muted-text)] mb-2 md:mb-3">
                  <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                  <span className="text-xs md:text-sm line-clamp-1">{property.city}</span>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm">
                  <div className="flex items-center">
                    <Bed className="h-3 w-3 md:h-4 md:w-4 mr-1 text-[var(--coastal-muted-text)]" />
                    <span>{property.bedrooms ?? 0} Beds</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-3 w-3 md:h-4 md:w-4 mr-1 text-[var(--coastal-muted-text)]" />
                    <span>{property.bathrooms ?? 0} Baths</span>
                  </div>
                  <div className="flex items-center">
                    <Maximize className="h-3 w-3 md:h-4 md:w-4 mr-1 text-[var(--coastal-muted-text)]" />
                    <span>
                      {property.living_area_sqft ? `${property?.living_area_sqft?.toLocaleString?.() ?? property.living_area_sqft} Sq Ft` : `${property?.lot_size_sqft?.toLocaleString?.() ?? property.lot_size_sqft} Sq Ft`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

   
    </div>
  )
}
