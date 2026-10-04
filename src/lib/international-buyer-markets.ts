import { absoluteUrl } from './constants/site';

export const BUYER_MARKETS = {
  uk: { language: 'en-GB', label: 'Buying from the UK', switchLabel: 'UK · English', path: '/international-buyers/uk' },
  germany: { language: 'de-DE', label: 'Hauskauf aus Deutschland', switchLabel: 'Deutschland · Deutsch', path: '/international-buyers/germany' },
  canada: { language: 'en-CA', label: 'Buying from Canada', switchLabel: 'Canada · English', path: '/international-buyers/canada' },
} as const;

/** Equivalent country entry points, with reciprocal language/region references. */
export function buyerFunnelLanguages(regional: boolean | string = false) {
  const suffix = typeof regional === 'string' ? `/${regional}` : regional ? '/san-diego' : '';
  return Object.fromEntries(Object.values(BUYER_MARKETS).map(market => [market.language, absoluteUrl(market.path + suffix)]));
}
