import { canonicalCityBuyPathFor } from "@/lib/seo/location-canonical"
import { schemaDate } from "@/lib/seo/schema-values"
import { SITE_SCHEMA_IDS } from "@/lib/seo/site-schema"
import { propertyPathFor } from "@/lib/property-url"
import { SITE_URL, absoluteUrl } from "@/lib/constants/site"

interface Props {
  city: string
  canonical: string // path beginning with '/'
  featured: Array<{ id: string; url?: string }>
  variant?: string // landing slug (e.g. condos-for-sale)
  faqItems?: Array<{ question: string; answer: string }>
  breadcrumbItems?: Array<{ name: string; item: string }>
  dateModified?: string
}

/**
 * Generate structured data for landing pages including:
 * - WebPage
 * - BreadcrumbList (Home -> California -> City -> Landing Type)
 * - ItemList (featured listings)
 * - Dataset (when the page contains market statistics)
 * - FAQPage (if FAQs provided)
 */
export default function CitySchema({ city, canonical, featured, variant, faqItems, breadcrumbItems, dateModified }: Props) {
  const updatedAt = schemaDate(dateModified)
  const origin = SITE_URL
  const absCanonical = absoluteUrl(canonical)
  const cityBuyPath = canonicalCityBuyPathFor(city)

  const itemList = (featured || []).slice(0, 20).map((p, i) => {
    const path = p.url || propertyPathFor({ listing_key: p.id })
    return {
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(path)
    }
  })

  const variantLabel = variant ? variant.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Homes for Sale'

  // Determine breadcrumb structure based on canonical path
  // For /discover/[city] pages: Home -> Buy -> City
  // For /california/[city]/[slug] pages: Home -> California -> City -> Landing Type
  const isDiscoverPage = canonical.startsWith('/discover/')
  const breadcrumbList = breadcrumbItems ? {
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.item)
    }))
  } : (isDiscoverPage ? {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
      { '@type': 'ListItem', position: 2, name: 'Buy', item: `${origin}/buy` },
      { '@type': 'ListItem', position: 3, name: city, item: absCanonical }
    ]
  } : {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
      { '@type': 'ListItem', position: 2, name: 'California homes', item: `${origin}/buy` },
      ...(cityBuyPath ? [{ '@type': 'ListItem', position: 3, name: city, item: absoluteUrl(cityBuyPath) }] : []),
      { '@type': 'ListItem', position: cityBuyPath ? 4 : 3, name: variantLabel, item: absCanonical }
    ]
  })

  // WebPage schema
  // For discover pages, name should match H1: "{city} Homes for Sale"
  const webPageName = isDiscoverPage
    ? `${city} Homes for Sale`
    : `${city}, CA ${variantLabel}`.trim()

  const webPage = {
    '@type': 'WebPage',
    '@id': `${absCanonical}#webpage`,
    url: absCanonical,
    name: webPageName,
    isPartOf: { '@id': SITE_SCHEMA_IDS.website },
    publisher: { '@id': SITE_SCHEMA_IDS.organization },
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    about: {
      '@type': 'City',
      name: city,
      containedInPlace: { '@type': 'State', name: 'California' }
    }
  }

  // Build @graph array
  const graphItems: object[] = [
    webPage,
    breadcrumbList
  ]

  // Add ItemList only if featured listings exist with real listing IDs
  // Only include listings that have valid IDs (not invented addresses)
  const validItemList = itemList.filter(item => {
    // Ensure URL contains a valid listing ID (not placeholder)
    const listingId = item.url.split('/').pop()
    return listingId && listingId !== 'undefined' && listingId !== 'null' && listingId.length > 0
  })

  if (validItemList.length > 0) {
    graphItems.push({
      '@type': 'ItemList',
      itemListElement: validItemList,
      numberOfItems: validItemList.length
    })
  }

  // Dataset schema for pages with market statistics (county/city pages)
  const isCountyOrCityPage = canonical.startsWith('/buy/') || canonical.startsWith('/rent/') || canonical.startsWith('/discover/') || canonical.startsWith('/california/')
  if (isCountyOrCityPage) {
    graphItems.push({
      '@type': 'Dataset',
      name: `${city} Real Estate Market Data`,
      description: `Listing and market summary data displayed for ${city}, California. Source timing and limitations are documented on the Crown Coastal Homes data methodology page.`,
      url: absCanonical,
      creator: { '@id': SITE_SCHEMA_IDS.organization },
      isBasedOn: absoluteUrl('/about/data-methodology'),
      ...(updatedAt ? { dateModified: updatedAt } : {}),
      spatialCoverage: {
        '@type': 'Place',
        name: `${city}, California`
      }
    })
  }

  const data = {
    '@context': 'https://schema.org',
    '@graph': graphItems
  }

  // FAQPage schema (separate script for better parsing)
  const faqPageSchema = faqItems && faqItems.length >= 1 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  } : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
      />
      {faqPageSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema).replace(/</g, "\\u003c") }}
        />
      )}
    </>
  )
}
