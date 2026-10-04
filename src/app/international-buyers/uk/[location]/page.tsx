import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BuyerLocationPage from '@/components/international-buyers/location-page';
import { BUYER_LOCATIONS, getBuyerLocation } from '@/lib/international-buyer-locations';
import { buyerLocationMetadata } from '@/lib/international-buyer-location-seo';

export const dynamicParams = false;
export function generateStaticParams() {
  return BUYER_LOCATIONS.map(({ slug }) => ({ location: slug }));
}

type PageProps = { params: Promise<{ location: string }> };
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const location = getBuyerLocation((await params).location);
  if (!location) notFound();
  return buyerLocationMetadata(location, 'uk');
}

export default async function LocationPage({ params }: PageProps) {
  const location = getBuyerLocation((await params).location);
  if (!location) notFound();
  return <BuyerLocationPage location={location} market="uk" />;
}
