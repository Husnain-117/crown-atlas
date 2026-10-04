export type LocationSource = { label: string; href: string };
export type BuyerLocationCopy = {
  intro: string;
  searchFocus: string;
  checks: Array<{ title: string; body: string; source?: LocationSource }>;
  areas: Array<{ name: string; description: string; href: string }>;
  faqs: Array<{ question: string; answer: string; source?: LocationSource }>;
};

export type BuyerLocation = {
  slug: string;
  name: string;
  kind: 'city' | 'county';
  parentSlug?: string;
  searchRegion: 'Los Angeles' | 'Orange County' | 'San Francisco / Bay Area' | 'Santa Barbara';
  searchHref: string;
  image: string;
  imageAlt: string;
  en: BuyerLocationCopy;
  de: BuyerLocationCopy;
};
