/**
 * Centralized placeholder image management
 * Prevents crashes by ensuring all placeholders are valid and exist
 */

// Base URL for images
const IMAGE_BASE = '';

// A listing without MLS media must not show a different property.
export const PROPERTY_PLACEHOLDERS = [
  '/placeholder.svg',
] as const;

// City/County specific images
export const CITY_PLACEHOLDERS = {
  'san-diego': '/san-diego-bay-sunset.png',
  'los-angeles': '/malibu-coastline-beach.jpg',
  'orange': '/santa-barbara-american-riviera.jpg',
  'san-francisco': '/city/california/san-francisco/san-francisco-ca.webp',
  'napa': '/napa-valley-wine-country.jpg',
  'santa-barbara': '/santa-barbara-american-riviera.jpg',
  'ventura': '/ventura-beach-coastline.jpg',
  'palm-springs': '/palm-springs-desert-mountains.jpg',
  'sonoma': '/sonoma-plaza-wine-country.jpg',
  'santa-rosa': '/santa-rosa-wine-country.jpg',
  'san-mateo': '/san-mateo-peninsula.jpg',
  'redwood': '/redwood-city-downtown.jpg',
  'san-jose': '/san-jose-silicon-valley.jpg',
} as const;

// Agent/Team images
export const AGENT_PLACEHOLDERS = [
  '/professional-real-estate-agent.png',
  '/agent.jpg',
  '/agent without bg.png',
] as const;

// Generic placeholders for various content types
export const GENERIC_PLACEHOLDERS = {
  blog: '/placeholder.svg',
  service: '/service.webp',
  logo: '/placeholder-logo.svg',
  user: '/placeholder.svg',
  building: '/27.jpg',
  property: '/placeholder.svg',
} as const;

// Type definitions
export type PlaceholderType = keyof typeof GENERIC_PLACEHOLDERS | 'user';
export type CityKey = keyof typeof CITY_PLACEHOLDERS;

/**
 * Get a consistent placeholder image based on ID
 * Ensures the same item always gets the same placeholder
 */
export function getPlaceholderById(id: string | number, collection: readonly string[]): string {
  const index = Math.abs(Number(id) || 0) % collection.length;
  return IMAGE_BASE + collection[index];
}

/**
 * Get a city-specific placeholder
 */
export function getCityPlaceholder(citySlug: string): string {
  const normalizedCity = citySlug.toLowerCase().replace(/[^a-z0-9]/g, '-') as CityKey;
  return IMAGE_BASE + (CITY_PLACEHOLDERS[normalizedCity] || PROPERTY_PLACEHOLDERS[0]);
}

/**
 * Get a property placeholder with variety
 */
export function getPropertyPlaceholder(id?: string | number): string {
  return getPlaceholderById(id ?? 0, PROPERTY_PLACEHOLDERS);
}

/**
 * Get an agent placeholder
 */
export function getAgentPlaceholder(id?: string | number): string {
  if (id) {
    return getPlaceholderById(id, AGENT_PLACEHOLDERS);
  }
  return IMAGE_BASE + AGENT_PLACEHOLDERS[0];
}

/**
 * Get a generic placeholder by type
 */
export function getGenericPlaceholder(type: PlaceholderType): string {
  return IMAGE_BASE + GENERIC_PLACEHOLDERS[type];
}

/**
 * Validate if an image URL is valid and accessible
 * Returns a fallback if invalid
 */
export function validateImageUrl(
  url: string | null | undefined,
  fallbackType: 'property' | 'city' | 'agent' | 'blog' | 'user' = 'property',
  id?: string | number,
  citySlug?: string
): string {
  // Handle null/undefined
  if (!url || url.trim() === '') {
    switch (fallbackType) {
      case 'property':
        return getPropertyPlaceholder(id);
      case 'city':
        return citySlug ? getCityPlaceholder(citySlug) : getPropertyPlaceholder(id);
      case 'agent':
        return getAgentPlaceholder(id);
      case 'user':
        return getGenericPlaceholder('user');
      case 'blog':
        return getGenericPlaceholder('blog');
      default:
        return getPropertyPlaceholder(id);
    }
  }

  const trimmed = url.trim();

  // Handle obvious invalid values
  if (
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined' ||
    trimmed === 'N/A' ||
    trimmed === 'n/a'
  ) {
    switch (fallbackType) {
      case 'property':
        return getPropertyPlaceholder(id);
      case 'city':
        return citySlug ? getCityPlaceholder(citySlug) : getPropertyPlaceholder(id);
      case 'agent':
        return getAgentPlaceholder(id);
      case 'blog':
        return getGenericPlaceholder('blog');
      default:
        return getPropertyPlaceholder(id);
    }
  }

  // Accept valid URLs
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }

  // Invalid format, return fallback
  switch (fallbackType) {
    case 'property':
      return getPropertyPlaceholder(id);
    case 'city':
      return citySlug ? getCityPlaceholder(citySlug) : getPropertyPlaceholder(id);
    case 'agent':
      return getAgentPlaceholder(id);
    case 'user':
      return getGenericPlaceholder('user');
    case 'blog':
      return getGenericPlaceholder('blog');
    default:
      return getPropertyPlaceholder(id);
  }
}

/**
 * Get a list of all available placeholder images for debugging
 */
export function getAllPlaceholders() {
  return {
    properties: PROPERTY_PLACEHOLDERS,
    cities: CITY_PLACEHOLDERS,
    agents: AGENT_PLACEHOLDERS,
    generic: GENERIC_PLACEHOLDERS,
  };
}
