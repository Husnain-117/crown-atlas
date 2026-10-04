export const CANADA_LANDER_CTA = 'Plan my purchase with Reza';
export const CANADA_LANDER_SUCCESS = 'Reza reads this before he replies. If it is a fit, you get a time by email. If not, a short no.';
export const CANADA_USD_NOTE = 'Budget is in US dollars. A $2.5M home is not $2.5M Canadian.';
export const CANADA_SERVICE_PATH = 'Reza covers coastal San Diego through Los Angeles, including airport meets. Farther out, he introduces a lender to pre-qualify the mortgage, then a local agent. You still start with him.';
export const CANADA_LANDER_IDENTITY = 'Reza Barghlalmeno · Crown Coastal Homes · eXp of California · CA DRE #02211952';
// Agent-supplied proof line from CCH-CANADA-LANDERS-TODAY.md; not a Canadian testimonial.
export const CANADA_LANDER_PROOF = 'Reza Barghlalmeno · 18 years negotiation · $12M closed · English, Farsi, Arabic, Turkish · San Diego through Los Angeles';
export const CANADA_LANDER_PATHS = ['/international-buyers/canada/california-homes', ...['san-diego', 'los-angeles', 'orange-county', 'santa-barbara'].map(city => `/international-buyers/canada/${city}-consult`)];
export function isCanadaLanderPath(path: string) { return CANADA_LANDER_PATHS.includes(path); }

