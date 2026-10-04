import { absoluteUrl } from "@/lib/constants/site";

export type PropertyUrlInput = {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  zip_code?: string | null;
  listing_key?: string | null;
  property_entity_key?: string | null;
  id?: string | null;
  _id?: string | null;
};

export function getPropertyListingKey(property: PropertyUrlInput): string {
  return String(property.listing_key || property.id || property._id || "").trim();
}

export function getPropertyUrlKey(property: PropertyUrlInput): string {
  return String(property.property_entity_key || getPropertyListingKey(property)).trim();
}

export function isPropertyEntityKey(value?: string | null): boolean {
  return /^[a-f0-9]{32}$/i.test(String(value || "").trim());
}

export function isValidPropertyListingKey(value?: string | null): boolean {
  const listingKey = String(value || "").trim();
  return listingKey.length > 0 && listingKey !== "undefined";
}

export function getLegacyPropertyResolverPath(pathname: string): string | null {
  const match = pathname.match(/^\/properties\/([^/]+)\/([^/]+)\/?$/);
  if (!match || match[1] === "property" || isPropertyEntityKey(match[2])) {
    return null;
  }

  return `/properties/property/${match[2]}`;
}

export function slugifyPropertyAddress(value?: string | null): string {
  return (value || "property")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 90) || "property";
}

export function propertyAddressSlug(property: PropertyUrlInput): string {
  const parts = [
    property.address,
    property.city,
    property.state || "ca",
    property.postal_code || property.zip_code,
  ].filter(Boolean);

  return parts.length ? slugifyPropertyAddress(parts.join(" ")) : "listing";
}

export function propertyPathFor(property: PropertyUrlInput): string {
  const urlKey = getPropertyUrlKey(property);
  const safeKey = urlKey ? encodeURIComponent(urlKey) : "unknown";

  return `/properties/${propertyAddressSlug(property)}/${safeKey}`;
}

export function propertyUrlFor(property: PropertyUrlInput): string {
  return absoluteUrl(propertyPathFor(property));
}
