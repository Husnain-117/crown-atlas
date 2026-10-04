import { validateImageUrl } from '@/constants/placeholders';

/**
 * Enhanced image validation for county/city cards
 * Ensures all images display correctly with proper fallbacks
 */
export function getValidatedCountyImage(
  imageUrl: string | undefined | null,
  citySlug: string,
  fallbackType: 'property' | 'city' = 'property'
): string {
  // First try the provided image URL
  if (imageUrl && typeof imageUrl === 'string') {
    const trimmed = imageUrl.trim();
    
    // Accept valid URLs
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    
    // Accept valid local paths
    if (trimmed.startsWith('/')) {
      return trimmed;
    }
  }
  
  // Fallback to placeholder system with city-specific logic
  return validateImageUrl(null, fallbackType, citySlug, citySlug.replace('-ca', ''));
}

/**
 * Get a consistent image for a city based on its slug
 * This ensures the same city always shows the same image
 */
export function getConsistentCityImage(citySlug: string): string {
  // Use the placeholder system for consistency
  return validateImageUrl(null, 'city', citySlug, citySlug.replace('-ca', ''));
}

/**
 * Preload images to check if they exist (client-side only)
 */
export function preloadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/**
 * Client-side image validation with fallback
 */
export async function getValidatedImageClient(
  src: string,
  fallbackType: 'property' | 'city' = 'property',
  id?: string
): Promise<string> {
  const isValid = await preloadImage(src);
  
  if (!isValid) {
    // Return fallback if image fails to load
    return validateImageUrl(null, fallbackType, id);
  }
  
  return src;
}
