import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import PropertyDetailServer, { generatePropertyDetailMetadata } from "@/app/properties/_components/PropertyDetailServer";
import { getPropertyDetail } from "@/lib/db/property-detail-repo";
import {
  getPropertyUrlKey,
  propertyAddressSlug,
  propertyPathFor,
} from "@/lib/property-url";

export const revalidate = 3600;
export const dynamicParams = true;

// Keep the build small. Valid listing URLs are generated on first request and
// then retained by ISR instead of prebuilding tens of thousands of pages.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return generatePropertyDetailMetadata(id);
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ address: string; id: string }>;
}) {
  const { address, id } = await params;
  const property = await getPropertyDetail(id);
  if (!property) notFound();

  const canonicalAddress = propertyAddressSlug(property);
  if (id !== getPropertyUrlKey(property) || address !== canonicalAddress) {
    permanentRedirect(propertyPathFor(property));
  }

  return <PropertyDetailServer id={id} requestedAddress={address} />;
}

