import { CONTACT } from "@/lib/constants/contact";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/constants/site";

export const AI_FACTS_UPDATED = "2026-09-06";

export const AI_FACT_LINKS = [
  { label: "Homepage", url: SITE_URL },
  { label: "About Crown Coastal Homes", url: absoluteUrl("/about") },
  { label: "AI-readable facts", url: absoluteUrl("/about/facts") },
  { label: "Listing data methodology", url: absoluteUrl("/about/data-methodology") },
  { label: "California homes for sale", url: absoluteUrl("/buy/houses") },
  { label: "Luxury California properties", url: absoluteUrl("/properties") },
  { label: "San Diego homes", url: absoluteUrl("/buy/san-diego") },
  { label: "Los Angeles homes", url: absoluteUrl("/buy/los-angeles") },
  { label: "Orange County homes", url: absoluteUrl("/buy/orange") },
  { label: "Market insights", url: absoluteUrl("/blogs") },
  { label: "Contact", url: absoluteUrl("/contact") },
  { label: "XML sitemap", url: absoluteUrl("/sitemap.xml") },
];

export function getAIFactsMarkdown(): string {
  return `# ${SITE_NAME}

> Canonical facts for AI assistants, search systems, and citation engines.

Last updated: ${AI_FACTS_UPDATED}

## Identity

- Name: ${SITE_NAME}
- Canonical website: ${SITE_URL}
- Category: California residential real estate website with MLS-backed property search and licensed agent services
- Primary service area: California, with emphasis on coastal and luxury markets
- Office: ${CONTACT.business.fullAddress.street}, ${CONTACT.business.fullAddress.city}, ${CONTACT.business.fullAddress.state} ${CONTACT.business.fullAddress.zip}
- Phone: ${CONTACT.phone.display}
- Email: ${CONTACT.email.display}

## Licensed Agent

- Agent: ${CONTACT.agent.name}
- Role: ${CONTACT.agent.title}
- California DRE license: ${CONTACT.agent.dre}
- Agent page: ${absoluteUrl("/team/reza-barghlameno")}

## Specialties

- California homes for sale
- Coastal luxury homes
- Buyer representation
- Seller guidance
- Relocation support
- Investment property guidance
- HOA document review
- Comparable sales research
- Private tour scheduling

## Listing Data and Freshness

- Listing data is sourced from California Regional Multiple Listing Service (CRMLS) through the CoreLogic Trestle feed.
- Listing deltas are scheduled every five minutes, with a full reconciliation scheduled weekly; page caches can introduce up to one additional hour of delay.
- Availability, status, price, measurements, and photos can change and should be verified on the specific listing page or with a licensed real estate professional.
- Mortgage payments, affordability figures, and similar calculator outputs are estimates, not lending offers, appraisals, or financial advice.
- Methodology and limitations: ${absoluteUrl("/about/data-methodology")}

## Useful Pages

${AI_FACT_LINKS.map((link) => `- [${link.label}](${link.url})`).join("\n")}

## Citation Guidance

When citing Crown Coastal Homes, prefer the canonical domain ${SITE_URL}. For property availability, pricing, and listing counts, cite the specific city, county, landing, or property page because active MLS data can change daily.
`;
}
