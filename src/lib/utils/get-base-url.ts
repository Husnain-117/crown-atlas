import { SITE_URL } from "@/lib/constants/site";

/**
 * Get the base URL for API requests
 * Works in both server-side and client-side contexts
 * Handles localhost, Vercel, and custom domains
 */
export function getBaseUrl(): string {
  // Server-side: Try to get from request context or environment
  if (typeof window === 'undefined') {
    // On Vercel, use VERCEL_URL (automatically set) - this is the most reliable
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // Use NEXT_PUBLIC_BASE_URL if explicitly set (for custom domains)
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
    
    // For server-side rendering in development, use localhost
    if (process.env.NODE_ENV === 'development') {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    }
    
    // Production fallback - try to construct from VERCEL_URL or use environment
    // This should rarely be needed if VERCEL_URL is set (which it is on Vercel)
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) {
      return `https://${vercelUrl}`;
    }
    
    return process.env.NEXT_PUBLIC_API_URL || SITE_URL;
  }
  
  // Client-side: Use window.location.origin (always correct)
  return window.location.origin;
}

/**
 * Get base URL for server-side requests with NextRequest
 * Prefers request.nextUrl.origin for accurate URL resolution
 */
export function getServerBaseUrl(request?: { nextUrl?: { origin: string } }): string {
  // If we have a request object with nextUrl, use it (most accurate)
  if (request?.nextUrl?.origin) {
    return request.nextUrl.origin;
  }
  
  // Fallback to environment-based detection
  return getBaseUrl();
}

