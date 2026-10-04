import { useState, useEffect } from 'react';
import axios from 'axios';
import { Property } from '@/interfaces';

export interface TrestlePropertyFilters {
  city?: string;
  state?: string;
  status?: string; // for_sale, for_rent, etc.
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  propertyType?: string;
  propertyCategory?: string; // New field for filtering by category (house, condo, townhouse, etc.)
  sortBy?: "recommended" | "price-asc" | "price-desc" | "date-desc" | "area-desc"; // Sort option
  hasPool?: boolean;
  isWaterfront?: boolean;
  hasView?: boolean;
  hasOceanView?: boolean;
  isNewConstruction?: boolean;
  isSeniorCommunity?: boolean;
  hasFireplace?: boolean;
  minYearBuilt?: number;
  maxYearBuilt?: number;
  minLotSize?: number;
  maxLotSize?: number;
  hasGarage?: boolean;
  maxHoaFee?: number;
  minLivingArea?: number;
  maxLivingArea?: number;
  keywords?: string[] | string;
  locationKeywords?: string;
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  openHousesOnly?: boolean;
  openHouseDate?: string;
  priceReduced?: boolean;
  daysListed?: number;
}



export interface UseTrestlePropertiesResult {
  properties: Property[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  searchSemantic: (query: string) => Promise<Property[]>;
}

// Convert API response property to your app's Property interface
// CANONICAL: Maps API fields to canonical PropertyDetail field names
function convertTrestleToProperty(apiProperty: any): Property {
  const base: Property = {
    // Primary identifiers - CANONICAL
    _id: apiProperty._id || apiProperty.listing_key || apiProperty.id,
    id: apiProperty.id || apiProperty.listing_key,
    listing_key: apiProperty.listing_key || apiProperty.id,
    
    // Pricing - CANONICAL
    list_price: apiProperty.list_price || 0,
    
    // Location - CANONICAL field names
    address: apiProperty.address || apiProperty.unparsed_address || apiProperty.full_address ||
             (apiProperty.street_number && apiProperty.street_name
               ? `${apiProperty.street_number} ${apiProperty.street_name}`
               : "") || "",
    city: apiProperty.city || apiProperty.postal_city || "",
    county: apiProperty.county || "", // CANONICAL: county
    postal_code: apiProperty.postal_code || apiProperty.zip_code || "",
    latitude: apiProperty.latitude || 0,
    longitude: apiProperty.longitude || 0,
    
    // Property characteristics - CANONICAL field names
    property_type: apiProperty.property_type || "Unknown",
    property_sub_type: apiProperty.property_sub_type || apiProperty.property_category || "",
    property_category: apiProperty.property_category || "",
    bedrooms: apiProperty.bedrooms ?? null, // CANONICAL: bedrooms (nullable)
    bathrooms: apiProperty.bathrooms ?? null, // CANONICAL: bathrooms (nullable)
    living_area_sqft: apiProperty.living_area_sqft ?? null, // CANONICAL: nullable number
    lot_size_sqft: apiProperty.lot_size_sqft || 0,
    year_built: apiProperty.year_built,
    
    // Images - CANONICAL
    images: apiProperty.images || [],
    main_image_url: apiProperty.main_image_url,
    image: apiProperty.image || apiProperty.main_image_url,
    
    // Status and metadata
    status: apiProperty.status || "UNKNOWN",
    statusColor: apiProperty.statusColor || "bg-gray-100 text-gray-800",
    days_on_market: apiProperty.days_on_market,
    
    // Descriptions - CANONICAL
    public_remarks: apiProperty.public_remarks || apiProperty.publicRemarks || "",
    h1_heading: apiProperty.h1_heading,
    title: apiProperty.title,
    seo_title: apiProperty.seo_title,
    
    // Additional fields
    favorite: false,
    createdAt: apiProperty.createdAt || new Date().toISOString(),
    updatedAt: apiProperty.updatedAt || new Date().toISOString(),
    
    // Legacy fields for backward compatibility
    location: apiProperty.location || apiProperty.city || "Unknown",
    state: apiProperty.state || "CA",
    zip_code: apiProperty.zip_code || apiProperty.postal_code || "",
    publicRemarks: apiProperty.publicRemarks || apiProperty.public_remarks || "",
    hoa_fee: apiProperty.hoa_fee ?? null,
    hoa_fee_frequency: apiProperty.hoa_fee_frequency ?? null,
    photosCount: apiProperty.photosCount ?? apiProperty.images?.length ?? 0,
  };
  
  // Preserve display_name if provided by API
  if (apiProperty.display_name) {
    (base as any).display_name = apiProperty.display_name;
  }
  
  return base;
}

export function useTrestlePropertiesIntegrated(
  filters: TrestlePropertyFilters = {},
  limit: number = 20,
  page: number = 1,
  /** Set to false to skip fetching (e.g. when SSR initialProperties are already available). */
  enabled: boolean = true
): UseTrestlePropertiesResult {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  // Fetch properties from the API and update local state.
  const fetchProperties = async (newOffset: number = 0, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: newOffset.toString()
      });

      // Convert filters to API query params
      if (filters.city) params.set('city', filters.city);
      if (filters.state) params.set('state', filters.state);
      if (filters.status) params.set('status', filters.status);
      if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.minBedrooms) params.set('minBedrooms', filters.minBedrooms.toString());
      if (filters.maxBedrooms) params.set('maxBedrooms', filters.maxBedrooms.toString());
      if (filters.minBathrooms) params.set('minBathrooms', filters.minBathrooms.toString());
      if (filters.maxBathrooms) params.set('maxBathrooms', filters.maxBathrooms.toString());
      if (filters.propertyType) params.set('propertyType', filters.propertyType);
      if (filters.propertyCategory) params.set('propertyCategory', filters.propertyCategory);
      if (filters.sortBy) params.set('sortBy', filters.sortBy); // Add sortBy parameter
      if (filters.hasPool !== undefined) params.set('hasPool', filters.hasPool.toString());
      if (filters.isWaterfront !== undefined) params.set('isWaterfront', filters.isWaterfront.toString());
      if (filters.hasView !== undefined) params.set('hasView', filters.hasView.toString());
      if (filters.hasOceanView !== undefined) params.set('hasOceanView', filters.hasOceanView.toString());
      if (filters.isNewConstruction !== undefined) params.set('isNewConstruction', filters.isNewConstruction.toString());
      if (filters.isSeniorCommunity !== undefined) params.set('isSeniorCommunity', filters.isSeniorCommunity.toString());
      if (filters.hasFireplace !== undefined) params.set('hasFireplace', filters.hasFireplace.toString());
      if (filters.openHousesOnly) params.set('openHousesOnly', 'true');
      if (filters.openHouseDate) params.set('openHouseDate', filters.openHouseDate);
      if (filters.priceReduced) params.set('priceReduced', 'true');
      if (filters.hasGarage) params.set('hasGarage', 'true');
      if (filters.maxHoaFee) params.set('maxHoaFee', filters.maxHoaFee.toString());
      if (filters.minYearBuilt) params.set('minYearBuilt', filters.minYearBuilt.toString());
      if (filters.maxYearBuilt) params.set('maxYearBuilt', filters.maxYearBuilt.toString());
      if (filters.minLotSize) params.set('minLotSize', filters.minLotSize.toString());
      if (filters.maxLotSize) params.set('maxLotSize', filters.maxLotSize.toString());
      if (filters.minLivingArea) params.set('minLivingArea', filters.minLivingArea.toString());
      if (filters.maxLivingArea) params.set('maxLivingArea', filters.maxLivingArea.toString());
      if (filters.keywords) {
        const keywordsValue = Array.isArray(filters.keywords)
          ? filters.keywords.join(',')
          : filters.keywords;
        if (keywordsValue) params.set('keywords', keywordsValue);
      }
      if (filters.locationKeywords) params.set('locationKeywords', filters.locationKeywords);
      if (filters.minLat != null) params.set('minLat', filters.minLat.toString());
      if (filters.maxLat != null) params.set('maxLat', filters.maxLat.toString());
      if (filters.minLng != null) params.set('minLng', filters.minLng.toString());
      if (filters.maxLng != null) params.set('maxLng', filters.maxLng.toString());
      if (filters.daysListed) params.set('daysListed', filters.daysListed.toString());

      const response = await axios.get(`/api/properties?${params.toString()}`);

      if (response.data.dataAvailable === false) {
        setProperties([]);
        setTotal(0);
        setHasMore(false);
        setOffset(newOffset);
        setError(response.data.message || 'Current listing data is temporarily unavailable.');
        return;
      }

      if (response.data.success) {
        const apiProperties = response.data.data;

        const convertedProperties = apiProperties.map(convertTrestleToProperty);

        if (append) {
          setProperties(prev => [...prev, ...convertedProperties]);
        } else {
          setProperties(convertedProperties);
        }
        
        setTotal(response.data.pagination.total);
        setHasMore(response.data.pagination.hasMore);
        setOffset(newOffset);
      } else {
        setError(response.data.error || 'Failed to fetch properties');
      }
    } catch (err: any) {
      console.error('❌ Error fetching properties:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchProperties(offset + limit, true);
    }
  };

  const refresh = () => {
    setOffset(0);
    fetchProperties(0, false);
  };

  const searchSemantic = async (query: string): Promise<Property[]> => {
    try {
      const response = await axios.post('/api/properties/search/semantic', {
        query,
        limit: 20,
        filters
      });

      if (response.data.success) {
        const searchResults = response.data.data;
        return searchResults.map(convertTrestleToProperty);
      } else {
        throw new Error(response.data.error || 'Semantic search failed');
      }
    } catch (err: any) {
      console.error('❌ Semantic search error:', err);
      throw new Error(err.response?.data?.message || err.message || 'Semantic search failed');
    }
  };

  const keywordDependency = Array.isArray(filters.keywords)
    ? filters.keywords.join(',')
    : (filters.keywords || '')

  useEffect(() => {
    if (!enabled) return;
    const newOffset = (page - 1) * limit;
    fetchProperties(newOffset, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    filters.city,
    filters.state,
    filters.status,
    filters.minPrice,
    filters.maxPrice,
    filters.minBedrooms,
    filters.maxBedrooms,
    filters.minBathrooms,
    filters.maxBathrooms,
    filters.propertyType,
    filters.propertyCategory,
    filters.sortBy,
    filters.hasPool,
    filters.isWaterfront,
    filters.hasView,
    filters.hasOceanView,
    filters.isNewConstruction,
    filters.isSeniorCommunity,
    filters.hasFireplace,
    filters.openHousesOnly,
    filters.openHouseDate,
    filters.priceReduced,
    filters.hasGarage,
    filters.maxHoaFee,
    filters.minYearBuilt,
    filters.maxYearBuilt,
    filters.minLotSize,
    filters.maxLotSize,
    filters.minLivingArea,
    filters.maxLivingArea,
    keywordDependency,
    filters.locationKeywords,
    filters.minLat,
    filters.maxLat,
    filters.minLng,
    filters.maxLng,
    filters.daysListed,
    limit,
    page
  ]);

  return {
    properties,
    loading,
    error,
    total,
    hasMore,
    loadMore,
    refresh,
    searchSemantic
  };
}

// Hook for getting a single property by listing key
export function useTrestleProperty(listingKey: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingKey) return;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`/api/properties/${listingKey}`);
        
        if (response.data.success) {
          const apiProperty = response.data.data;
          setProperty(convertTrestleToProperty(apiProperty));
        } else {
          setError(response.data.error || 'Property not found');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [listingKey]);

  return { property, loading, error };
}
