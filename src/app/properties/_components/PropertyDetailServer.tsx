import { canonicalCityBuyPathFor } from "@/lib/seo/location-canonical"
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { getPropertyDetail, type PropertyDetailData } from "@/lib/db/property-detail-repo";
import PropertyDetailClientPage from "@/app/properties/property/[id]/property-detail-client-page";
import { ListingSchema } from "@/components/ListingSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { SITE_URL } from "@/lib/constants/site";
import {
  isValidPropertyListingKey,
  getPropertyUrlKey,
  propertyAddressSlug,
  propertyPathFor,
  propertyUrlFor,
} from "@/lib/property-url";
import PropertyHistorySection from "@/app/properties/_components/PropertyHistorySection";
import PropertyMarketContext from "@/app/properties/_components/PropertyMarketContext";
import { isActivePropertyStatus } from "@/lib/property-status";
import { buildMetadataTitle, truncateMetadataText } from "@/lib/seo/meta";

export async function generatePropertyDetailMetadata(id: string): Promise<Metadata> {
  try {
    if (!isValidPropertyListingKey(id)) {
      return notFoundMetadata();
    }

    const property = await getPropertyDetail(id);

    if (!property) {
      return notFoundMetadata();
    }

    const canonicalUrl = propertyUrlFor(property);
    const addressShort = property.address?.split(",")[0] || property.address || "Property";
    const cityState = property.city ? `${property.city}, ${property.state || "CA"}` : "California";
    const priceText = formatCurrency(property.list_price);
    const bedsText = formatCount(property.bedrooms, "bed");
    const bathsText = formatCount(property.bathrooms, "bath");
    const sqftText = formatSqft(property.living_area_sqft);
    const specsText = [bedsText, bathsText, sqftText].filter(Boolean).join(", ") || "property";
    const titlePrice = priceText || "Price TBD";
    const titleLocation = property.postal_code ? `${cityState} ${property.postal_code}` : cityState;
    const statusText = property.standard_status || property.mls_status || "";
    const isActive = isActivePropertyStatus(statusText);
    const canPublishHistoricalRemarks = process.env.CRMLS_PUBLISH_HISTORICAL_REMARKS === "true";
    const canPublishHistoricalMedia = process.env.CRMLS_PUBLISH_HISTORICAL_MEDIA === "true";
    const generatedTitle = isActive
      ? `${addressShort} | ${titlePrice} | ${titleLocation}`
      : `${addressShort} | Property History | ${titleLocation}`;
    const title = property.seo_title
      ? truncateMetadataText(property.seo_title, 65)
      : buildMetadataTitle(generatedTitle, "Crown Coastal Homes", 65);
    const description =
      property.meta_description ||
      compactSentence(
        `${isActive ? `${specsText} home` : `Historical ${specsText} listing`} at ${addressShort}, ${cityState}${
          isActive && priceText ? ` listed for ${priceText}` : ""
        }. ${
          (isActive || canPublishHistoricalRemarks ? property.public_remarks : "") || (isActive
            ? "View photos, local details, and schedule a private showing with Crown Coastal Homes."
            : "Review the property history and explore currently active homes nearby with Crown Coastal Homes.")
        }`
      );

    return {
      title,
      description: truncateMetadataText(description, 160),
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${property.address || addressShort} | ${titlePrice}`,
        description: [specsText, cityState, statusText].filter(Boolean).join(" | "),
        images: (isActive || canPublishHistoricalMedia) && property.images?.length
          ? [{ url: property.images[0], width: 1200, height: 630, alt: `${property.address}, ${property.city} CA` }]
          : undefined,
        url: canonicalUrl,
        type: "website",
        siteName: "Crown Coastal Homes",
      },
      twitter: {
        card: "summary_large_image",
        title: `${property.address || addressShort} | ${titlePrice}`,
        description: [bedsText, bathsText, cityState].filter(Boolean).join(" | "),
        images: (isActive || canPublishHistoricalMedia) && property.images?.length ? [property.images[0]] : undefined,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      },
    };
  } catch (error) {
    console.error("Error generating metadata for property:", error);
    return {
      title: "Property Details | Crown Coastal Homes",
      description: "View property details, photos, and schedule a showing.",
      robots: { index: false, follow: true },
    };
  }
}

export default async function PropertyDetailServer({
  id,
  requestedAddress,
  redirectLegacy = false,
}: {
  id: string;
  requestedAddress?: string;
  redirectLegacy?: boolean;
}) {
  if (!isValidPropertyListingKey(id)) {
    notFound();
  }

  const property = await getPropertyDetail(id);

  if (!property) {
    notFound();
  }

  const canonicalPath = propertyPathFor(property);
  const canonicalSlug = propertyAddressSlug(property);

  if (
    redirectLegacy ||
    id !== getPropertyUrlKey(property) ||
    (requestedAddress && requestedAddress !== canonicalSlug)
  ) {
    permanentRedirect(canonicalPath);
  }

  return <PropertyDetailMarkup property={property} canonicalPath={canonicalPath} />;
}

function PropertyDetailMarkup({
  property,
  canonicalPath,
}: {
  property: PropertyDetailData;
  canonicalPath: string;
}) {
  const status = property.standard_status || property.mls_status;
  const isActive = isActivePropertyStatus(status);
  const publicProperty: PropertyDetailData = {
    ...property,
    ...(!isActive && process.env.CRMLS_PUBLISH_HISTORICAL_MEDIA !== "true"
      ? { images: [], main_image_url: "", photos_count: 0 }
      : {}),
    ...(!isActive && process.env.CRMLS_PUBLISH_HISTORICAL_REMARKS !== "true"
      ? { public_remarks: "" }
      : {}),
  };
  const cityPath = canonicalCityBuyPathFor(property.city, property.county);

  return (
    <>
      <ListingSchema listing={publicProperty as any} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${SITE_URL}/` },
          { name: "Properties", url: `${SITE_URL}/properties` },
          ...(cityPath ? [{ name: `${property.city} Homes for Sale`, url: `${SITE_URL}${cityPath}` }] : []),
          { name: property.address || "Property", url: `${SITE_URL}${canonicalPath}` },
        ]}
      />
      <PropertyDetailClientPage
        propertyData={publicProperty}
        historySection={
          <Suspense fallback={<div className="h-52 animate-pulse rounded-lg bg-[var(--surface-muted)]" aria-hidden="true" />}>
            <PropertyHistorySection property={property} />
          </Suspense>
        }
        marketContext={
          <Suspense fallback={<div className="h-52 animate-pulse rounded-lg bg-[var(--surface-muted)]" aria-hidden="true" />}>
            <PropertyMarketContext property={property} />
          </Suspense>
        }
      />
    </>
  );
}

function notFoundMetadata(): Metadata {
  return {
    title: "Property Not Found | Crown Coastal Homes",
    robots: { index: false, follow: true },
  };
}

function formatCurrency(value: unknown): string {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCount(value: unknown, label: string): string {
  const count = Number(value);
  if (!Number.isFinite(count) || count <= 0) return "";
  const display = Number.isInteger(count) ? String(count) : count.toFixed(1);
  return `${display} ${label}${count === 1 ? "" : "s"}`;
}

function formatSqft(value: unknown): string {
  const sqft = Number(value);
  if (!Number.isFinite(sqft) || sqft <= 0) return "";
  return `${Math.round(sqft).toLocaleString("en-US")} sqft`;
}

function compactSentence(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
