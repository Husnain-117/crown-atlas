import type { MetadataRoute } from 'next'
import { getConfiguredSiteUrl } from '@/lib/constants/site'

const CONTENT_ALLOW = [
  '/',
  '/about',
  '/about/facts',
  '/blogs/*',
  '/discover/*',
  '/buy/*',
  '/rent/*',
  '/california/*',
  '/neighborhoods/*',
  '/properties/*',
  '/llms.txt',
  // Public images must remain crawlable even though other APIs are private.
  '/_next/image$',
  '/_next/image?',
  '/api/media$',
  '/api/media?',
  '/api/og$',
  '/api/og?',
]

const PRIVATE_AND_TRAP_DISALLOW = [
  '/api',
  '/admin',
  '/auth',
  '/login',
  '/register',
  '/signup',
  '/forgot-password',
  '/dashboard',
  '/profile',
  '/onboarding',
  '/contact?*',
  '/properties?*minPrice*',
  '/properties?*maxPrice*',
  '/properties?*beds*',
  '/properties?*baths*',
  '/properties?*propertyType*',
  '/properties?*city*',
  '/properties?*county*&*',
  '/properties?*&*&*',
]

const AI_SEARCH_CRAWLERS = [
  'OAI-SearchBot',
  'GPTBot',
  'ChatGPT-User',
  'PerplexityBot',
  'ClaudeBot',
  'Claude-User',
  'Google-Extended',
  'Bingbot',
]

export default function robots(): MetadataRoute.Robots {
  // Block indexing on preview/staging environments
  const isPreview = process.env.VERCEL && process.env.VERCEL_ENV !== 'production'

  // If preview/staging, block all indexing (noindex, nofollow)
  if (isPreview) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        }
      ],
      // Don't reference sitemap on preview - it should only exist on production
      // Don't set host on preview - prevents accidental indexing
    }
  }

  // Production: Allow indexing with proper rules
  const base = getConfiguredSiteUrl()
  return {
    rules: [
      {
        userAgent: '*',
        allow: CONTENT_ALLOW,
        // Property filter URLs generate noindex metadata and canonical targets,
        // but robots disallow also protects crawl budget from query traps.
        disallow: PRIVATE_AND_TRAP_DISALLOW
      },
      ...AI_SEARCH_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: CONTENT_ALLOW,
        disallow: PRIVATE_AND_TRAP_DISALLOW,
      })),
    ],
    sitemap: [
      `${base}/sitemap.xml`,
      `${base}/sitemap-listings.xml`,
    ],
    host: base
  }
}
