"use client"
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

// Create a local axios instance for this specific hook
// Use relative URLs - window.location.origin for client-side (always correct)
const apiClient = axios.create({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface PropertyDetail {
  parking_total: string
  garage_size: string
  heating: string
  cooling: string
  security_features: string
  parking_features: string
  laundry_features: string
 
  _id: string
  listing_key: string
  listing_id: string
  list_price: number
  previous_list_price: number | null
  lease_amount: number | null
  address: string
  city: string
  county: string
  postal_code: string
  latitude: number
  longitude: number
  property_type: string
  property_sub_type: string
  bedrooms: number | null
  bathrooms: number | null
  living_area_sqft: number | null
  lot_size_sqft: number
  year_built: number
  zoning: string | null
  standard_status: string
  mls_status: string
  days_on_market: number
  listing_contract_date: string
  public_remarks: string
  subdivision_name: string
  main_image_url: string
  list_agent_full_name: string
  list_office_name: string
  list_agent_email: string
  list_agent_phone: string
  list_agent_dre: string | null
  lease_considered: boolean
  lease_amount_frequency: string | null
  modification_timestamp: string
  on_market_timestamp: string
  agent_phone: string
  agent_email: string
  agent_office_email: string
  agent_office_phone: string
  ListAgentLastName: string
  ListAgentURL: string | null
  possible_use: string | null
  price_change_timestamp: string | null
  VirtualTourURLUnbranded: string | null
  view: string
  Utilities: string | null
  LotFeatures: string[] | null
  ShowingContactName: string | null
  current_price: number
  images: string[]
  seo_title: string | null
  faq_content: string | null
  h1_heading: string | null
  amenities_content: string | null
  page_content: string | null
  meta_description: string | null
  title: string | null
  other_info: any
  interior_features: string
  stories: number
  pool_features: string
}

const fetchPropertyDetail = async (id: string): Promise<PropertyDetail> => {
  console.log('🏠 Fetching property detail for ID:', id);
  
  if (!id || id === 'undefined' || id.trim() === '') {
    throw new Error('Valid property ID is required');
  }
  
  try {
    // Use our local API client that points to the correct base URL
    const response = await apiClient.get(`/api/properties/${id}`);
    
    // Check response status - handle 404 separately from other errors
    if (response.status === 404) {
      throw new Error('Property not found');
    }
    
    // Check if response is ok (status 200-299)
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.data?.error || `Server returned status ${response.status}`);
    }
    
    if (!response.data?.success) {
      throw new Error(response.data?.error || 'Failed to fetch property');
    }
    
    return response.data.data;
  } catch (error: any) {
    // Re-throw with more context if it's an axios error
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      if (status === 404) {
        throw new Error('Property not found');
      } else if (status >= 500) {
        throw new Error('Server error - please try again later');
      } else {
        throw new Error(error.response.data?.error || `Request failed with status ${status}`);
      }
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Network error - please check your connection');
    } else {
      // Something else happened
      throw error;
    }
  }
}

export const usePropertyDetail = (id: string) => {
  return useQuery({
    queryKey: ['propertyDetail', id],
    queryFn: () => fetchPropertyDetail(id),
    enabled: !!id && id !== 'undefined' && id.trim() !== '',
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (property not found) or 400 (bad request)
      if (error?.message?.includes('not found') || error?.message?.includes('required')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
