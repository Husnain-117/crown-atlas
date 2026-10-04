// Canonical Property interface aligned with PropertyDetail from useGetDetailProperty.ts
// This is the single source of truth for property data shape across cards and detail pages
export interface Property {
  // Primary identifiers
  _id: string;
  listing_key: string;
  listing_id?: string;
  id?: string; // Legacy support
  
  // Pricing
  list_price: number;
  current_price?: number;
  previous_list_price?: number | null;
  price_change_timestamp?: string | null;
  original_list_price?: number | null;
  lease_amount?: number | null;
  lease_amount_frequency?: string | null;
  
  // Location - canonical field names from PropertyDetail
  address: string; // Full street address
  city: string;
  county: string; // Note: API maps county to state for display
  state?: string; // Legacy support
  postal_code?: string;
  zip_code?: string; // Legacy support
  latitude?: number;
  longitude?: number;
  
  // Property characteristics - canonical field names
  property_type: string; // e.g., "Residential", "Land", "Commercial"
  property_sub_type?: string;
  property_category?: string; // e.g., "house", "condo", "townhouse", "manufactured"
  bedrooms: number | null; // Canonical: bedrooms (not bedrooms_total)
  bathrooms: number | null; // Canonical: bathrooms (not bathrooms_total)
  living_area_sqft: number | null; // Canonical field name
  lot_size_sqft?: number;
  
  // Alternative field names for database compatibility
  bedrooms_total?: number; // Database field name
  bathrooms_total?: number; // Database field name
  living_area?: number; // Database field name
  lot_size_sq_ft?: number; // Database field name
  year_built?: number;
  
  // Images - canonical field names
  images: string[];
  main_image_url?: string;
  main_image?: string;
  image?: string; // Legacy support
  photo_url?: string;
  listing_photos?: string[];
  
  // Status and metadata
  standard_status?: string;
  mls_status?: string;
  days_on_market?: number;
  status?: string; // Legacy support
  statusColor?: string; // Legacy support
  
  // Descriptions and content
  public_remarks?: string;
  publicRemarks?: string; // Legacy support
  h1_heading?: string;
  title?: string;
  seo_title?: string;
  
  // Additional fields
  subdivision_name?: string;
  zoning?: string | null;
  listing_contract_date?: string;
  modification_timestamp?: string;
  on_market_timestamp?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Agent info
  list_agent_full_name?: string;
  list_office_name?: string;
  list_agent_email?: string;
  list_agent_phone?: string;
  
  // Enrichment / comparison fields
  hoa_fee?: number | null;
  hoa_fee_frequency?: string | null;
  view_yn?: boolean | null;
  view?: string | null;
  new_construction_yn?: boolean | null;
  senior_community_yn?: boolean | null;
  fireplace_yn?: boolean | null;
  school_rating?: number | null;
  price_history?: Array<{ date: string; price: number; event?: string }> | null;

  // Open house
  open_house_start_timestamp?: string | null;
  open_house_end_timestamp?: string | null;

  // UI state
  favorite?: boolean;
  photosCount?: number;
  location?: string; // Legacy computed field
}
