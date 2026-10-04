/**
 * CRMLS API Integration
 * Provides utilities for fetching listing data from CRMLS/Trestle API
 * with proper caching and normalization
 */

import { normalizeTrestleBaseUrl } from '@/lib/trestle-service';

const BASE = normalizeTrestleBaseUrl(
  process.env.TRESTLE_BASE_URL || 'https://api-trestle.corelogic.com/trestle'
);

interface CRMLSListing {
  ListingKey: string;
  UnparsedAddress: string;
  City: string;
  StateOrProvince: string;
  PostalCode: string;
  ListPrice: number;
  BedroomsTotal: number;
  BathroomsTotalDecimal: number;
  LivingArea: number;
  DaysOnMarket: number;
  PublicRemarks: string;
  Latitude: number;
  Longitude: number;
  PropertySubType: string;
  StandardStatus: string;
  OnMarketDate: string;
  ModificationTimestamp: string;
  LotSizeSquareFeet?: number;
  YearBuilt?: number;
  GarageSpaces?: number;
  AssociationFee?: number;
  PoolPrivateYN?: boolean;
  WaterfrontYN?: boolean;
  OriginalListPrice?: number;
  OpenHouseStartTimestamp?: string;
  OpenHouseEndTimestamp?: string;
  Media?: Array<{ MediaURL: string; Order: number }>;
  PriceHistory?: Array<{
    ListPrice: number;
    ModificationTimestamp: string;
    StandardStatus: string;
    PreviousListPrice?: number;
  }>;
}

export interface NormalizedListing {
  id: string;
  listing_key: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  dom: number;
  photos: string[];
  description: string;
  pricePerSqft: number;
  priceHistory: Array<{
    date: string;
    price: number;
    event: string;
    change: number | null;
  }>;
  lat: number;
  lng: number;
  type: string;
  status: string;
  listed: string;
  modified: string;
}

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Get CRMLS API token (cached for 1 hour)
 */
let cachedToken: { token: string; expires: number } | null = null;

async function getCRMLSToken(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now()) {
    return cachedToken.token;
  }

  const tokenUrl = process.env.TRESTLE_OAUTH_URL || 'https://api-trestle.corelogic.com/trestle/oidc/connect/token';
  const apiId = process.env.TRESTLE_API_ID;
  const apiPassword = process.env.TRESTLE_API_PASSWORD;

  if (!apiId || !apiPassword) {
    throw new Error('CRMLS credentials not configured');
  }

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiId,
      client_secret: apiPassword,
      scope: 'api',
    }),
  });

  if (!response.ok) {
    // Normalize auth failures so callers can degrade gracefully without
    // spamming logs during build/SSG when credentials are missing/invalid.
    const err = new Error(`CRMLS token request failed: ${response.status}`);
    (err as any).status = response.status;
    throw err;
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000, // Refresh 1 min early
  };

  return cachedToken.token;
}

/**
 * Normalize CRMLS listing data to our internal format
 */
export function normalizeListing(raw: CRMLSListing): NormalizedListing {
  const priceHistory = (raw.PriceHistory || []).map((h) => ({
    date: h.ModificationTimestamp.split('T')[0],
    price: h.ListPrice,
    event:
      h.StandardStatus === 'Active'
        ? h.PreviousListPrice && h.ListPrice < h.PreviousListPrice
          ? 'Price Reduced'
          : 'Listed'
        : h.StandardStatus,
    change: h.PreviousListPrice ? h.ListPrice - h.PreviousListPrice : null,
  }));

  return {
    id: raw.ListingKey,
    listing_key: raw.ListingKey,
    address: raw.UnparsedAddress,
    city: raw.City,
    state: raw.StateOrProvince || 'CA',
    zip: raw.PostalCode,
    price: raw.ListPrice,
    beds: raw.BedroomsTotal || 0,
    baths: raw.BathroomsTotalDecimal || 0,
    sqft: raw.LivingArea || 0,
    dom: raw.DaysOnMarket || 0,
    photos: (raw.Media || [])
      .sort((a, b) => (a.Order || 0) - (b.Order || 0))
      .map((m) => m.MediaURL),
    description: raw.PublicRemarks || '',
    pricePerSqft: raw.LivingArea ? Math.round(raw.ListPrice / raw.LivingArea) : 0,
    priceHistory,
    lat: raw.Latitude || 0,
    lng: raw.Longitude || 0,
    type: raw.PropertySubType || '',
    status: raw.StandardStatus || '',
    listed: raw.OnMarketDate || '',
    modified: raw.ModificationTimestamp || '',
  };
}

/**
 * Fetch a single listing by ID from CRMLS
 */
export async function fetchListing(id: string): Promise<NormalizedListing | null> {
  try {
    if (!/^[A-Za-z0-9._:-]{1,160}$/.test(id)) return null;
    const token = await getCRMLSToken();
    const res = await fetch(`${BASE}/odata/Property('${id}')?$expand=Media`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 600 }, // 10 minutes
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`CRMLS API error: ${res.status}`);
    }

    const data = await res.json();
    return normalizeListing(data);
  } catch (error) {
    console.error(`Error fetching listing ${id}:`, error);
    return null;
  }
}

/**
 * Fetch top N listings for static generation
 */
export async function fetchTopListings(limit = 500): Promise<NormalizedListing[]> {
  try {
    const token = await getCRMLSToken();
    const res = await fetch(
      `${BASE}/odata/Property?$top=${limit}&$orderby=ModificationTimestamp desc&$select=ListingKey,UnparsedAddress,City,ListPrice,BedroomsTotal,BathroomsTotalDecimal,LivingArea,StandardStatus`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 }, // 1 hour
      }
    );

    if (!res.ok) {
      throw new Error(`CRMLS API error: ${res.status}`);
    }

    const data = await res.json();
    return (data.value || []).map(normalizeListing);
  } catch (error) {
    const status = (error as any)?.status as number | undefined;
    const message = error instanceof Error ? error.message : String(error);
    // Avoid noisy errors during build/SSG if CRMLS auth is not available.
    if (status === 401 || status === 403 || message.includes('CRMLS token request failed: 403')) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('CRMLS auth unavailable; skipping top listings fetch.');
      }
      return [];
    }
    console.error('Error fetching top listings:', error);
    return [];
  }
}

/**
 * Fetch listings by county for sitemap generation
 */
export async function fetchListingsByCounty(county: string): Promise<NormalizedListing[]> {
  try {
    const token = await getCRMLSToken();
    
    // Map county slug to actual county name
    const countyMap: Record<string, string> = {
      'los-angeles': 'Los Angeles',
      'san-diego': 'San Diego',
      'orange': 'Orange',
      'riverside': 'Riverside',
      'san-bernardino': 'San Bernardino',
      'santa-clara': 'Santa Clara',
      'san-mateo': 'San Mateo',
      'alameda': 'Alameda',
      'contra-costa': 'Contra Costa',
      'ventura': 'Ventura',
      'sacramento': 'Sacramento',
      'santa-barbara': 'Santa Barbara',
      'monterey': 'Monterey',
      'marin': 'Marin',
      'sonoma': 'Sonoma',
      'san-francisco': 'San Francisco',
    };

    const countyName = countyMap[county] || county;
    
    const res = await fetch(
      `${BASE}/odata/Property?$filter=CountyOrParish eq '${escapeODataString(countyName)}' and StandardStatus eq 'Active'&$select=ListingKey,UnparsedAddress,ModificationTimestamp&$top=50000`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      throw new Error(`CRMLS API error: ${res.status}`);
    }

    const data = await res.json();
    return (data.value || []).map(normalizeListing);
  } catch (error) {
    console.error(`Error fetching listings for county ${county}:`, error);
    return [];
  }
}

/**
 * Fetch new listings since a given date (for email alerts)
 */
export async function fetchNewListings(filters: {
  city?: string;
  county?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  minSqft?: number;
  maxSqft?: number;
  minLot?: number;
  maxLot?: number;
  minYear?: number;
  maxYear?: number;
  maxHoa?: number;
  hasGarage?: boolean;
  hasPool?: boolean;
  isWaterfront?: boolean;
  priceReduced?: boolean;
  openHouseDate?: string;
  type?: string;
  propertyType?: string;
  propertyCategory?: 'house' | 'condo' | 'townhouse' | 'manufactured';
  keywords?: string;
  action?: 'buy' | 'rent';
  since: Date;
}, options: { throwOnError?: boolean } = {}): Promise<NormalizedListing[]> {
  try {
    const { searchProperties } = await import('@/lib/db/property-repo');
    const { isDatabaseConfigured } = await import('@/lib/db');
    if (!isDatabaseConfigured()) throw new Error('Listing database is not configured');
    const { properties } = await searchProperties({
      city: filters.city, county: filters.county, neighborhood: filters.neighborhood,
      minPrice: filters.minPrice, maxPrice: filters.maxPrice,
      minBedrooms: filters.beds, minBathrooms: filters.baths,
      minLivingArea: filters.minSqft, maxLivingArea: filters.maxSqft,
      minLotSize: filters.minLot, maxLotSize: filters.maxLot,
      minYearBuilt: filters.minYear, maxYearBuilt: filters.maxYear,
      maxHoaFee: filters.maxHoa, hasGarage: filters.hasGarage, hasPool: filters.hasPool,
      isWaterfront: filters.isWaterfront, priceReduced: filters.priceReduced,
      openHouseDate: filters.openHouseDate, propertyType: filters.propertyType,
      propertySubType: filters.type, propertyCategory: filters.propertyCategory,
      keywords: filters.keywords, status: filters.action === 'rent' ? 'for_rent' : 'for_sale',
      modifiedAfter: filters.since.toISOString(), limit: 100, sort: 'updated',
    });
    return properties.map(row => normalizeListing({
      ListingKey: row.listing_key, UnparsedAddress: row.address || '', City: row.city || '',
      StateOrProvince: row.state || 'CA', PostalCode: row.postal_code || '',
      ListPrice: Number(row.list_price) || 0, BedroomsTotal: Number(row.bedrooms_total) || 0,
      BathroomsTotalDecimal: Number(row.bathrooms_total) || 0, LivingArea: Number(row.living_area) || 0,
      DaysOnMarket: Number(row.days_on_market) || 0, PublicRemarks: row.public_remarks || '',
      Latitude: Number(row.latitude) || 0, Longitude: Number(row.longitude) || 0,
      PropertySubType: row.property_sub_type || '', StandardStatus: row.status || '',
      OnMarketDate: row.listed_at || '', ModificationTimestamp: row.modification_timestamp || '',
      Media: (row.media_urls?.length ? row.media_urls : row.main_photo_url ? [row.main_photo_url] : [])
        .map((MediaURL, Order) => ({ MediaURL, Order })),
    }));
  } catch (error) {
    console.error('Error fetching new listings from database:', error);
    if (options.throwOnError) throw error;
    return [];
  }
}
