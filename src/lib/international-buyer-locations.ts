import { WEST_BUYER_LOCATIONS } from './international-buyer-locations-west';
import { NORTH_ORANGE_BUYER_LOCATIONS } from './international-buyer-locations-north-orange';
import type { BuyerLocation } from './international-buyer-location-types';

const locations = [...WEST_BUYER_LOCATIONS, ...NORTH_ORANGE_BUYER_LOCATIONS];
const order = ['los-angeles', 'san-francisco', 'orange-county', 'beverly-hills', 'malibu', 'santa-monica', 'long-beach', 'newport-beach', 'laguna-beach', 'irvine', 'san-jose', 'santa-barbara'];
export const BUYER_LOCATIONS: BuyerLocation[] = order.map(slug => {
  const location = locations.find(item => item.slug === slug);
  if (!location) throw new Error(`Missing buyer location: ${slug}`);
  return location;
});

export function getBuyerLocation(slug: string): BuyerLocation | undefined {
  return BUYER_LOCATIONS.find(location => location.slug === slug);
}

export function relatedBuyerLocations(location: BuyerLocation): BuyerLocation[] {
  return BUYER_LOCATIONS.filter(other => other.slug !== location.slug && other.searchRegion === location.searchRegion).slice(0, 4);
}
