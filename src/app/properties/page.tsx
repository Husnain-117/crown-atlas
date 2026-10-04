import { canonicalCityBuyPathFor } from "@/lib/seo/location-canonical"
/**
 * Properties Listing Page - Server-Side Rendered
 * Fully SSR with ISR revalidation for maximum SEO
 */

import type { Metadata } from "next";
import PropertyListingHeader from "../properties/property-header";
import PropertiesFilterClient from "./PropertiesFilterClient";
import { generateBreadcrumb } from "@/lib/utils/seo";
import { Property } from "@/interfaces";
import { searchProperties, PropertySearchParams } from "@/lib/db/property-repo";
import { isDatabaseConfigured } from "@/lib/db";
import { deriveDisplayName } from "@/lib/display-name";
import CRMLSDisclaimer from "@/components/crmls-disclaimer";
import { propertyUrlFor } from "@/lib/property-url";
import { buildPropertyMediaUrls } from "@/lib/property-normalization";
import { getCountyAndCitySlugForCityName, slugToCityName } from "@/lib/counties";

// Force fully dynamic rendering for search
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Sanitize address to remove leading zeros and extra whitespace
function sanitizeAddress(addr: string): string {
  return addr.trim().replace(/^0+\s+/, '').replace(/\s{2,}/g, ' ');
}

// Helper function to format property data (matches API route format)
function formatPropertyData(p: any) {
  // Address derivation: DB returns unparsed_address; use cleaned_address or address if present
  let baseAddress = (p as any).address || (p as any).cleaned_address || (p as any).unparsed_address || '';
  if (!baseAddress) {
    const raw = (p as any).raw_json;
    try {
      let parsed = raw;
      if (parsed && typeof parsed === 'string') {
        try { parsed = JSON.parse(parsed); } catch { }
      }
      if (parsed) {
        baseAddress = parsed.UnparsedAddress || parsed.unparsed_address || '';
        if (!baseAddress) {
          const num = parsed.StreetNumber || parsed.street_number || parsed.StreetNumberNumeric || '';
          const name = parsed.StreetName || parsed.street_name || '';
          const suffix = parsed.StreetSuffix || parsed.street_suffix || '';
          const unit = parsed.UnitNumber || parsed.unit_number || '';
          const pieces = [num, name, suffix].filter(Boolean).join(' ').trim();
          if (pieces) baseAddress = pieces + (unit ? ` #${unit}` : '');
        }
      }
    } catch { }
  }

  const photos = buildPropertyMediaUrls({
    listingKey: p.listing_key,
    mainPhotoUrl: p.main_photo_url,
    mediaUrls: p.media_urls,
    photosCount: p.photos_count,
  }, 5);
  const mainImage = photos[0] || '';

  const item = {
    // Primary identifiers
    _id: p.listing_key,
    id: p.listing_key,
    listing_key: p.listing_key,

    // Pricing
    list_price: p.list_price || 0,

    // Location - matching API route format
    address: sanitizeAddress(baseAddress),
    city: p.city,
    county: p.county_or_parish || p.county || p.state_or_province || p.state || "",
    postal_code: (p as any).postal_code || '',
    latitude: p.latitude || 0,
    longitude: p.longitude || 0,

    // Property characteristics
    property_type: p.property_type,
    property_sub_type: p.property_sub_type,
    property_category: p.property_sub_type,
    bedrooms: p.bedrooms_total || null,
    bathrooms: p.bathrooms_total || null,
    living_area_sqft: p.living_area || null,
    lot_size_sqft: p.lot_size_sq_ft || p.lot_size_sqft || 0,
    year_built: (p as any).year_built,

    // Images
    images: photos,
    main_image_url: mainImage,
    image: mainImage, // Legacy support

    // Status and metadata
    status: p.status === 'Active' ? 'FOR SALE' : (p.status || 'UNKNOWN'),
    statusColor: p.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
    days_on_market: (p as any).days_on_market,

    // Descriptions
    public_remarks: (p as any).public_remarks || '',
    h1_heading: (p as any).h1_heading,
    title: (p as any).title,
    seo_title: (p as any).seo_title,

    // Additional fields
    photosCount: p.photos_count ?? photos.length,
    favorite: false,
    createdAt: p.created_at || new Date().toISOString(),
    updatedAt: p.updated_at || new Date().toISOString(),

    // Legacy fields for backward compatibility
    location: p.city,
    state: p.state || p.state_or_province || 'CA',
    zip_code: (p as any).postal_code || '',
    publicRemarks: (p as any).public_remarks || '',
    hoa_fee: p.hoa_fee ?? null,
    hoa_fee_frequency: p.hoa_fee_frequency ?? null,
    view_yn: p.view_yn ?? false,
    view: p.view ?? null,
    new_construction_yn: p.new_construction_yn ?? null,
    senior_community_yn: p.senior_community_yn ?? null,
    fireplace_yn: p.fireplace_yn ?? null,
  };

  (item as any).display_name = deriveDisplayName({
    listing_key: p.listing_key,
    address: item.address,
    city: item.city,
    state: item.state,
    county: item.county,
    raw_json: (p as any).raw_json,
  });

  return item;
}

interface PropertiesPageProps {
  searchParams: Promise<{
    city?: string;
    county?: string;
    neighborhood?: string;
    minPrice?: string;
    maxPrice?: string;
    beds?: string;
    maxBeds?: string;
    baths?: string;
    maxBaths?: string;
    propertyType?: string;
    propertyCategory?: string;
    type?: string;
    sortBy?: string;
    sort?: string;
    page?: string;
    keywords?: string;
    minSqft?: string;
    maxSqft?: string;
    minLot?: string;
    maxLot?: string;
    minYear?: string;
    maxYear?: string;
    maxHoa?: string;
    hasGarage?: string;
    pool?: string;
    view?: string;
    oceanView?: string;
    waterfront?: string;
    newConstruction?: string;
    senior?: string;
    fireplace?: string;
    priceReduced?: string;
    openHouseDate?: string;
    newest?: string;
    search?: string;
    location?: string;
    searchLocationType?: string;
    status?: string;
  }>;
}

// Map sortBy values to database sort options (same as API route)
const mapSortToDb = (sort: string): "price_asc" | "price_desc" | "newest" | "updated" | "area_desc" => {
  switch (sort) {
    case "recommended":
      return "updated"; // Use updated sort which now prioritizes $3M-$5M
    case "date-desc":
    case "newest":
      return "newest";
    case "price-asc":
    case "price_asc":
      return "price_asc";
    case "price-desc":
    case "price_desc":
      return "price_desc";
    case "area-desc":
    case "area_desc":
      return "area_desc"; // Sort by living area descending
    default:
      return "updated";
  }
};

function parsePositivePage(value: unknown): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

async function getPropertiesServer(filters: any) {
  const page = parsePositivePage(filters.page);
  const limit = 24;
  const offset = (page - 1) * limit;

  const serverFilters: PropertySearchParams = {
    city: filters.city,
    county: filters.county,
    neighborhood: filters.neighborhood,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minBedrooms: filters.beds,
    maxBedrooms: filters.maxBeds,
    minBathrooms: filters.baths,
    maxBathrooms: filters.maxBaths,
    minLivingArea: filters.minSqft,
    maxLivingArea: filters.maxSqft,
    minLotSize: filters.minLot,
    maxLotSize: filters.maxLot,
    minYearBuilt: filters.minYear,
    maxYearBuilt: filters.maxYear,
    maxHoaFee: filters.maxHoa,
    hasGarage: filters.hasGarage,
    hasPool: filters.hasPool,
    hasView: filters.hasView,
    hasOceanView: filters.hasOceanView,
    isWaterfront: filters.isWaterfront,
    isNewConstruction: filters.isNewConstruction,
    isSeniorCommunity: filters.isSeniorCommunity,
    hasFireplace: filters.hasFireplace,
    priceReduced: filters.priceReduced,
    openHouseDate: filters.openHouseDate,
    propertyType: filters.propertyType && filters.propertyType !== "all" ? filters.propertyType : undefined,
    propertyCategory: filters.propertyCategory && filters.propertyCategory !== "all" ? filters.propertyCategory : undefined,
    keywords: filters.keywords,
    locationKeywords: filters.locationKeywords,
    status: filters.status,
    sort: mapSortToDb(filters.sortBy || "updated"),
    daysListed: filters.newest ? 21 : undefined,
    limit,
    offset,
  };

  try {
    const result = await searchProperties(serverFilters);
    return {
      properties: (result.properties || []).map(formatPropertyData),
      total: result.total || 0,
    };
  } catch (error) {
    console.error("[PROPERTIES_PAGE] SSR property fetch failed:", error);
    return { properties: [], total: 0 };
  }
}

export async function generateMetadata({
  searchParams,
}: PropertiesPageProps): Promise<Metadata> {
  const params = await searchParams;
  const { city, county, propertyType, type, beds, baths, status } = params;
  const isRentalSearch = status === "for_rent" || type === "rent";
  const pageNumber = parsePositivePage(params.page);

  // Build dynamic title and description with SEO-optimized format
  let title = "Luxury California Properties | Crown Coastal Homes";
  let description =
    "Browse current California properties, including coastal homes and condos across San Diego, Los Angeles, and the Bay Area.";

  const listingIntent = isRentalSearch ? "Properties for Rent" : "Homes for Sale";
  const titleParts: string[] = [];

  if (propertyType && propertyType !== "all") {
    const formattedType = propertyType
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    titleParts.push(`${formattedType} ${isRentalSearch ? "for Rent" : "for Sale"}`);
  } else {
    titleParts.push(listingIntent);
  }

  if (city) {
    titleParts.push(`in ${city}`);
  } else if (county) {
    titleParts.push(`in ${county} County`);
  } else {
    titleParts.push("in California");
  }

  if (beds) {
    titleParts.push(`${beds}+ Beds`);
  }
  if (baths) {
    titleParts.push(`${baths}+ Baths`);
  }

  if (titleParts.length > 0) {
    title = `${titleParts.join(" ")} | Crown Coastal Homes`;
    description = `Explore ${titleParts.join(" ").toLowerCase()} with Crown Coastal Homes. View current photos and property details, then request a showing with a local agent.`;
  }

  if (pageNumber > 1) {
    title = title.replace(" | Crown Coastal Homes", ` - Page ${pageNumber} | Crown Coastal Homes`)
    description = `Page ${pageNumber}. ${description}`
  }

  // Validate lengths
  if (title.length > 60) {
    title = title.substring(0, 57) + "...";
  }
  if (description.length > 160) {
    description = description.substring(0, 157) + "...";
  }

  // ─── Canonical URL Strategy (M-1 fix) ────────────────────────────────────
  //
  // /properties is a live-search interface; its query-string variants create
  // near-duplicate pages that split ranking signal from our dedicated ISR
  // landing pages (keyword cannibalization). The correct fix:
  //
  //  • /properties?city=X    → canonical /buy/[county-slug]/[city-slug]
  //                            (consolidates signal to the pre-rendered page)
  //  • /properties?county=X  → canonical /buy/[county-slug]
  //  • /properties?page=N    → self-canonical and indexable for crawl discovery
  //  • /properties (base)    → canonical /properties
  //  • all other combinations → canonical /properties, noindex
  // ─────────────────────────────────────────────────────────────────────────
  const productionUrl = 'https://crowncoastalhomes.com'

  const hasListingTypeFilter = (propertyType && propertyType !== 'all') || Boolean(type) || Boolean(status)
  const hasNonLocationFilter = Boolean(
    hasListingTypeFilter ||
    params.minPrice || params.maxPrice || beds || baths || params.maxBeds || params.maxBaths ||
    params.neighborhood || params.propertyCategory || params.keywords || params.search ||
    params.minSqft || params.maxSqft || params.minLot || params.maxLot ||
    params.minYear || params.maxYear || params.maxHoa || params.hasGarage || params.pool || params.view || params.oceanView ||
    params.waterfront || params.newConstruction || params.senior || params.fireplace || params.priceReduced || params.openHouseDate || params.newest || params.sort || params.sortBy ||
    params.location || params.searchLocationType
  )
  const hasAnyNonPaginationFilter = Boolean(city || county || hasNonLocationFilter)

  // Build canonical URL
  let canonicalUrl: string
  if (isRentalSearch) {
    canonicalUrl = `${productionUrl}/rent`
  } else if (city && !county && !hasNonLocationFilter && pageNumber === 1) {
    // City-only filter → defer to the dedicated ISR landing page so both pages
    // don't compete for the same local "homes for sale" query.
    const cityPath = canonicalCityBuyPathFor(city)
    canonicalUrl = `${productionUrl}${cityPath || '/properties'}`
  } else if (county && !city && !hasNonLocationFilter && pageNumber === 1) {
    const countySlug = county.toLowerCase().replace(/\s+county$/i, '').replace(/\s+/g, '-')
    canonicalUrl = `${productionUrl}/buy/${countySlug}`
  } else if (!hasAnyNonPaginationFilter && pageNumber > 1) {
    canonicalUrl = `${productionUrl}/properties?page=${pageNumber}`
  } else {
    // Base page or any filtered combination → canonical is the clean base page
    canonicalUrl = `${productionUrl}/properties`
  }

  // Index the base result set and its unfiltered pagination. Filter combinations
  // stay followable but noindexed because dedicated landing pages are stronger
  // canonical targets for location intent.
  const shouldIndex = !hasAnyNonPaginationFilter

  return {
    title: title.length > 60 ? title.substring(0, 57) + '...' : title,
    description: description.length > 160 ? description.substring(0, 157) + '...' : description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: shouldIndex
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title: title.length > 60 ? title.substring(0, 57) + '...' : title,
      description: description.length > 160 ? description.substring(0, 157) + '...' : description,
      type: "website",
      url: canonicalUrl,
    },
  };
}

export default async function PropertiesPage({
  searchParams,
}: PropertiesPageProps) {
  const params = await searchParams;
  const dataAvailable = isDatabaseConfigured();
  const {
    city,
    county,
    neighborhood,
    minPrice,
    maxPrice,
    beds,
    maxBeds,
    baths,
    maxBaths,
    propertyType,
    propertyCategory,
    type,
    sortBy,
    sort,
    page,
    keywords,
    minSqft,
    maxSqft,
    minLot,
    maxLot,
    minYear,
    maxYear,
    maxHoa,
    hasGarage,
    pool,
    view,
    oceanView,
    waterfront,
    newConstruction,
    senior,
    fireplace,
    priceReduced,
    openHouseDate,
    newest,
    search,
    location,
    searchLocationType,
    status,
  } = params;

  // Map location and searchLocationType to city/county if provided
  // This handles searches from the home page search bar
  let finalCity = city;
  let finalCounty = county;
  let finalKeywords = keywords;
  let finalLocationKeywords: string | undefined;

  if (search) {
    const term = search.trim();
    const cityCandidate = term.replace(/,\s*(?:CA|California)$/i, "").trim();
    const knownCity = !finalCity && !finalCounty
      ? getCountyAndCitySlugForCityName(cityCandidate)
      : null;

    if (knownCity) {
      finalCity = slugToCityName(knownCity.citySlug);
    } else {
      finalLocationKeywords = term || undefined;
    }
  }

  if (location && searchLocationType) {
    if (searchLocationType === 'city') {
      finalCity = location;
    } else if (searchLocationType === 'county') {
      finalCounty = location;
    }
  } else if (location && !city && !county) {
    // Home-page location searches default to an exact city filter.
    finalCity = location;
  }

  // Parse filters
  // If status=for_rent, override propertyType to ResidentialLease (unless already set)
  let finalPropertyType = propertyType;
  let finalPropertyCategory = propertyCategory;

  if (type === 'Residential') {
    finalPropertyCategory = 'house';
  } else if (type === 'Condominium') {
    finalPropertyCategory = 'condo';
  } else if (type === 'Townhouse') {
    finalPropertyCategory = 'townhouse';
  } else if (type === 'Manufactured') {
    finalPropertyCategory = 'manufactured';
  } else if (type === 'MultiFamily') {
    finalPropertyCategory = 'multifamily';
  } else if (type === 'Land') {
    finalPropertyType = 'Land';
    finalPropertyCategory = undefined;
  }

  if (status === 'for_rent' && !propertyType) {
    finalPropertyType = 'ResidentialLease';
  } else if (status === 'for_rent' && propertyType === 'Residential') {
    // If user explicitly wants rentals, use ResidentialLease
    finalPropertyType = 'ResidentialLease';
  }

  // Parse bedroom/bathroom values - handle "3+", "4+", etc.
  const parseBedsBaths = (value: string | undefined): number | undefined => {
    if (!value) return undefined;
    // Remove the "+" if present and parse the number
    const cleaned = value.replace('+', '');
    const parsed = parseInt(cleaned);
    return isNaN(parsed) ? undefined : parsed;
  };

  const filters = {
    city: finalCity,
    county: finalCounty,
    neighborhood: neighborhood,
    minPrice: minPrice ? parseInt(minPrice) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
    beds: parseBedsBaths(beds),
    maxBeds: parseBedsBaths(maxBeds),
    baths: parseBedsBaths(baths),
    maxBaths: parseBedsBaths(maxBaths),
    propertyType: finalPropertyType,
    propertyCategory: finalPropertyCategory,
    sortBy: sortBy || sort,
    page: parsePositivePage(page),
    keywords: finalKeywords, // Support both 'keywords' and 'search' params
    locationKeywords: finalLocationKeywords,
    minSqft: minSqft ? parseInt(minSqft) : undefined,
    maxSqft: maxSqft ? parseInt(maxSqft) : undefined,
    minLot: minLot ? parseInt(minLot) : undefined,
    maxLot: maxLot ? parseInt(maxLot) : undefined,
    minYear: minYear ? parseInt(minYear) : undefined,
    maxYear: maxYear ? parseInt(maxYear) : undefined,
    maxHoa: maxHoa ? parseInt(maxHoa) : undefined,
    hasGarage: hasGarage === 'true',
    hasPool: pool === 'true',
    hasView: view === 'true',
    hasOceanView: oceanView === 'true',
    isWaterfront: waterfront === 'true',
    isNewConstruction: newConstruction === 'true',
    isSeniorCommunity: senior === 'true',
    hasFireplace: fireplace === 'true',
    priceReduced: priceReduced === 'true',
    openHouseDate: openHouseDate && /^\d{4}-\d{2}-\d{2}$/.test(openHouseDate) ? openHouseDate : undefined,
    newest: newest === 'true',
    status,
  };

  console.log('[PROPERTIES_PAGE] 🔍 Applied filters:', filters);

  const { properties, total } = await getPropertiesServer(filters);

  // Generate schema
  const breadcrumbSchema = generateBreadcrumb([
    { name: "Home", item: "/", position: 1 },
    { name: "Properties", item: "/properties", position: 2 },
  ]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: properties.length,
    itemListElement: properties.map((property: Property, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "RealEstateListing",
        name: property.address || "Property",
        url: propertyUrlFor(property as any),
        offers: property.list_price
          ? {
            "@type": "Offer",
            price: property.list_price,
            priceCurrency: "USD",
          }
          : undefined,
      },
    })),
  };

  const showSaveSearch = dataAvailable && Boolean(
    filters.city ||
    filters.county ||
    filters.neighborhood ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.beds ||
    filters.baths ||
    filters.minSqft ||
    filters.maxSqft ||
    filters.minLot ||
    filters.maxLot ||
    filters.minYear ||
    filters.maxYear ||
    filters.maxHoa ||
    filters.hasGarage ||
    filters.hasPool ||
    filters.hasView ||
    filters.hasOceanView ||
    filters.isWaterfront ||
    filters.isNewConstruction ||
    filters.isSeniorCommunity ||
    filters.hasFireplace ||
    filters.priceReduced ||
    filters.openHouseDate ||
    filters.keywords ||
    filters.locationKeywords ||
    filters.propertyCategory ||
    (filters.propertyType && filters.propertyType !== "all")
  )

  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema).replace(/</g, "\\u003c") }}
      />

      <div className="bg-[var(--bg)] text-[var(--coastal-text)] min-h-screen">
        {/* Header Section */}
        <PropertyListingHeader
          title={(() => {
            const isRent = status === 'for_rent';
            const isHouse = propertyCategory === 'house';
            const typeText = isRent
              ? (isHouse ? 'Homes for Rent' : 'Properties for Rent')
              : 'Homes for Sale';
            if (finalCity) return `${typeText} in ${finalCity}, CA`;
            if (finalCounty) return `${typeText} in ${finalCounty} County, CA`;
            if (finalLocationKeywords) return `${typeText} matching "${finalLocationKeywords}"`;
            return isRent ? `${typeText} in California` : "Luxury California Properties";
          })()}
          subtitle="Compare current CRMLS listings, property details, and available tour times"
        />

        <div className="max-w-screen-2xl mx-auto px-4 py-8">
          {/* Properties Grid with FilterBar Integration */}
          <PropertiesFilterClient 
            initialProperties={properties as any} 
            initialTotal={total} 
            filters={filters as any} 
            showSaveSearch={showSaveSearch}
          />
        </div>
      </div>

      {/* CRMLS Disclaimer */}
      <CRMLSDisclaimer />
    </>
  );
}
