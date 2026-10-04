"use client";

import { buildPropertyContactHref } from "@/lib/contact-context";

import Link from "next/link";
import Image from "@/components/property-image";
import { useRouter } from "next/navigation";
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Scale,
  ChevronLeft,
  ChevronRight,
  Video,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Eye,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatPriceWithCommasAndDecimals } from "@/lib/utils";
import { Property } from "@/interfaces";
import React, { useState } from "react";
import { useComparison } from "@/contexts/comparison-context";
import {
  safeBeds,
  safeBaths,
  safeNumber,
  safeSqft,
} from "@/lib/utils/safeField";
import { propertyPathFor } from "@/lib/property-url";
import { buildPropertyMediaUrls } from "@/lib/property-normalization";

// Helper function to normalize optional fields before storing in comparison context.
function convertToProperty(detail: Property): Property {
  // Normalize null values to undefined for fields that Property expects as undefined
  const normalized = {
    ...detail,
    h1_heading: (detail as any).h1_heading ?? undefined,
    title: (detail as any).title ?? undefined,
    seo_title: (detail as any).seo_title ?? undefined,
    id: (detail as any)._id || (detail as any).id || detail.listing_key,
  };
  return normalized as Property;
}

interface PropertyCardProps {
  property: Property;
  showCompareButton?: boolean;
  onCompareClick?: (property: Property) => void;
  highlighted?: boolean;
  schedule?: React.ReactNode;
}

export function PropertyCard({
  property,
  showCompareButton = true,
  onCompareClick,
  highlighted = false,
  schedule,
}: PropertyCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToComparison, isInComparison } = useComparison();

  // Do not fetch per-card details here. The parent list already provides all data.
  const displayData = property;
  // Reset image error state and index when property changes
  React.useEffect(() => {
    setImageError(false);
    setCurrentImageIndex(0);
  }, [property.listing_key]);

  const getAllImages = (): string[] => {
    const images = buildPropertyMediaUrls(displayData);
    return images.length ? images : ["/property-photo-pending.svg"];
  };

  const allImages = getAllImages();

  // Get current image source with fallback
  const getImageSrc = () => {
    if (imageError) {
      return "/property-photo-pending.svg";
    }
    return allImages[currentImageIndex] || allImages[0];
  };

  // Navigate to next image
  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  // Navigate to previous image
  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Sanitize address
  const sanitizeAddress = (addr: string) => {
    return addr
      .trim()
      .replace(/^0+\s+/, "")
      .replace(/\s{2,}/g, " ");
  };

  const address = sanitizeAddress(displayData.address || "");
  const city = displayData.city || "";
  const county = displayData.county || "";
  const state = displayData.state || "CA";
  const countyLabel = county && ![city, state].some((value) => value.toLowerCase() === county.toLowerCase())
    ? `${county.replace(/\s+County$/i, "")} County`
    : "";
  const locationLabel = [city, countyLabel, state].filter(Boolean).join(", ");
  const isForRent = displayData.property_type?.toLowerCase().includes("lease") ?? false;

  // Format property type by adding spaces before capital letters (e.g., "CommercialSale" -> "Commercial Sale")
  const formatPropertyType = (type: string | undefined) => {
    if (!type) return "";
    return type.replace(/([a-z])([A-Z])/g, "$1 $2");
  };
  const propertyTypeDisplay = formatPropertyType(
    displayData.property_sub_type || displayData.property_type
  );

  // Use safeField utilities for proper null handling
  // Support both field name variations for compatibility
  const bedsDisplay = safeBeds(displayData.bedrooms || displayData.bedrooms_total);
  const bathsDisplay = safeBaths(displayData.bathrooms || displayData.bathrooms_total);
  const price = Number(displayData.list_price);
  const priceDisplay = price && !isNaN(price) ? formatPriceWithCommasAndDecimals(price) : null;
  const hoaFee = safeNumber((displayData as any).hoa_fee);
  const hasLivingArea = Number(displayData.living_area_sqft || displayData.living_area) > 0;
  const lotDisplay = safeSqft(
    displayData.living_area_sqft || displayData.living_area || displayData.lot_size_sqft || displayData.lot_size_sq_ft
  );
  const areaLabel = hasLivingArea ? "" : " lot";

  // Feature 4 – urgency & market signals
  const daysOnMarket = (displayData as any).days_on_market as number | undefined;
  const previousListPrice = (displayData as any).previous_list_price as number | undefined;
  const hasReduction =
    typeof previousListPrice === "number" &&
    previousListPrice > 0 &&
    typeof displayData.list_price === "number" &&
    displayData.list_price < previousListPrice;

  let badgeLabel: string | null = null;
  let badgeColor = "";
  if (typeof daysOnMarket === "number" && daysOnMarket <= 3) {
    badgeLabel = "Just Listed";
    badgeColor = "bg-emerald-600";
  } else if (hasReduction) {
    badgeLabel = "Price Reduced";
    badgeColor = "bg-red-600";
  } else if (typeof daysOnMarket === "number" && daysOnMarket >= 60) {
    badgeLabel = `${daysOnMarket} days listed`;
    badgeColor = "bg-slate-600";
  }

  const pricePerSqft =
    typeof displayData.list_price === "number" &&
    typeof displayData.living_area_sqft === "number" &&
    displayData.living_area_sqft > 0
      ? Math.round(displayData.list_price / displayData.living_area_sqft)
      : null;

  const propertyUrl = propertyPathFor(displayData as any);

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if clicking directly on the card, not on buttons or links
    if ((e.target as HTMLElement).closest('a, button')) {
      return;
    }
    router.push(propertyUrl);
  };

  return (
    <div
      key={property.listing_key || property.id}
      onClick={handleCardClick}
      className={cn(
        "group min-w-0 overflow-hidden bg-[var(--surface)] rounded-lg shadow-soft hover:shadow-strong p-0 w-full flex flex-col relative transition-all duration-300 border theme-transition cursor-pointer",
        highlighted
          ? "border-[var(--coastal-primary)] ring-2 ring-[var(--coastal-primary)]/40"
          : "border-[var(--coastal-border)]"
      )}
    >
      {/* Status badges */}
      <div className="absolute top-3 left-3 z-20 flex max-w-[calc(100%_-_4.5rem)] flex-col items-start gap-1.5">
        <div
          className={`max-w-full truncate px-2.5 py-1.5 rounded-md text-xs font-bold uppercase backdrop-blur-sm border shadow-medium ${isForRent
            ? "bg-[var(--coastal-secondary)]/95 border-[var(--coastal-secondary)]/50 text-[#083133]"
            : "bg-[var(--coastal-primary)]/95 border-[var(--coastal-primary)]/50 text-white"
            }`}
        >
          {isForRent ? "For Rent" : "For Sale"}
        </div>

        {badgeLabel && (
          <div
            className={cn(
              "max-w-full truncate px-2.5 py-1.5 rounded-md text-xs font-bold backdrop-blur-sm border shadow-medium text-white",
              badgeColor === "bg-emerald-600" && "bg-emerald-600/95 border-emerald-600/50",
              badgeColor === "bg-red-600" && "bg-red-600/95 border-red-600/50",
              badgeColor === "bg-slate-600" && "bg-slate-600/95 border-slate-600/50"
            )}
          >
            {badgeLabel}
          </div>
        )}

        {((displayData as any).VirtualTourURLUnbranded || (property as any).virtual_tour_url) && (
          <button type="button" className="max-w-full px-2.5 py-1.5 rounded-md text-xs font-bold backdrop-blur-sm border border-white/40 bg-white/95 text-[var(--coastal-text)] shadow-medium flex items-center gap-1.5 transition-colors duration-200 hover:bg-white cursor-pointer"
            title="3D Virtual Tour Available"
            onClick={(e) => {
              e.stopPropagation();
              window.open((displayData as any).VirtualTourURLUnbranded || (property as any).virtual_tour_url, "_blank");
            }}>
            <Video className="w-3.5 h-3.5 text-[var(--coastal-primary)]" />
            <span className="hidden sm:inline">3D TOUR</span>
          </button>
        )}
      </div>

      {/* Compare button */}
      <div className="absolute right-3 top-3 z-30 flex flex-row gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
        {/* Compare Button */}
        {showCompareButton && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-md bg-[var(--surface)]/95 hover:bg-[var(--surface-muted)] border border-[var(--coastal-border)]/50 backdrop-blur-sm shadow-medium transition-colors duration-200 theme-transition relative z-30",
              isInComparison(displayData.listing_key || property.listing_key)
                ? "text-[var(--coastal-secondary)] border-[var(--coastal-secondary)] bg-[var(--chip-active)]"
                : "text-[var(--coastal-muted-text)] hover:text-[var(--coastal-secondary)]"
            )}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const propertyToAdd = convertToProperty(displayData || property);
              addToComparison(propertyToAdd);
              onCompareClick?.(propertyToAdd);
            }}
            title={
              isInComparison(displayData.listing_key || property.listing_key)
                ? "Property in comparison"
                : "Add to comparison"
            }
          >
            <Scale
              className={cn(
                "h-5 w-5 transition-all duration-300 group-hover:scale-110",
                isInComparison(displayData.listing_key || property.listing_key) && "text-[var(--coastal-secondary)]"
              )}
            />
          </Button>
        )}
      </div>

      {/* Property image with carousel */}
      <div className="relative h-56 sm:h-60 bg-[var(--surface-muted)] flex items-center justify-center overflow-hidden theme-transition">
        <Image
          src={getImageSrc()}
          alt={`${propertyTypeDisplay || "Real Estate"} ${isForRent ? "for rent" : "for sale"} at ${address}${locationLabel ? `, ${locationLabel}` : ""}${bedsDisplay ? ` featuring ${bedsDisplay}` : ""}${bathsDisplay ? ` and ${bathsDisplay}` : ""}`}
          fill
          sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => {
            if (currentImageIndex < allImages.length - 1) {
              setCurrentImageIndex((index) => index + 1);
            } else {
              setImageError(true);
            }
          }}
          onLoad={(e) => {
            const imgEl = e.currentTarget as HTMLImageElement;
            if (imgEl.naturalWidth <= 2 && imgEl.naturalHeight <= 2) {
              setImageError(true);
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--coastal-primary)]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Image navigation arrows - only show if more than 1 image */}
        {allImages.length > 1 && (
          <>
            {/* Previous button - always visible when multiple images */}
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/95 dark:bg-gray-800/95 hover:bg-white dark:hover:bg-gray-700 flex items-center justify-center shadow-lg transition-colors duration-200 border border-gray-200/50 dark:border-gray-700/50 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Previous listing image"
              type="button"
            >
              <ChevronLeft className="h-5 w-5 text-gray-800 dark:text-white" />
            </button>

            {/* Next button - always visible when multiple images */}
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/95 dark:bg-gray-800/95 hover:bg-white dark:hover:bg-gray-700 flex items-center justify-center shadow-lg transition-colors duration-200 border border-gray-200/50 dark:border-gray-700/50 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Next listing image"
              type="button"
            >
              <ChevronRight className="h-5 w-5 text-gray-800 dark:text-white" />
            </button>

            <div
              className="absolute bottom-3 right-3 z-30 rounded-md bg-[var(--coastal-primary)]/90 px-2 py-1 text-xs font-semibold text-white shadow-medium backdrop-blur-sm"
              aria-live="polite"
            >
              {currentImageIndex + 1} / {allImages.length}
            </div>
          </>
        )}

        {/* Type badge - positioned at bottom-left of image */}
        <div className="absolute bottom-3 left-3 z-20 max-w-[calc(100%_-_6rem)] truncate rounded-md border border-[var(--coastal-border)]/50 bg-[var(--surface)]/95 px-2.5 py-1.5 text-xs font-bold text-[var(--coastal-text)] shadow-medium backdrop-blur-sm theme-transition">
          {propertyTypeDisplay || "Residential"}
        </div>
      </div>

      {schedule}
      <div className="min-w-0 p-4 sm:p-5 flex flex-col flex-1">
        <div className="mb-3 min-w-0">
          <h3 className="mb-1.5 min-h-[2.75rem] text-lg font-bold text-[var(--coastal-primary)] line-clamp-2 leading-snug group-hover:text-[var(--primary-hover)] transition-colors duration-300">
            {address || city || "Property"}
          </h3>
          <div className="flex min-w-0 items-center text-[var(--coastal-muted-text)] text-sm theme-transition">
            <MapPin className="h-4 w-4 mr-2 shrink-0 text-[var(--coastal-link)]" />
            <span className="min-w-0 truncate font-medium" title={locationLabel}>
              {locationLabel || "California"}
            </span>
          </div>
        </div>

        <div className="mb-3 min-h-[3.25rem]">
          <div className="break-words text-2xl font-bold text-[var(--coastal-primary)] theme-transition">
            {priceDisplay || "Contact for Price"}
          </div>
          {pricePerSqft && (
            <div className="mt-1 text-xs font-semibold text-[var(--coastal-muted-text)]">
              ${pricePerSqft.toLocaleString("en-US")} per sq ft
            </div>
          )}
          {isForRent && <div className="text-sm text-[var(--coastal-muted-text)] font-medium theme-transition">per month</div>}
        </div>

        {/* Additional Property Details */}
        <div className="mb-4 space-y-2">
          {/* Year Built & HOA Fee Row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            {displayData.year_built && (
              <div className="flex min-w-0 items-center gap-1.5 text-[var(--coastal-muted-text)]">
                <Building2 className="h-4 w-4 shrink-0 text-[var(--coastal-primary)]" />
                <span className="font-medium">Built {displayData.year_built}</span>
              </div>
            )}
            {hoaFee !== null && (
              <div className="flex min-w-0 items-center gap-1.5 text-[var(--coastal-muted-text)]">
                <CircleDollarSign className="h-4 w-4 shrink-0 text-[var(--coastal-link)]" />
                <span className="min-w-0 font-medium">
                  HOA {formatPriceWithCommasAndDecimals(hoaFee)}
                  {(() => {
                    const frequency = String((displayData as any).hoa_fee_frequency || "").toLowerCase()
                    if (frequency === "monthly") return "/mo"
                    if (frequency === "quarterly") return "/qtr"
                    if (frequency === "annually" || frequency === "annual") return "/yr"
                    if (frequency === "semiannually") return "/6 mo"
                    return frequency ? ` ${frequency}` : ""
                  })()}
                </span>
              </div>
            )}
          </div>

          {/* School Rating */}
          {(displayData as any).school_rating && (displayData as any).school_rating > 0 && (
            <div className="flex min-w-0 items-center gap-1.5 text-sm text-[var(--coastal-muted-text)]">
              <GraduationCap className="h-4 w-4 shrink-0 text-[var(--coastal-primary)]" />
              <span className="font-medium">School Rating: {(displayData as any).school_rating}/10</span>
            </div>
          )}

        </div>

        <div className="mt-auto grid min-h-14 grid-cols-3 items-center gap-2 border-t border-[var(--coastal-border)] pt-4 text-sm text-[var(--coastal-muted-text)] theme-transition">
          {/* Only show beds if available */}
          {bedsDisplay && (
            <div className="flex min-w-0 items-center gap-1.5">
              <div className="p-1.5 rounded-lg bg-[var(--surface-muted)]">
                <Bed className="h-4 w-4 text-[var(--coastal-primary)]" />
              </div>
              <span className="min-w-0 truncate font-semibold">
                {bedsDisplay}
              </span>
            </div>
          )}

          {/* Only show baths if available */}
          {bathsDisplay && (
            <div className="flex min-w-0 items-center gap-1.5">
              <div className="p-1.5 rounded-lg bg-[var(--surface-muted)]">
                <Bath className="h-4 w-4 text-[var(--coastal-secondary)]" />
              </div>
              <span className="min-w-0 truncate font-semibold">
                {bathsDisplay}
              </span>
            </div>
          )}

          {/* Only show lot size if available */}
          {lotDisplay && (
            <div className="flex min-w-0 items-center gap-1.5">
              <div className="p-1.5 rounded-lg bg-[var(--surface-muted)]">
                <Square className="h-4 w-4 text-[var(--coastal-primary)]" />
              </div>
              <span className="min-w-0 truncate text-xs font-semibold" title={`${lotDisplay}${areaLabel}`}>
                {lotDisplay}{areaLabel}
              </span>
            </div>
          )}

          {/* If no property details available, show placeholder */}
          {!bedsDisplay && !bathsDisplay && !lotDisplay && (
            <div className="col-span-3 w-full text-center text-xs italic text-[var(--coastal-muted-text)]">
              Contact for details
            </div>
          )}
        </div>

        {/* Conversion CTAs */}
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-2 border-t border-[var(--coastal-border)] pt-4">
          <Link
            href={propertyUrl}
            onClick={(e) => e.stopPropagation()}
            className="flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] px-2.5 py-2.5 text-center text-sm font-semibold text-[var(--coastal-primary)] transition-colors duration-200 hover:bg-[var(--surface-muted)]"
          >
            <Eye className="h-4 w-4 shrink-0" />
            <span className="truncate">View home</span>
          </Link>
          <Link
            href={buildPropertyContactHref({
              listingKey: String(property.listing_key || property.id || ""),
              propertyAddress: [property.address, property.city, property.state].filter(Boolean).join(", "),
              propertyPageUrl: propertyPathFor(property),
            })}
            onClick={(e) => e.stopPropagation()}
            className="flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-lg bg-[var(--coastal-primary)] px-2.5 py-2.5 text-center text-sm font-semibold text-white shadow-medium transition-colors duration-200 hover:bg-[var(--primary-hover)]"
          >
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span className="truncate">Book a tour</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
