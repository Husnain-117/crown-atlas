// Enhanced filter types for comprehensive property search

export interface PropertyFilters {
  // Search query
  searchQuery?: string;
  
  // Basic filters
  propertyType?: string[]; // e.g., ["Residential", "Land", "Commercial"]
  propertyCategory?: string[]; // e.g., ["house", "condo", "townhouse", "manufactured"]
  status?: string[];
  
  // Price filters
  priceRange?: [number, number];
  minPrice?: number;
  maxPrice?: number;
  
  // Property details
  beds?: string;
  baths?: string;
  
  // Area filters
  areaRange?: [number, number]; // Living area in sq ft
  lotSizeRange?: [number, number]; // Lot size in sq ft
  minLotSize?: number;
  maxLotSize?: number;
  
  // Year filters
  yearBuiltRange?: [number, number];
  minYearBuilt?: number;
  maxYearBuilt?: number;
  
  // Location filters
  city?: string;
  county?: string;
  state?: string;
  zipCode?: string;
  neighborhood?: string[];
  
  // Feature filters
  features?: string[];
  
  // Advanced filters (only database-supported filters)
  hasPool?: boolean;
  hasView?: boolean;
  isWaterfront?: boolean;
  hasGarage?: boolean;
  maxHoaFee?: number;
  priceReduced?: boolean;
  openHouseDate?: string;
  
  // Sorting
  sortBy?: "recommended" | "price-asc" | "price-desc" | "date-desc" | "area-desc" | "newest" | "popular";
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: PropertyFilters;
  userId: string;
  alertsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
  icon?: string;
}

export interface FilterCategory {
  id: string;
  name: string;
  options: FilterOption[];
  type: 'checkbox' | 'select' | 'range' | 'toggle';
  multiple?: boolean;
}

// Feature categories for better organization (only database-supported features)
export const PROPERTY_FEATURES = {
  ESSENTIAL: [
    { label: 'Swimming Pool', value: 'pool', icon: 'Waves' },
    { label: 'View', value: 'view', icon: 'Home' },
    { label: 'Waterfront', value: 'waterfront', icon: 'Waves' },
  ]
};

export const PROPERTY_TYPES = [
  { label: 'Condo', value: 'condo', icon: 'Building' },
  { label: 'Townhouse', value: 'townhouse', icon: 'Building2' },
  { label: 'Apartment', value: 'apartment', icon: 'Building' },
  { label: 'Single Family', value: 'single_family', icon: 'Home' },
  { label: 'Multi Family', value: 'multi_family', icon: 'Building2' },
  // Land/Lot removed - not displayed on the website
  { label: 'Commercial', value: 'commercial', icon: 'Building' }
];

export const PROPERTY_STATUS = [
  { label: 'For Sale', value: 'for_sale', color: 'green' },
  { label: 'For Rent', value: 'for_rent', color: 'blue' },
  { label: 'Sold', value: 'sold', color: 'gray' },
  { label: 'Rented', value: 'rented', color: 'gray' },
  { label: 'Under Contract', value: 'under_contract', color: 'orange' },
  { label: 'Pending', value: 'pending', color: 'yellow' },
  { label: 'Off Market', value: 'off_market', color: 'red' },
  { label: 'Coming Soon', value: 'coming_soon', color: 'purple' },
];

export const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest Listed', value: 'date-desc' },
  { label: 'Largest First', value: 'area-desc' },
  { label: 'Most Popular', value: 'popular' },
];
