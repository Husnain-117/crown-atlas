import { CONTACT } from "@/lib/constants/contact";
import { SITE_LOGO_URL, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/constants/site";

export const SITE_SCHEMA_IDS = {
  organization: `${SITE_URL}#organization`,
  localBusiness: `${SITE_URL}#localbusiness`,
  agent: `${SITE_URL}#agent`,
  website: `${SITE_URL}#website`,
  navigation: `${SITE_URL}#navigation`,
} as const;

const address = {
  "@type": "PostalAddress",
  streetAddress: CONTACT.business.fullAddress.street,
  addressLocality: CONTACT.business.fullAddress.city,
  addressRegion: CONTACT.business.fullAddress.state,
  postalCode: CONTACT.business.fullAddress.zip,
  addressCountry: "US",
};

const organizationSameAs = [
  "https://www.instagram.com/crown.coastal/",
  "https://www.linkedin.com/company/crown-coastal-homes/",
];

const agentSameAs = [
  "https://www.zillow.com/profile/RezaSoCal",
  "https://www.homes.com/real-estate-agents/reza-barghlameno/wkjt4yj/",
];

const phoneE164 = CONTACT.phone.href.replace(/^tel:/, "");

export function getCoreSiteGraph() {
  return [
    {
      "@type": "Organization",
      "@id": SITE_SCHEMA_IDS.organization,
      name: SITE_NAME,
      url: SITE_URL,
      logo: SITE_LOGO_URL,
      image: SITE_LOGO_URL,
      description:
        "California real estate platform specializing in luxury coastal properties, buyer representation, listing guidance, and local market research.",
      address,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: phoneE164,
        contactType: "sales",
        areaServed: "US-CA",
        availableLanguage: "English",
      },
      sameAs: organizationSameAs,
    },
    {
      "@type": "RealEstateAgent",
      "@id": SITE_SCHEMA_IDS.localBusiness,
      name: SITE_NAME,
      image: absoluteUrl("/coursel.png"),
      url: SITE_URL,
      telephone: phoneE164,
      email: CONTACT.email.display,
      address,
      parentOrganization: {
        "@id": SITE_SCHEMA_IDS.organization,
      },
      employee: {
        "@id": SITE_SCHEMA_IDS.agent,
      },
      areaServed: [
        { "@type": "State", name: "California" },
        { "@type": "City", name: "San Diego", containedInPlace: { "@type": "State", name: "California" } },
        { "@type": "City", name: "Los Angeles", containedInPlace: { "@type": "State", name: "California" } },
        { "@type": "City", name: "Irvine", containedInPlace: { "@type": "State", name: "California" } },
        { "@type": "City", name: "Coronado", containedInPlace: { "@type": "State", name: "California" } },
      ],
      sameAs: organizationSameAs,
    },
    {
      "@type": "Person",
      "@id": SITE_SCHEMA_IDS.agent,
      name: CONTACT.agent.name,
      jobTitle: CONTACT.agent.title,
      description:
        "Licensed California real estate agent specializing in buyer representation, seller guidance, HOA document review, comparable sales research, and coastal California homes.",
      url: absoluteUrl("/team/reza-barghlameno"),
      telephone: phoneE164,
      email: CONTACT.email.display,
      image: absoluteUrl(CONTACT.agent.avatarUrl),
      address,
      worksFor: {
        "@id": SITE_SCHEMA_IDS.localBusiness,
      },
      identifier: {
        "@type": "PropertyValue",
        name: "California DRE License",
        value: CONTACT.agent.dre,
      },
      knowsAbout: [
        "California residential real estate",
        "Coastal luxury homes",
        "HOA document analysis",
        "Comparable sales research",
        "Buyer representation",
        "Seller representation",
      ],
      sameAs: agentSameAs,
    },
    {
      "@type": "WebSite",
      "@id": SITE_SCHEMA_IDS.website,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: {
        "@id": SITE_SCHEMA_IDS.organization,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/properties?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "ItemList",
      "@id": SITE_SCHEMA_IDS.navigation,
      name: "Main Navigation",
      itemListElement: [
        { "@type": "SiteNavigationElement", position: 1, name: "Buy", url: absoluteUrl("/buy/houses") },
        { "@type": "SiteNavigationElement", position: 2, name: "Rent", url: absoluteUrl("/rent") },
        { "@type": "SiteNavigationElement", position: 3, name: "Sell", url: absoluteUrl("/sell") },
        { "@type": "SiteNavigationElement", position: 4, name: "Properties", url: absoluteUrl("/properties") },
        { "@type": "SiteNavigationElement", position: 5, name: "Services", url: absoluteUrl("/services") },
        { "@type": "SiteNavigationElement", position: 6, name: "Blog", url: absoluteUrl("/blogs") },
        { "@type": "SiteNavigationElement", position: 7, name: "About", url: absoluteUrl("/about") },
        { "@type": "SiteNavigationElement", position: 8, name: "Contact", url: absoluteUrl("/contact") },
      ],
    },
  ];
}

export function getCoreSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": getCoreSiteGraph(),
  };
}
