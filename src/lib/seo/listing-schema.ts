import { propertyUrlFor } from "@/lib/property-url";
import { schemaDate, schemaImageUrls } from "./schema-values";

export type ListingShape = {
  address: string;
  city?: string;
  state?: string;
  county?: string;
  postal_code?: string;
  bedrooms?: number;
  bathrooms?: number;
  living_area_sqft?: number;
  lot_size_sqft?: number;
  year_built?: number;
  list_price?: number;
  main_image_url?: string;
  images?: string[];
  listing_key: string;
  public_remarks?: string;
  status?: string;
  standard_status?: string;
  mls_status?: string;
  property_type?: string;
  property_sub_type?: string;
  latitude?: number;
  longitude?: number;
  listing_contract_date?: string | Date;
  updated_at?: string | Date | null;
  hoa_fee?: number | null;
  hoa_fee_frequency?: string | null;
};

export function buildListingSchema(listing: ListingShape) {
  const propertyFacts = [
    listing.bedrooms ? `${listing.bedrooms} bed` : "",
    listing.bathrooms ? `${listing.bathrooms} bath` : "",
  ].filter(Boolean).join(" ");
  const description = listing.public_remarks ||
    `${propertyFacts ? `${propertyFacts} ` : ""}home for sale in ${listing.city || "California"}, ${listing.state || "CA"}`;

  const images = schemaImageUrls(listing.images && listing.images.length > 0
    ? listing.images
    : listing.main_image_url
    ? [listing.main_image_url]
    : []);

  const status = listing.standard_status || listing.mls_status || listing.status || "";
  const normalizedStatus = status.trim().toLowerCase().replace(/[\s_-]+/g, " ");
  const availability = /^(active|for sale)$/.test(normalizedStatus)
    ? "https://schema.org/InStock"
    : /^(closed|sold|withdrawn|expired|canceled|cancelled)$/.test(normalizedStatus)
      ? "https://schema.org/OutOfStock"
      : undefined;
  const url = propertyUrlFor(listing);

  const datePosted = schemaDate(listing.listing_contract_date);
  const dateModified = schemaDate(listing.updated_at);

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${url}#listing`,
    name: listing.address,
    description: description.substring(0, 1000),
    url,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "MLS listing ID",
      value: listing.listing_key,
    },
    ...(images.length > 0 && { image: images }),
    ...(listing.living_area_sqft && listing.living_area_sqft > 0 && {
      floorSize: {
        "@type": "QuantitativeValue",
        value: listing.living_area_sqft,
        unitCode: "FTK"
      },
    }),
    ...(listing.bedrooms && listing.bedrooms > 0 && { numberOfRooms: listing.bedrooms }),
    ...(listing.bedrooms && listing.bedrooms > 0 && { numberOfBedrooms: listing.bedrooms }),
    ...(listing.bathrooms && listing.bathrooms > 0 && { numberOfBathroomsTotal: listing.bathrooms }),
    ...(listing.lot_size_sqft && listing.lot_size_sqft > 0 && {
      lotSize: {
        "@type": "QuantitativeValue",
        value: listing.lot_size_sqft,
        unitCode: "FTK",
      },
    }),
    ...(listing.year_built && listing.year_built > 0 && { yearBuilt: listing.year_built }),
    ...(listing.property_sub_type && { additionalType: listing.property_sub_type }),
    ...(datePosted && { datePosted }),
    ...(dateModified && { dateModified }),
    ...(listing.latitude && listing.longitude && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: listing.latitude,
        longitude: listing.longitude,
      },
    }),
    ...(listing.list_price && listing.list_price > 0 && {
      offers: {
        "@type": "Offer",
        price: listing.list_price,
        priceCurrency: "USD",
        url,
        ...(availability && { availability }),
      },
    }),
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.address,
      addressLocality: listing.city || "",
      addressRegion: listing.state || "CA",
      ...(listing.postal_code && { postalCode: listing.postal_code }),
      addressCountry: "US",
    },
    additionalProperty: [
      listing.property_type && {
        "@type": "PropertyValue",
        name: "Property type",
        value: listing.property_type,
      },
      listing.hoa_fee && {
        "@type": "PropertyValue",
        name: "HOA fee",
        value: listing.hoa_fee,
        unitText: listing.hoa_fee_frequency || undefined,
      },
      status && {
        "@type": "PropertyValue",
        name: "Listing status",
        value: status,
      },
    ].filter(Boolean),
  };

}
