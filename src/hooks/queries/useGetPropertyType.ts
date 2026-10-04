"use client"

import { useQuery } from "@tanstack/react-query"

interface PropertyTypesResponse {
  property_type: any[];
  property_sub_type: any[];
}

// Static property types - no API call needed
const STATIC_PROPERTY_TYPES = [
  { label: 'Condo', value: 'condo', icon: 'Building' },
  { label: 'Townhouse', value: 'townhouse', icon: 'Building2' },
  { label: 'Apartment', value: 'apartment', icon: 'Building' },
  { label: 'Single Family', value: 'single_family', icon: 'Home' },
  { label: 'Multi Family', value: 'multi_family', icon: 'Building2' },
  { label: 'Commercial', value: 'commercial', icon: 'Building' }
];

const fetchPropertyTypes = async (): Promise<PropertyTypesResponse> => {
  // Return static data instead of making API call
  // This avoids the ERR_CONNECTION_REFUSED error
  return { 
    property_type: STATIC_PROPERTY_TYPES, 
    property_sub_type: [] 
  };
};

const useGetPropertyTypes = () => {
  return useQuery<PropertyTypesResponse>({
    queryKey: ["propertyTypes"],
    queryFn: fetchPropertyTypes,
    staleTime: Infinity, // Data never goes stale since it's static
    gcTime: Infinity, // Keep in cache forever
  });
};

export default useGetPropertyTypes;
