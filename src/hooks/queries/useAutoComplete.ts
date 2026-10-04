import { useQuery } from "@tanstack/react-query";

export interface AutoCompleteResult {
  type: "city" | "zip";
  value: {
    city: string;
    propertyCount?: number;
    countySlug?: string;
    citySlug?: string;
    postalCode?: string;
    label: string;
  };
}

const fetchAutoComplete = async (query: string): Promise<AutoCompleteResult[]> => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const response = await fetch(`${baseUrl}/api/autocomplete?query=${encodeURIComponent(query)}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Autocomplete API error: ${response.status}`);
  }

  return response.json();
};

export const useAutoComplete = (query: string) => {
  return useQuery<AutoCompleteResult[]>({
    queryKey: ["autoComplete", query],
    queryFn: () => fetchAutoComplete(query),
    enabled: query.trim().length >= 2,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
