import type { Metadata } from 'next';
import { CANADA_CONSULT_REGIONS, type CanadaConsultRegion } from './canada-consult-regions';
import { absoluteUrl } from './constants/site';
import { SITE_SCHEMA_IDS } from './seo/site-schema';
import { CANADA_SERVICE_PATH } from './canada-lander-content';

export const CANADA_LIFESTYLE_IMAGE = '/images/canada/clients-kaushal.webp';
export const CANADA_LIFESTYLE_ALT = 'Reza with the Kaushal family outside a home, smiling and holding sold signs';
export const CANADA_CAMPAIGN_PATHS = [
  '/international-buyers/canada/california-homes',
  ...Object.keys(CANADA_CONSULT_REGIONS).map(region => `/international-buyers/canada/${region}-consult`),
];

export const CANADA_REGIONAL_PLANNING = {
  'san-diego': {
    listingPath: '/buy/san-diego',
    question: 'How should Canadian buyers compare San Diego and North County?',
    answer: 'Choose the places you expect to use each day before narrowing the map. Compare La Jolla and Coronado with Del Mar, Carmel Valley and the North County coast using the same home brief. A beach address, outdoor space and your driving routes can lead to different shortlists.',
    checklist: ['Name the beaches, village streets and daily destinations you want to reach.', 'Compare condo upkeep with the maintenance and outdoor space of a detached home.', 'Group viewings by coastal, inland and North County areas so each visit has a clear purpose.'],
  },
  'los-angeles': {
    listingPath: '/buy/los-angeles',
    question: 'Where should a Canadian buyer start a Los Angeles property search?',
    answer: 'Start with your regular destinations and the address of each home. Santa Monica and Brentwood, Beverly Hills, the South Bay and Malibu make different viewing routes. Compare travel, parking, property condition and upkeep alongside the home itself, then confirm local viewing support before arranging a trip from Canada.',
    checklist: ['List work, family and airport routes before deciding between the Westside and coast.', 'Request current condition, access and insurance information for the specific property.', 'Plan separate viewing windows for the Westside, South Bay or Malibu rather than combining every area in one day.'],
  },
  'orange-county': {
    listingPath: '/buy/orange',
    question: 'How do Canadian buyers compare coastal Orange County with Irvine?',
    answer: 'Use the same priorities to compare Newport Beach, Corona del Mar, Laguna Beach and Dana Point with Irvine. Record beach access, outdoor space, daily routes and the upkeep you want to manage while in Canada. Review association documents and the individual property before relying on a community name.',
    checklist: ['Compare your actual route to the beach and everyday destinations at each address.', 'Request association fees, documents and rules where an association applies.', 'Include parking, outdoor maintenance and a contact for the weeks you are away in your brief.'],
  },
  'santa-barbara': {
    listingPath: '/buy/santa-barbara',
    question: 'What should Canadian buyers compare around Santa Barbara and Montecito?',
    answer: 'Compare Montecito, Hope Ranch, the Mesa and downtown Santa Barbara with Goleta and Carpinteria around how you will use the home. Discuss the specific site, access, maintenance and current insurance information with Reza, then plan the lender introduction and local viewings together.',
    checklist: ['Compare hillside, beach-adjacent and town locations against your everyday plans.', 'Ask for property-specific site, access, condition and insurance information early.', 'Plan who will look after the home between visits and what outdoor maintenance each property needs.'],
  },
} as const;

export function canadaCampaignMetadata(region?: CanadaConsultRegion, env = process.env): Metadata {
  const label = region ? CANADA_CONSULT_REGIONS[region].label : 'California';
  const path = region ? `/international-buyers/canada/${region}-consult` : CANADA_CAMPAIGN_PATHS[0];
  const title = region ? `Buying a home in ${label} from Canada? | Crown Coastal Homes` : 'Buying in California from Canada | Crown Coastal Homes';
  const description = region ? `Buying a home in ${label} from Canada? Compare areas, plan a USD budget and request a 20-minute call with Reza. Time agreed by email.` : 'Compare San Diego, Los Angeles, Orange County and Santa Barbara, then request a 20-minute call with Reza about buying in California from Canada.';
  const index = !(env.VERCEL && env.VERCEL_ENV !== 'production');
  return {
    title, description,
    alternates: { canonical: path },
    robots: { index, follow: index, googleBot: { index, follow: index, 'max-image-preview': 'large', 'max-snippet': -1 } },
    openGraph: { title, description, url: absoluteUrl(path), type: 'website', locale: 'en_CA', images: [{ url: absoluteUrl(CANADA_LIFESTYLE_IMAGE), width: 1024, height: 1024, alt: CANADA_LIFESTYLE_ALT }] },
    twitter: { card: 'summary_large_image', title, description, images: [absoluteUrl(CANADA_LIFESTYLE_IMAGE)] },
  };
}

export function canadaConsultFaqs(region: CanadaConsultRegion) {
  const config = CANADA_CONSULT_REGIONS[region];
  return [
    { question: `How do I choose a real estate agent in ${config.label} from Canada?`, answer: `Verify the California licence and discuss your search with Reza Barghlameno, based in San Diego, California DRE #02211952. ${CANADA_SERVICE_PATH}`, source: { label: 'California DRE: verify a real estate licence', href: 'https://www.dre.ca.gov/Licensees/VerifyLicense.html' } },
    { question: 'Can we start while I am still in Canada?', answer: 'Yes. Send your brief and request a video conversation. Include your time zone and preferred times if you wish. Reza will reply to agree an appointment.' },
    { question: `How do we narrow down ${config.label} neighbourhoods?`, answer: config.localAnswer },
    { question: 'Is the budget in CAD or USD?', answer: 'The form uses US dollars. If you are working in Canadian dollars, choose “Prefer to discuss” and mention your CAD budget in the optional message.' },
    { question: 'What will we cover in the 20-minute consultation?', answer: 'Your intended use, preferred areas, budget and buying timeline. You can ask how to prepare a search from Canada and what representation and viewing arrangements would involve.' },
    { question: 'Who can advise on cross-border financing and tax?', answer: "Discuss financing with a lender and tax, ownership or immigration matters with appropriately qualified advisers. Reza's conversation focuses on the real estate search and purchase process." },
    { question: 'Does submitting the form book a meeting?', answer: 'It sends an enquiry to Crown Coastal Homes for Reza to review. A meeting time is agreed separately. Your contact details are used to respond to this enquiry.' },
  ];
}

export const CANADA_GENERAL_FAQS = [
  { question: 'Can I start while I am still in Canada?', answer: 'Yes. Start by email and request a video conversation. Include your city or time zone and preferred times in the optional form details. Sending an enquiry does not book an appointment.' },
  { question: 'Should I enter my budget in Canadian or US dollars?', answer: 'Budget is in US dollars. A $2.5M home is not $2.5M Canadian. Choose “Prefer to discuss” if you are still planning your budget, and include your CAD budget in the optional message. Allow for exchange rates, transfer fees and closing costs when planning your funds.' },
  { question: 'What about financing, tax and ownership questions?', answer: 'These depend on your circumstances. Discuss financing with a lender and cross-border tax and ownership questions with qualified advisers before committing to a purchase.' },
  { question: 'Who receives my enquiry?', answer: 'Your enquiry goes to Crown Coastal Homes for Reza to review. We use your contact details to respond to your property search.' },
];

export function buildCanadaCampaignSchema(region?: CanadaConsultRegion) {
  const metadata = canadaCampaignMetadata(region);
  const path = region ? `/international-buyers/canada/${region}-consult` : CANADA_CAMPAIGN_PATHS[0];
  const url = absoluteUrl(path);
  const label = region ? CANADA_CONSULT_REGIONS[region].label : 'California';
  const faqs = region ? canadaConsultFaqs(region) : CANADA_GENERAL_FAQS;
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': ['WebPage', 'FAQPage'], '@id': `${url}#webpage`, url, name: metadata.title, description: metadata.description, inLanguage: 'en-CA', isPartOf: { '@id': SITE_SCHEMA_IDS.website }, publisher: { '@id': SITE_SCHEMA_IDS.organization }, about: { '@id': `${url}#service` }, breadcrumb: { '@id': `${url}#breadcrumb` }, primaryImageOfPage: { '@type': 'ImageObject', url: absoluteUrl(CANADA_LIFESTYLE_IMAGE), caption: 'Reza with clients, the Kaushal family', width: 1024, height: 1024 }, mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) },
    { '@type': 'Service', '@id': `${url}#service`, name: `${label} home-search planning for Canadian buyers`, serviceType: 'Home-buying consultation', provider: { '@id': SITE_SCHEMA_IDS.localBusiness }, areaServed: { '@type': 'Place', name: `${label}, ${region ? 'California, ' : ''}United States` }, audience: { '@type': 'Audience', audienceType: 'Canadian home buyers' }, url },
    { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }, { '@type': 'ListItem', position: 2, name: 'Buying from Canada', item: absoluteUrl('/international-buyers/canada') }, { '@type': 'ListItem', position: 3, name: region ? label : 'California home search', item: url }] },
  ] };
}
