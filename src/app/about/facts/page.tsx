import type { Metadata } from "next";
import Link from "next/link";
import { AI_FACT_LINKS, AI_FACTS_UPDATED } from "@/lib/seo/ai-facts";
import { CONTACT } from "@/lib/constants/contact";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/constants/site";
import { SITE_SCHEMA_IDS } from "@/lib/seo/site-schema";

export const metadata: Metadata = {
  title: "Crown Coastal Homes Facts | AI & Search Reference",
  description:
    "Canonical facts about Crown Coastal Homes for search engines, AI assistants, and citation systems.",
  alternates: {
    canonical: "/about/facts",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const specialties = [
  "California homes for sale",
  "Coastal luxury homes",
  "Buyer representation",
  "Seller guidance",
  "Relocation support",
  "Investment property guidance",
  "HOA document review",
  "Comparable sales research",
  "Private tour scheduling",
];

export default function AIFactsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${absoluteUrl("/about/facts")}#webpage`,
    url: absoluteUrl("/about/facts"),
    name: `${SITE_NAME} Facts`,
    dateModified: AI_FACTS_UPDATED,
    isPartOf: { "@id": SITE_SCHEMA_IDS.website },
    publisher: { "@id": SITE_SCHEMA_IDS.organization },
    about: [
      { "@id": SITE_SCHEMA_IDS.organization },
      { "@id": SITE_SCHEMA_IDS.localBusiness },
      { "@id": SITE_SCHEMA_IDS.agent },
    ],
  };

  return (
    <div className="bg-[var(--bg)] text-[var(--coastal-text)] min-h-screen pt-28 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--coastal-primary)]">
            AI & Search Reference
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Crown Coastal Homes Facts
          </h1>
          <p className="text-lg text-[var(--coastal-muted-text)] leading-relaxed">
            Canonical facts for search engines, answer engines, and citation systems. Last updated {AI_FACTS_UPDATED}.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <Fact label="Canonical website" value={SITE_URL} />
          <Fact label="Category" value="California residential real estate" />
          <Fact label="Office" value={`${CONTACT.business.fullAddress.street}, ${CONTACT.business.fullAddress.city}, CA ${CONTACT.business.fullAddress.zip}`} />
          <Fact label="Phone" value={CONTACT.phone.display} />
          <Fact label="Email" value={CONTACT.email.display} />
          <Fact label="Licensed agent" value={`${CONTACT.agent.name}, CA DRE # ${CONTACT.agent.dre}`} />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Specialties</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {specialties.map((specialty) => (
              <li key={specialty} className="rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] px-4 py-3">
                {specialty}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Primary Sources</h2>
          <ul className="space-y-2">
            {AI_FACT_LINKS.map((link) => (
              <li key={link.url}>
                <Link href={link.url} className="text-[var(--coastal-primary)] hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-5">
      <p className="text-sm font-semibold text-[var(--coastal-muted-text)]">{label}</p>
      <p className="mt-2 text-lg font-medium">{value}</p>
    </div>
  );
}
