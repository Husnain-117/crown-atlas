import { schemaDate, schemaImageUrls } from "@/lib/seo/schema-values"
/**
 * SEO utility functions for Crown Coastal Homes
 * Provides canonical URL generation, meta validation, and schema helpers
 */

import { CONTACT } from "@/lib/constants/contact";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/constants/site";
import { SITE_SCHEMA_IDS } from "@/lib/seo/site-schema";

interface BreadcrumbItem {
  name: string;
  item: string;
  position: number;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface ListingItem {
  id: string;
  url: string;
  name: string;
  price?: number;
  image?: string;
  address?: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
}

/**
 * Build canonical URL for landing pages
 * Format: /[state]/[city]/[slug]
 */
export function buildCanonical(
  state: string,
  city: string,
  slug: string
): string {
  const stateSlug = state.toLowerCase().replace(/\s+/g, "-");
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");
  const pageSlug = slug.toLowerCase().replace(/\s+/g, "-");

  return `/${stateSlug}/${citySlug}/${pageSlug}`;
}

/**
 * Build canonical URL for property detail pages
 * Format: /properties/[address-slug]/[listingKey]
 */
export function buildPropertyCanonical(
  address: string,
  listingKey: string
): string {
  const slug = (address || "property")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "property";

  return `/properties/${slug}/${encodeURIComponent(listingKey)}`;
}

/**
 * Validate and truncate meta text to character limits
 */
export function validateMetaLength(
  text: string,
  type: "title" | "description"
): string {
  const maxLength = type === "title" ? 60 : 155;

  if (text.length <= maxLength) {
    return text;
  }

  // Truncate and add ellipsis
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumb(items: BreadcrumbItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      item: absoluteUrl(item.item),
    })),
  };
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(faqs: FAQItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate ItemList schema for property listings
 */
export function generateListingSchema(listings: ListingItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: listings.map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "RealEstateListing",
        "@id": absoluteUrl(listing.url),
        url: absoluteUrl(listing.url),
        name: listing.name,
        ...(listing.price && {
          offers: {
            "@type": "Offer",
            price: listing.price,
            priceCurrency: "USD",
          },
        }),
        ...(listing.image && { image: listing.image }),
        ...(listing.address && {
          address: {
            "@type": "PostalAddress",
            streetAddress: listing.address,
            addressLocality: listing.city,
            addressCountry: "US",
          },
        }),
        ...(listing.bedrooms && { numberOfRooms: listing.bedrooms }),
        ...(listing.livingArea && {
          floorSize: {
            "@type": "QuantitativeValue",
            value: listing.livingArea,
            unitCode: "FTK",
          },
        }),
      },
    })),
  };
}

/**
 * Generate RealEstateListing schema for property detail pages
 */
export function generatePropertySchema(property: {
  listing_key: string;
  address: string;
  city: string;
  county?: string;
  state?: string;
  postal_code?: string;
  list_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  living_area_sqft?: number;
  lot_size_sqft?: number;
  year_built?: number;
  property_type?: string;
  public_remarks?: string;
  images?: string[];
  on_market_timestamp?: string;
  listing_agent_name?: string;
  listing_office_name?: string;
}): object {
  const addressSlug = property.address
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: `${property.address}, ${property.city}`,
    description: property.public_remarks,
    ...(property.images &&
      property.images.length > 0 && {
        image: schemaImageUrls(property.images),
      }),
    url: absoluteUrl(`/properties/${addressSlug}/${property.listing_key}`),
    ...(schemaDate(property.on_market_timestamp) && {
      datePosted: schemaDate(property.on_market_timestamp),
    }),
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address.split(",")[0]?.trim(),
      addressLocality: property.city,
      addressRegion: property.state || "CA",
      ...(property.postal_code && { postalCode: property.postal_code }),
      addressCountry: "US",
    },
    ...(property.bedrooms && { numberOfRooms: property.bedrooms }),
    ...(property.living_area_sqft && {
      floorSize: {
        "@type": "QuantitativeValue",
        value: property.living_area_sqft,
        unitCode: "FTK",
      },
    }),
    ...(property.year_built && { yearBuilt: property.year_built }),
    ...(property.list_price && {
      offers: {
        "@type": "Offer",
        price: property.list_price,
        priceCurrency: "USD",
      },
    }),
    ...(property.listing_agent_name && {
      realEstateAgent: {
        "@type": "RealEstateAgent",
        name: property.listing_agent_name,
        ...(property.listing_office_name && {
          worksFor: {
            "@type": "Organization",
            name: property.listing_office_name,
          },
        }),
      },
    }),
  };
}

/**
 * Generate LocalBusiness schema for Crown Coastal Homes
 */
export function generateLocalBusinessSchema(city?: string, region?: string): object {
  const stateName = !region || /^(ca|california)$/i.test(region.trim())
    ? "California"
    : toTitleCase(region);
  const areaServed = city
    ? {
        "@type": "City",
        name: toTitleCase(city),
        containedInPlace: {
          "@type": "State",
          name: stateName,
        },
      }
    : {
        "@type": "State",
        name: "California",
      };

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": SITE_SCHEMA_IDS.localBusiness,
    name: SITE_NAME,
    description:
      "California real estate business providing buyer representation, seller guidance, property research, and local market information.",
    url: SITE_URL,
    telephone: CONTACT.phone.href.replace(/^tel:/, ""),
    email: CONTACT.email.display,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.business.fullAddress.street,
      addressLocality: CONTACT.business.fullAddress.city,
      addressRegion: CONTACT.business.fullAddress.state,
      postalCode: CONTACT.business.fullAddress.zip,
      addressCountry: "US",
    },
    areaServed,
    parentOrganization: {
      "@id": SITE_SCHEMA_IDS.organization,
    },
    sameAs: [
      "https://www.instagram.com/crown.coastal/",
      "https://www.linkedin.com/company/crown-coastal-homes/",
    ],
  };
}

/**
 * Generate WebPage schema
 */
export function generateWebPageSchema(
  url: string,
  name: string,
  description: string
): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: absoluteUrl(url),
    name,
    description,
  };
}

/**
 * Format price for display (with $1M+ formatting)
 */
export function formatPrice(price: number): string {
  if (price >= 1000000) {
    const millions = (price / 1000000).toFixed(2);
    return `$${millions}M`;
  }
  if (price >= 1000) {
    const thousands = Math.floor(price / 1000);
    return `$${thousands}K`;
  }
  return `$${price.toLocaleString()}`;
}

/**
 * Generate RealEstateAgent schema for Crown Coastal Homes / Reza Barghlameno
 * This is the AUTHORITATIVE agent schema for all landing pages.
 */
export function generateRealEstateAgentSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": SITE_SCHEMA_IDS.agent,
    name: CONTACT.agent.name,
    jobTitle: CONTACT.agent.title,
    description:
      "Licensed California real estate agent specializing in buyer representation, seller guidance, HOA document review, and comparable sales research.",
    url: absoluteUrl("/team/reza-barghlameno"),
    image: absoluteUrl(CONTACT.agent.avatarUrl),
    telephone: CONTACT.phone.href.replace(/^tel:/, ""),
    email: CONTACT.email.display,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.business.fullAddress.street,
      addressLocality: CONTACT.business.fullAddress.city,
      addressRegion: CONTACT.business.fullAddress.state,
      postalCode: CONTACT.business.fullAddress.zip,
      addressCountry: "US",
    },
    worksFor: {
      "@id": SITE_SCHEMA_IDS.localBusiness,
    },
    identifier: {
      "@type": "PropertyValue",
      name: "California DRE License",
      value: CONTACT.agent.dre,
    },
    knowsAbout: [
      "HOA document analysis",
      "Comparable sales research",
      "Home inspections",
      "Buyer protection",
      "Seller representation",
      "Documentation review",
    ],
    sameAs: [
      "https://www.zillow.com/profile/RezaSoCal",
      "https://www.homes.com/real-estate-agents/reza-barghlameno/wkjt4yj/",
    ],
  };
}

function toTitleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Format price range for SEO (e.g., "$1M+" instead of "1m")
 */
export function formatPriceRangeForSEO(min?: number, max?: number): string {
  if (!min && !max) return "";

  if (min && min >= 1000000 && !max) {
    return "$1M+";
  }

  if (min && max) {
    return `$${formatPrice(min)} - ${formatPrice(max)}`;
  }

  if (min) {
    return `$${formatPrice(min)}+`;
  }

  if (max) {
    return `Up to ${formatPrice(max)}`;
  }

  return "";
}

/**
 * Slugify text for URLs
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Build property URL slug from address
 */
export function buildPropertySlug(address: string): string {
  return slugify(address);
}

/**
 * Extract city and state from full address
 */
export function parseAddress(fullAddress: string): {
  street: string;
  city: string;
  state: string;
  zip: string;
} {
  const parts = fullAddress.split(",").map((p) => p.trim());

  return {
    street: parts[0] || "",
    city: parts[1] || "",
    state: parts[2]?.split(" ")[0] || "",
    zip: parts[2]?.split(" ")[1] || "",
  };
}
