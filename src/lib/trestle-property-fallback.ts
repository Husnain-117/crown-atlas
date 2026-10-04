import type { PropertyListItem, PropertySearchParams } from '@/lib/db/property-repo';
import type { PropertyDetailData } from '@/lib/db/property-detail-repo';
import { buildPropertyMediaUrls } from '@/lib/property-normalization';
import { TrestleApiService } from '@/lib/trestle-service';
import type { TrestleProperty } from '@/lib/trestle-types';

const CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_LIMIT = 100;
const MAX_OFFSET = 2_000;

type SearchResult = {
  properties: PropertyListItem[];
  total: number;
  hasMore: boolean;
  dataSource: 'trestle';
};

type CacheEntry = {
  expiresAt: number;
  value: SearchResult;
};

let service: TrestleApiService | null = null;
const searchCache = new Map<string, CacheEntry>();

export function isTrestleConfigured(): boolean {
  return Boolean(
    (process.env.TRESTLE_API_ID || process.env.TRESTLE_CLIENT_ID) &&
      (process.env.TRESTLE_API_PASSWORD || process.env.TRESTLE_CLIENT_SECRET)
  );
}

function getService(): TrestleApiService {
  if (service) return service;

  const apiId = process.env.TRESTLE_API_ID || process.env.TRESTLE_CLIENT_ID || '';
  const apiPassword =
    process.env.TRESTLE_API_PASSWORD || process.env.TRESTLE_CLIENT_SECRET || '';

  if (!apiId || !apiPassword) {
    throw new Error('Trestle API credentials are not configured');
  }

  service = new TrestleApiService({
    apiId,
    apiPassword,
    baseUrl:
      process.env.TRESTLE_BASE_URL ||
      'https://api-trestle.corelogic.com/trestle',
    oauthUrl:
      process.env.TRESTLE_OAUTH_URL ||
      'https://api-trestle.corelogic.com/trestle/oidc/connect/token',
  });

  return service;
}

function odataString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function finiteNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function addNumberFilter(
  filters: string[],
  field: string,
  operator: 'ge' | 'le',
  value: unknown
): void {
  const number = finiteNumber(value);
  if (number !== undefined) filters.push(`${field} ${operator} ${number}`);
}

function statusFilters(params: PropertySearchParams): string[] {
  const requested = Array.isArray(params.status)
    ? params.status
    : params.status
      ? [params.status]
      : [];
  const isRental = requested.some((status) =>
    ['for_rent', 'rented'].includes(status)
  );

  if (
    isRental ||
    params.propertyType === 'ResidentialLease' ||
    params.propertyType === 'CommercialLease'
  ) {
    const rentalType =
      params.propertyType === 'CommercialLease' ? 'CommercialLease' : 'ResidentialLease';
    return [
      `StandardStatus eq ${odataString(requested.includes('rented') ? 'Closed' : 'Active')}`,
      `PropertyType eq '${rentalType}'`,
    ];
  }

  const statusMap: Record<string, string> = {
    for_sale: 'Active',
    sold: 'Closed',
    pending: 'Pending',
    under_contract: 'ActiveUnderContract',
    coming_soon: 'ComingSoon',
  };
  const mappedStatuses = requested
    .map((status) => statusMap[status] || status)
    .filter(Boolean);

  const statuses = mappedStatuses.length > 0 ? mappedStatuses : ['Active'];
  return [
    `(${statuses.map((status) => `StandardStatus eq ${odataString(status)}`).join(' or ')})`,
    params.propertyType
      ? `PropertyType ne 'ResidentialLease'`
      : `PropertyType eq 'Residential'`,
  ];
}

export function buildTrestleSearchQuery(params: PropertySearchParams): {
  filter: string;
  orderBy: string;
} {
  const filters = statusFilters(params);

  if (params.county) {
    filters.push(
      `CountyOrParish eq ${odataString(params.county.replace(/\s+County$/i, '').trim())}`
    );
  } else if (params.postalCodes?.length) {
    filters.push(
      `(${params.postalCodes
        .map((postalCode) => `PostalCode eq ${odataString(postalCode)}`)
        .join(' or ')})`
    );
  } else if (params.city) {
    filters.push(`City eq ${odataString(params.city.trim())}`);
  }

  if (params.city || params.county || params.postalCodes?.length) {
    filters.push(`StateOrProvince eq ${odataString(params.state || 'CA')}`);
  } else if (params.state) {
    filters.push(`StateOrProvince eq ${odataString(params.state)}`);
  }

  if (params.neighborhood) {
    filters.push(
      `contains(tolower(SubdivisionName), ${odataString(params.neighborhood.toLowerCase())})`
    );
  }

  addNumberFilter(filters, 'ListPrice', 'ge', params.minPrice);
  addNumberFilter(filters, 'ListPrice', 'le', params.maxPrice);
  addNumberFilter(filters, 'BedroomsTotal', 'ge', params.minBedrooms);
  addNumberFilter(filters, 'BedroomsTotal', 'le', params.maxBedrooms);
  addNumberFilter(filters, 'BathroomsTotalInteger', 'ge', params.minBathrooms);
  addNumberFilter(filters, 'BathroomsTotalInteger', 'le', params.maxBathrooms);
  addNumberFilter(filters, 'LivingArea', 'ge', params.minLivingArea);
  addNumberFilter(filters, 'LivingArea', 'le', params.maxLivingArea);
  addNumberFilter(filters, 'LotSizeSquareFeet', 'ge', params.minLotSize);
  addNumberFilter(filters, 'LotSizeSquareFeet', 'le', params.maxLotSize);
  addNumberFilter(filters, 'YearBuilt', 'ge', params.minYearBuilt);
  addNumberFilter(filters, 'YearBuilt', 'le', params.maxYearBuilt);
  addNumberFilter(filters, 'AssociationFee', 'le', params.maxHoaFee);

  if (params.hasGarage) filters.push('GarageSpaces gt 0');
  if (params.hasPool) filters.push('PoolPrivateYN eq true');
  if (params.hasView) filters.push('ViewYN eq true');
  if (params.hasOceanView) {
    filters.push("ViewYN eq true and (contains(tolower(PublicRemarks),'ocean view') or contains(tolower(PublicRemarks),'water view') or contains(tolower(PublicRemarks),'bay view') or contains(tolower(PublicRemarks),'harbor view'))");
  }
  if (params.isWaterfront) filters.push('WaterfrontYN eq true');
  if (params.isNewConstruction) filters.push('NewConstructionYN eq true');
  if (params.isSeniorCommunity) filters.push('SeniorCommunityYN eq true');
  if (params.hasFireplace) filters.push('FireplaceYN eq true');
  if (params.priceReduced) filters.push('OriginalListPrice gt ListPrice');

  if (params.propertyType && params.propertyType !== 'ResidentialLease') {
    filters.push(`PropertyType eq ${odataString(params.propertyType)}`);
  }

  const category = params.propertyCategory?.split(',')[0].trim().toLowerCase();
  const categories: Record<string, string[]> = {
    house: [
      'SingleFamilyResidence',
      'Cabin',
      'Farm',
    ],
    condo: [
      'Condominium',
      'StockCooperative',
      'Loft',
      'CoOwnership',
      'OwnYourOwn',
    ],
    townhouse: ['Townhouse'],
    manufactured: ['ManufacturedOnLand', 'ManufacturedHome', 'MobileHome'],
    multifamily: ['Duplex', 'Triplex', 'Quadruplex', 'MixedUse'],
  };
  if (category && categories[category]) {
    filters.push(
      `(${categories[category]
        .map((type) => `PropertySubType eq ${odataString(type)}`)
        .join(' or ')})`
    );
  }

  if (params.locationKeywords?.trim()) {
    const value = odataString(params.locationKeywords.trim().toLowerCase());
    filters.push(
      `(contains(tolower(UnparsedAddress), ${value}) or contains(tolower(City), ${value}) or contains(tolower(SubdivisionName), ${value}) or contains(tolower(PostalCode), ${value}) or contains(tolower(ListingKey), ${value}))`
    );
  }

  if (params.keywords?.trim()) {
    const phrases = params.keywords
      .split(',')
      .map((phrase) => phrase.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5);
    if (phrases.length > 0) {
      filters.push(
        `(${phrases
          .map((phrase) => {
            const value = odataString(phrase);
            return `(contains(tolower(PublicRemarks), ${value}) or contains(tolower(City), ${value}) or contains(tolower(UnparsedAddress), ${value}))`;
          })
          .join(' or ')})`
      );
    }
  }

  if (
    params.minLat != null &&
    params.maxLat != null &&
    params.minLng != null &&
    params.maxLng != null
  ) {
    filters.push(`Latitude ge ${Math.min(params.minLat, params.maxLat)}`);
    filters.push(`Latitude le ${Math.max(params.minLat, params.maxLat)}`);
    filters.push(`Longitude ge ${Math.min(params.minLng, params.maxLng)}`);
    filters.push(`Longitude le ${Math.max(params.minLng, params.maxLng)}`);
  }

  if (params.daysListed && params.daysListed > 0) {
    filters.push(`DaysOnMarket le ${Math.floor(params.daysListed)}`);
  }

  const orderByMap: Record<string, string> = {
    price_asc: 'ListPrice asc',
    price_desc: 'ListPrice desc',
    newest: 'DaysOnMarket asc,ModificationTimestamp desc',
    area_desc: 'LivingArea desc',
    dom_asc: 'DaysOnMarket asc',
    price_reduced: 'PriceChangeTimestamp desc',
    updated: 'ModificationTimestamp desc',
  };

  return {
    filter: filters.join(' and '),
    orderBy: orderByMap[params.sort || 'updated'] || orderByMap.updated,
  };
}

function photoMedia(property: TrestleProperty) {
  return (property.Media || [])
    .filter((media) => {
      if (!media.MediaURL || !/^https:\/\//i.test(media.MediaURL)) return false;
      const category = (media.MediaCategory || '').toLowerCase();
      if (category) return category.includes('photo') || category.includes('image');
      return !/\/document-|\.pdf(?:$|\?)/i.test(media.MediaURL);
    })
    .sort((left, right) => (left.Order || 0) - (right.Order || 0))
}

function mediaUrls(property: TrestleProperty, limit: number): string[] {
  // Authenticated Trestle media are imported by the DigitalOcean worker.
  return photoMedia(property).slice(0, limit)
    .map(media => media.MediaURL)
    .filter((url): url is string => typeof url === 'string' &&
      url.startsWith('https://3ohoto.sfo3.cdn.digitaloceanspaces.com/'));
}

export function trestlePropertyToListItem(property: TrestleProperty): PropertyListItem {
  const images = mediaUrls(property, 5);
  return {
    listing_key: property.ListingKey,
    list_price: property.ListPrice ?? null,
    address: property.UnparsedAddress ?? null,
    city: property.City ?? null,
    state: property.StateOrProvince ?? null,
    bedrooms_total: property.BedroomsTotal ?? null,
    bathrooms_total:
      property.BathroomsTotalDecimal ?? property.BathroomsTotalInteger ?? null,
    living_area: property.LivingArea ?? null,
    lot_size_sq_ft: property.LotSizeSquareFeet ?? null,
    property_type: property.PropertyType ?? null,
    property_sub_type: property.PropertySubType ?? null,
    status: property.StandardStatus ?? null,
    photos_count: property.PhotosCount ?? images.length,
    latitude: property.Latitude ?? null,
    longitude: property.Longitude ?? null,
    main_photo_url: images[0] ?? null,
    media_urls: images,
    modification_timestamp: property.ModificationTimestamp ?? null,
    listed_at: property.OnMarketDate ?? property.ListingContractDate ?? null,
    last_seen_ts: property.ModificationTimestamp ?? null,
    listing_agent_mlsid: property.ListAgentMlsId ?? null,
    listing_agent_full_name: property.ListAgentFullName ?? null,
    listing_agent_direct_phone: null,
    listing_agent_email: null,
    public_remarks: property.PublicRemarks ?? null,
    county_or_parish: property.CountyOrParish ?? null,
    postal_code: property.PostalCode ?? null,
    open_house_start_timestamp: null,
    open_house_end_timestamp: null,
    year_built: property.YearBuilt ?? null,
    parking_total: property.ParkingTotal ?? null,
    garage_spaces: property.GarageSpaces ?? null,
    pool_private_yn: property.PoolPrivateYN ?? false,
    waterfront_yn: property.WaterfrontYN ?? false,
    view_yn: property.ViewYN ?? false,
    days_on_market: property.DaysOnMarket ?? null,
    cumulative_days_on_market: property.CumulativeDaysOnMarket ?? null,
    original_list_price: property.OriginalListPrice ?? null,
    price_change_timestamp: property.PriceChangeTimestamp ?? null,
    hoa_fee: property.AssociationFee ?? null,
    created_at: property.OnMarketDate ?? property.ListingContractDate ?? null,
    updated_at: property.ModificationTimestamp ?? null,
  };
}

export function trestlePropertyToDatabaseRow(property: TrestleProperty): Record<string, unknown> {
  const listItem = trestlePropertyToListItem(property);
  const detailImages = mediaUrls(property, 50);
  return {
    ...listItem,
    main_photo_url: detailImages[0] ?? null,
    media_urls: detailImages,
    standard_status: property.StandardStatus ?? null,
    mls_status: property.MlsStatus ?? property.StandardStatus ?? null,
    state_or_province: property.StateOrProvince ?? null,
    postal_code: property.PostalCode ?? null,
    unparsed_address: property.UnparsedAddress ?? null,
    year_built: property.YearBuilt ?? null,
    parking_total: property.ParkingTotal ?? null,
    garage_spaces: property.GarageSpaces ?? null,
    days_on_market: property.DaysOnMarket ?? null,
    cumulative_days_on_market: property.CumulativeDaysOnMarket ?? null,
    original_list_price: property.OriginalListPrice ?? null,
    price_change_timestamp: property.PriceChangeTimestamp ?? null,
    listing_contract_date: property.ListingContractDate ?? property.OnMarketDate ?? null,
    subdivision_name: property.SubdivisionName ?? null,
    school_district: property.SchoolDistrictName ?? null,
    elementary_school: property.ElementarySchoolName ?? null,
    middle_school: property.MiddleOrJuniorSchoolName ?? null,
    high_school: property.HighSchoolName ?? null,
    pool_private_yn: property.PoolPrivateYN ?? false,
    waterfront_yn: property.WaterfrontYN ?? false,
    view_yn: property.ViewYN ?? false,
    hoa_fee: property.AssociationFee ?? null,
    hoa_fee_frequency: property.AssociationFeeFrequency ?? null,
    tax_annual_amount: property.TaxAnnualAmount ?? null,
    list_agent_dre: property.ListAgentMlsId ?? null,
    list_agent_full_name: property.ListAgentFullName ?? null,
    list_office_name: property.ListOfficeName ?? null,
    public_remarks: property.PublicRemarks ?? null,
    created_at: property.OnMarketDate ?? property.ListingContractDate ?? null,
    updated_at: property.ModificationTimestamp ?? null,
  };
}

function asPropertyDetail(row: Record<string, unknown>): PropertyDetailData {
  const images = buildPropertyMediaUrls({
    listingKey: row.listing_key,
    mainPhotoUrl: row.main_photo_url,
    mediaUrls: row.media_urls,
    photosCount: row.photos_count,
  });

  return {
    listing_key: String(row.listing_key || ''),
    list_price: Number(row.list_price || 0),
    previous_list_price: finiteNumber(row.original_list_price) ?? null,
    price_change_timestamp: row.price_change_timestamp ? String(row.price_change_timestamp) : null,
    address: String(row.unparsed_address || ''),
    city: String(row.city || ''),
    state: String(row.state_or_province || 'CA'),
    county: String(row.county_or_parish || ''),
    postal_code: String(row.postal_code || ''),
    latitude: Number(row.latitude || 0),
    longitude: Number(row.longitude || 0),
    property_type: String(row.property_type || 'Residential'),
    property_sub_type: String(row.property_sub_type || ''),
    bedrooms: finiteNumber(row.bedrooms_total) ?? null,
    bathrooms: finiteNumber(row.bathrooms_total) ?? null,
    bathrooms_full: null,
    bathrooms_half: null,
    living_area_sqft: finiteNumber(row.living_area) ?? null,
    lot_size_sqft: finiteNumber(row.lot_size_sq_ft) ?? null,
    lot_size_acres: null,
    year_built: finiteNumber(row.year_built) ?? null,
    zoning: null,
    standard_status: String(row.standard_status || ''),
    mls_status: String(row.mls_status || row.standard_status || ''),
    days_on_market: finiteNumber(row.days_on_market) ?? null,
    cumulative_days_on_market: finiteNumber(row.cumulative_days_on_market) ?? null,
    listing_contract_date: String(row.listing_contract_date || ''),
    public_remarks: String(row.public_remarks || ''),
    subdivision_name: String(row.subdivision_name || ''),
    main_image_url: images[0] ?? '',
    images,
    photos_count: finiteNumber(row.photos_count) ?? images.length,
    seo_title: null,
    meta_description: null,
    faq_content: null,
    parking_total: finiteNumber(row.parking_total) ?? null,
    garage_size: finiteNumber(row.garage_spaces) ?? null,
    carport_spaces: null,
    heating: null,
    cooling: null,
    security_features: null,
    parking_features: null,
    laundry_features: null,
    school_district: row.school_district ? String(row.school_district) : null,
    elementary_school: row.elementary_school ? String(row.elementary_school) : null,
    middle_school: row.middle_school ? String(row.middle_school) : null,
    high_school: row.high_school ? String(row.high_school) : null,
    stories_total: null,
    pool_private_yn: row.pool_private_yn === true,
    waterfront_yn: row.waterfront_yn === true,
    view_yn: row.view_yn === true,
    view: null,
    new_construction_yn: null,
    senior_community_yn: null,
    fireplace_yn: null,
    fireplaces_total: null,
    association_yn: null,
    association_name: null,
    hoa_fee: finiteNumber(row.hoa_fee) ?? null,
    hoa_fee_frequency: row.hoa_fee_frequency ? String(row.hoa_fee_frequency) : null,
    tax_annual_amount: finiteNumber(row.tax_annual_amount) ?? null,
    tax_year: null,
    virtual_tour_url: null,
    interior_features: null,
    exterior_features: null,
    pool_features: null,
    lot_features: null,
    appliances: null,
    architectural_style: null,
    electric: null,
    sewer: null,
    water: null,
    created_at: row.created_at ? String(row.created_at) : null,
    updated_at: row.updated_at ? String(row.updated_at) : null,
    modification_timestamp: row.modification_timestamp ? String(row.modification_timestamp) : null,
    list_agent_full_name: row.list_agent_full_name ? String(row.list_agent_full_name) : null,
    list_agent_email: null,
    list_agent_dre: row.list_agent_dre ? String(row.list_agent_dre) : null,
    list_agent_phone: null,
    list_office_name: row.list_office_name ? String(row.list_office_name) : null,
    price_history: null,
  };
}

export async function searchTrestleProperties(
  params: PropertySearchParams
): Promise<SearchResult> {
  const limit = Math.min(Math.max(1, params.limit || 20), MAX_LIMIT);
  const offset = Math.min(Math.max(0, params.offset || 0), MAX_OFFSET);
  const normalizedParams = { ...params, limit, offset };
  const key = JSON.stringify(normalizedParams);
  const cached = searchCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const query = buildTrestleSearchQuery(normalizedParams);
  const trestle = getService();
  const requestParams = {
    '$filter': query.filter,
    '$orderby': query.orderBy,
    '$expand': 'Media',
  };

  const all = await trestle.getAllProperties(requestParams, offset + limit);
  const page = all.slice(offset, offset + limit);
  const total = await trestle.getPropertyCount({ '$filter': query.filter }).catch(() =>
    page.length === limit ? offset + limit + 1 : offset + page.length
  );
  const value: SearchResult = {
    properties: page.map(trestlePropertyToListItem),
    total,
    hasMore: offset + limit < total,
    dataSource: 'trestle',
  };

  searchCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
  if (searchCache.size > 100) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey) searchCache.delete(oldestKey);
  }
  return value;
}

export async function getTrestlePropertyRow(
  listingKey: string
): Promise<Record<string, unknown> | null> {
  if (!isTrestleConfigured() || !/^[A-Za-z0-9._:-]{1,160}$/.test(listingKey)) {
    return null;
  }
  const property = await getService().getPropertyByKey(listingKey);
  return property ? trestlePropertyToDatabaseRow(property) : null;
}

export async function getTrestlePropertyDetail(
  listingKey: string
): Promise<PropertyDetailData | null> {
  const row = await getTrestlePropertyRow(listingKey);
  return row ? asPropertyDetail(row) : null;
}

export async function trestleHealthCheck(): Promise<boolean> {
  if (!isTrestleConfigured()) return false;
  return getService().testConnection();
}
