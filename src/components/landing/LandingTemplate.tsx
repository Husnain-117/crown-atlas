// src/app/(landing)/landing-page.tsx
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LandingData, LandingPropertyCard } from "@/types/landing";
import Hero from "./sections/Hero";
import Intro from "./sections/Intro";
import StatsSection from "./sections/Stats";
import PropertyCard from "../property-card-client";
import FAQSection from "./sections/FAQ";
import RelatedLinksSection from "./sections/RelatedLinks";
import CitySchema from "@/components/seo/CitySchema";
import RelatedVariants from "./sections/RelatedVariants";
import RelatedCitiesSection from "./sections/RelatedCities";
import Link from "next/link";
import { cityToTitle } from "@/lib/seo/cities";
import { PRIORITY_CITY_SLUGS } from "@/lib/seo/priority-locations";
import { resolveCanonicalCityLocation } from "@/lib/seo/location-canonical";
import { safeHtml } from "@/lib/utils/sanitize-html";
import { bodyHasH2 } from "@/lib/landing/parseSections";
import LocalMarketEditorial from "./LocalMarketEditorial";

const MapSection = dynamic<{ city: string; properties: LandingPropertyCard[] }>(() => import("./sections/Map"), {
  loading: () => (
    <div className="rounded-lg border bg-muted/40 h-64 w-full animate-pulse" />
  ),
});

type SimpleFAQ = { question: string; answer: string };
interface Props {
  data: LandingData;
  faqItems?: SimpleFAQ[];
}

// NOTE: stripDuplicateHeading is now imported from sanitize-html.ts
// All HTML rendering uses safeHtml() which sanitizes AND strips duplicate headings

// Helper component to render a section with heading and body
function ContentSection({
  section,
  className,
}: {
  section?: { heading?: string; body?: string; cards?: any[]; cta?: any };
  className?: string;
}) {
  if (!section || (!section.heading && !section.body)) return null;

  const hasInternalH2 = bodyHasH2(section.body);
  return (
    <section className={`${className || ""} space-y-4`}>
      {!hasInternalH2 && section.heading && (
        <h2 className="text-2xl sm:text-3xl font-bold mb-5 bg-gradient-to-r from-[#FFD36A] via-[#FCBA03] to-[#C98A00] text-transparent bg-clip-text">
          {section.heading}
        </h2>
      )}
      {/* 
<div
  dangerouslySetInnerHTML={{
    __html: safeHtml(section.body),
  }}
/> */}

      {section.body && (
        <div
          className="prose prose-lg dark:prose-invert max-w-none
                     text-gray-600 dark:text-gray-400
                     [&_h2]:!text-[#fcba03] [&_h3]:!text-[#fcba03]
                     [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-bold [&_h2]:mb-5 [&_h2]:mt-0
                     prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:font-bold prose-h2:mb-5 prose-h2:mt-0
                     prose-h3:font-semibold
                     prose-p:text-[1.15rem] prose-p:leading-[1.8] prose-p:mb-5 prose-p:text-gray-600 dark:prose-p:text-gray-400
                     prose-ul:my-5 prose-ul:pl-6 prose-ul:list-disc prose-ul:space-y-2
                     prose-ol:my-5 prose-ol:pl-6 prose-ol:list-decimal prose-ol:space-y-2
                     prose-li:text-[1.1rem] prose-li:leading-[1.7] prose-li:text-gray-600 dark:prose-li:text-gray-400
                     prose-li:marker:text-brand-midnightCove prose-li:pl-2
                     prose-strong:text-gray-700 dark:prose-strong:text-gray-300
                     [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul]:space-y-2
                     [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol]:space-y-2
                     [&_li]:relative [&_li]:pl-2
                     [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-gray-300 [&_table]:dark:border-gray-600 [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:my-6
                     [&_thead]:bg-brand-midnightCove/10 [&_thead]:dark:bg-brand-midnightCove/20
                     [&_th]:border [&_th]:border-gray-300 [&_th]:dark:border-gray-600 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-bold [&_thead>tr>th]:!text-[#fcba03] [&_th]:text-sm [&_th]:uppercase [&_th]:tracking-wide
                     [&_td]:border [&_td]:border-gray-300 [&_td]:dark:border-gray-600 [&_td]:px-4 [&_td]:py-3 [&_td]:text-gray-600 [&_td]:dark:text-gray-400
                     [&_tr]:even:bg-gray-50 [&_tr]:dark:even:bg-gray-800/50
                     [&_tbody_tr]:hover:bg-gray-100 [&_tbody_tr]:dark:hover:bg-gray-700/50 [&_tbody_tr]:transition-colors"
          dangerouslySetInnerHTML={{
            __html: safeHtml(section.body, section.heading),
          }}
        />
      )}
    </section>
  );
}

// Helper component to render neighborhood cards
function NeighborhoodCards({
  section,
}: {
  section?: { heading?: string; body?: string; cards?: any[] };
}) {
  if (!section?.cards?.length) return null;

  const hasInternalH2 = bodyHasH2(section.body);

  return (
    <section className="space-y-5">
      {!hasInternalH2 && section.heading && (
        <h2 className="text-2xl sm:text-3xl font-bold mb-5 bg-gradient-to-r from-[#FFD36A] via-[#FCBA03] to-[#C98A00] text-transparent bg-clip-text">
          {section.heading}
        </h2>
      )}

      {section.body && (
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-8
                     text-gray-600 dark:text-gray-400
                     [&_h2]:!text-[#fcba03] [&_h3]:!text-[#fcba03]
                     [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-bold [&_h2]:mb-5 [&_h2]:mt-0
                     prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:font-bold prose-h2:mb-5 prose-h2:mt-0
                     prose-h3:font-semibold
                     prose-p:text-[1.15rem] prose-p:leading-[1.8] prose-p:mb-5 prose-p:text-gray-600 dark:prose-p:text-gray-400
                     prose-ul:my-5 prose-ul:pl-6 prose-ul:list-disc prose-ul:space-y-2
                     prose-li:text-[1.1rem] prose-li:leading-[1.7] prose-li:text-gray-600 dark:prose-li:text-gray-400
                     [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-gray-300 [&_table]:dark:border-gray-600 [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:my-6
                     [&_thead]:bg-brand-midnightCove/10 [&_thead]:dark:bg-brand-midnightCove/20
                     [&_th]:border [&_th]:border-gray-300 [&_th]:dark:border-gray-600 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-bold [&_thead>tr>th]:!text-[#fcba03] [&_th]:text-sm [&_th]:uppercase [&_th]:tracking-wide
                     [&_td]:border [&_td]:border-gray-300 [&_td]:dark:border-gray-600 [&_td]:px-4 [&_td]:py-3 [&_td]:text-gray-600 [&_td]:dark:text-gray-400
                     [&_tr]:even:bg-gray-50 [&_tr]:dark:even:bg-gray-800/50
                     [&_tbody_tr]:hover:bg-gray-100 [&_tbody_tr]:dark:hover:bg-gray-700/50 [&_tbody_tr]:transition-colors"
          dangerouslySetInnerHTML={{
            __html: safeHtml(section.body, section.heading),
          }}
        />
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {section.cards.map((card, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            {card.name && (
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#fcba03' }}>
                {card.name}
              </h3>
            )}
            {card.blurb && (
              <p className="text-[1.05rem] leading-relaxed text-gray-500 dark:text-gray-400 mb-4">
                {card.blurb}
              </p>
            )}
            {card.best_for?.length > 0 && (
              <p className="text-[1.05rem] text-gray-500 dark:text-gray-400 mb-4">
                <strong className="text-gray-600 dark:text-gray-300">
                  Best for:
                </strong>{" "}
                {card.best_for.join(", ")}
              </p>
            )}
            {card.internal_link_href && card.internal_link_text && (
              <Link
                href={card.internal_link_href}
                className="text-sm text-brand-midnightCove hover:underline font-medium"
              >
                {card.internal_link_text} →
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// Helper component to render buyer strategy with CTA
function BuyerStrategySection({
  section,
}: {
  section?: { heading?: string; body?: string; cta?: any };
}) {
  if (!section) return null;

  const hasInternalH2 = bodyHasH2(section.body);

  return (
    <section className="space-y-5">
      {!hasInternalH2 && section.heading && (
        <h2 className="text-2xl sm:text-3xl font-bold mb-5 bg-gradient-to-r from-[#FFD36A] via-[#FCBA03] to-[#C98A00] text-transparent bg-clip-text">
          {section.heading}
        </h2>
      )}

      {section.body && (
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-8
                     text-gray-600 dark:text-gray-400
                     [&_h2]:!text-[#fcba03] [&_h3]:!text-[#fcba03]
                     [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-bold [&_h2]:mb-5 [&_h2]:mt-0
                     prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:font-bold prose-h2:mb-5 prose-h2:mt-0
                     prose-h3:font-semibold
                     prose-p:text-[1.15rem] prose-p:leading-[1.8] prose-p:mb-5 prose-p:text-gray-600 dark:prose-p:text-gray-400
                     prose-ul:my-5 prose-ul:pl-6 prose-ul:list-disc prose-ul:space-y-2
                     prose-ol:my-5 prose-ol:pl-6 prose-ol:list-decimal prose-ol:space-y-2
                     prose-li:text-[1.1rem] prose-li:leading-[1.7] prose-li:text-gray-600 dark:prose-li:text-gray-400
                     prose-li:marker:text-brand-midnightCove prose-li:pl-2
                     [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul]:space-y-2
                     [&_li]:relative [&_li]:pl-2
                     [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-gray-300 [&_table]:dark:border-gray-600 [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:my-6
                     [&_thead]:bg-brand-midnightCove/10 [&_thead]:dark:bg-brand-midnightCove/20
                     [&_th]:border [&_th]:border-gray-300 [&_th]:dark:border-gray-600 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-bold [&_thead>tr>th]:!text-[#fcba03] [&_th]:text-sm [&_th]:uppercase [&_th]:tracking-wide
                     [&_td]:border [&_td]:border-gray-300 [&_td]:dark:border-gray-600 [&_td]:px-4 [&_td]:py-3 [&_td]:text-gray-600 [&_td]:dark:text-gray-400
                     [&_tr]:even:bg-gray-50 [&_tr]:dark:even:bg-gray-800/50
                     [&_tbody_tr]:hover:bg-gray-100 [&_tbody_tr]:dark:hover:bg-gray-700/50 [&_tbody_tr]:transition-colors"
          dangerouslySetInnerHTML={{
            __html: safeHtml(section.body, section.heading),
          }}
        />
      )}

      {section.cta && (
        <div className="bg-brand-midnightCove/5 rounded-xl p-8 border border-brand-midnightCove/20">
          {section.cta.title && (
            <h3 className="text-xl font-semibold mb-3" style={{ color: '#fcba03' }}>
              {section.cta.title}
            </h3>
          )}
          {section.cta.body && (
            <p className="text-[1.1rem] leading-relaxed text-gray-600 dark:text-gray-400 mb-5">
              {section.cta.body}
            </p>
          )}
          {section.cta.button_href && section.cta.button_text && (
            <Link
              href={section.cta.button_href}
              className="inline-flex items-center px-6 py-3 bg-brand-midnightCove text-white rounded-lg font-medium hover:bg-brand-midnightCove/90 transition-colors"
            >
              {section.cta.button_text}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

function formatLandingKind(kind: string): string {
  return kind
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatCurrency(value?: number): string | null {
  if (!value || value <= 0) return null;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function QuickAnswers({ data }: { data: LandingData }) {
  const city = data.city;
  const kindLabel = formatLandingKind(data.kind);
  const activeCount = data.stats?.totalActive;
  const medianPrice = formatCurrency(data.stats?.medianPrice);
  const pricePerSqft = data.stats?.pricePerSqft
    ? `$${Math.round(data.stats.pricePerSqft).toLocaleString("en-US")} per sq ft`
    : null;
  const daysOnMarket = data.stats?.daysOnMarket;

  const answers = [
    {
      question: `What is this ${city} page about?`,
      answer: `This page tracks ${kindLabel.toLowerCase()} in ${city}, California, with local listings, market context, related property types, and expert buyer guidance from Crown Coastal Homes.`,
    },
    {
      question: `How active is the ${city} market?`,
      answer: activeCount
        ? `${city} currently shows ${activeCount.toLocaleString("en-US")} relevant active listing${activeCount === 1 ? "" : "s"} in this search set. Availability can change daily as MLS data updates.`
        : `${city} inventory changes frequently. Use the featured listings and related city links on this page for the most relevant current search paths.`,
    },
    {
      question: `What should buyers compare first?`,
      answer: `Start with neighborhood fit, total monthly cost, HOA rules where applicable, property condition, insurance exposure, commute needs, and recent comparable sales in ${city}.`,
    },
    {
      question: `What are the key price signals?`,
      answer: [medianPrice ? `Median price: ${medianPrice}.` : null, pricePerSqft ? `Price per square foot: ${pricePerSqft}.` : null, daysOnMarket ? `Typical days on market: ${daysOnMarket}.` : null]
        .filter(Boolean)
        .join(" ") || `Price signals vary by neighborhood, condition, views, lot size, and property type in ${city}.`,
    },
  ];

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-[var(--coastal-text)] sm:text-2xl">
        Quick Answers for {city} {kindLabel}
      </h2>
      <div className="grid border-y border-[var(--coastal-border)] md:grid-cols-2">
        {answers.map((item) => (
          <article key={item.question} className="border-b border-[var(--coastal-border)] py-5 last:border-b-0 md:px-5 md:first:border-r md:[&:nth-child(3)]:border-r">
            <h3 className="text-base font-semibold text-[var(--coastal-text)] mb-2">
              {item.question}
            </h3>
            <p className="text-sm leading-6 text-[var(--coastal-muted-text)]">
              {item.answer}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FeaturedListings({ city, featured }: { city: string; featured: LandingPropertyCard[] }) {
  return (
    <section className="pt-2">
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <h2 className="text-xl font-bold text-[var(--coastal-text)] sm:text-2xl">
          Featured Listings
        </h2>
        {!!featured.length && (
          <Link
            href={`/properties?search=${encodeURIComponent(city)}`}
            className="text-sm font-semibold text-[var(--coastal-link)] underline underline-offset-4"
          >
            View all
          </Link>
        )}
      </div>
      {!featured.length && (
        <div className="rounded-lg border border-[var(--coastal-border)] bg-[var(--surface-muted)] p-6 text-sm text-[var(--coastal-muted-text)]">
          No active listings currently match this exact search. Inventory changes frequently; you can review all active homes in {city}.
          <Link href={`/properties?search=${encodeURIComponent(city)}`} className="ml-1 font-semibold text-[var(--coastal-link)] underline underline-offset-4">
            View all {city} listings
          </Link>
        </div>
      )}
      {!!featured.length && (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {featured.slice(0, 4).map((property) => {
            const adapted: any = {
              _id: property.listingKey,
              id: property.listingKey,
              listing_key: property.listingKey,
              property_entity_key: property.entityKey,
              property_type: property.propertyType || "Residential",
              property_sub_type: property.propertySubType || "",
              property_category: property.propertySubType || "",
              list_price: property.price || 0,
              address: property.address || property.title || `${property.city}${property.state ? `, ${property.state}` : ""}`,
              city: property.city,
              county: property.state || "",
              state: property.state || "CA",
              postal_code: property.postalCode || "",
              bedrooms: property.beds ?? null,
              bathrooms: property.baths ?? null,
              living_area_sqft: property.sqft ?? null,
              lot_size_sqft: property.lotSizeSqft ?? null,
              year_built: property.yearBuilt,
              hoa_fee: property.hoaFee ?? null,
              hoa_fee_frequency: property.hoaFeeFrequency ?? null,
              days_on_market: property.daysOnMarket,
              photosCount: property.photosCount || (property.img ? 1 : 0),
              listing_photos: property.img ? [property.img] : [],
              images: property.img ? [property.img] : [],
              main_photo_url: property.img || null,
              status: property.status || "Active",
            };
            return <PropertyCard key={property.listingKey} property={adapted} />;
          })}
        </div>
      )}
    </section>
  );
}

export default function LandingTemplate({ data, faqItems }: Props) {
  const { city, kind, dbContent } = data;
  // Filter out any Land properties (safety check - should already be filtered from DB)
  const featured = (data.featured || []).filter(
    (f: any) =>
      !f.propertyType?.toLowerCase().includes("land") &&
      !f.property_type?.toLowerCase().includes("land") &&
      !f.status?.toLowerCase().includes("land")
  );
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");

  // Extract content from DB
  const introContent = dbContent?.intro;
  const trustContent = dbContent?.trust;
  const sections = dbContent?.sections;

  return (
    <div className="flex flex-col pb-24">
      {city && (
        <CitySchema
          city={city}
          canonical={`/california/${citySlug}/${kind}`}
          featured={(featured || []).map((f) => ({
            id: f.listingKey,
            url: (f as any).url || undefined,
          }))}
          variant={kind}
          faqItems={faqItems}
          dateModified={data.stats?.lastUpdated}
        />
      )}

      <Hero city={city} kind={kind} image={data.heroImage} />

      {/* Main constrained container */}
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10 pt-8 sm:gap-12 sm:pt-10">
        <StatsSection stats={data.stats} />

        <section
          aria-label="Data source and review"
          className="flex flex-col gap-2 border-y border-[var(--coastal-border)] py-4 text-sm text-[var(--coastal-muted-text)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5"
        >
          <span>Source: CRMLS active listing data</span>
          <span>
            {data.stats?.lastUpdated
              ? `Updated ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(data.stats.lastUpdated))}`
              : "Current refresh time unavailable"}
          </span>
          <span>
            Reviewed by{" "}
            <Link href="/team/reza-barghlameno" className="font-semibold text-[var(--coastal-link)] underline underline-offset-4">
              Reza Barghlameno, DRE #02211952
            </Link>
          </span>
          <Link href="/about/data-methodology" className="font-semibold text-[var(--coastal-link)] underline underline-offset-4">
            Data methodology and limitations
          </Link>
        </section>

        <FeaturedListings city={city} featured={featured} />

        <QuickAnswers data={data} />

        <LocalMarketEditorial data={data} />

        {/* Intro from DB content - show quick bullets if available */}
        {introContent && (
          <section className="prose dark:prose-invert max-w-none space-y-4">
            {introContent.subheadline && (
              <p className="text-[1.2rem] leading-relaxed text-gray-500 dark:text-gray-400 italic mb-5">
                {introContent.subheadline}
              </p>
            )}
            {introContent.quick_bullets &&
              introContent.quick_bullets.length > 0 && (
                <ul className="grid gap-4 sm:grid-cols-2 list-none pl-0">
                  {introContent.quick_bullets.map((bullet, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[1.1rem] leading-relaxed text-gray-600 dark:text-gray-400"
                    >
                      <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-brand-midnightCove/10 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-brand-midnightCove"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
          </section>
        )}

        {/* Fallback intro if no DB content */}
        {!introContent && <Intro html={data.introHtml} />}

        {/* === RENDER ALL DB SECTIONS DIRECTLY === */}

        {/* Hero Overview Section */}
        <ContentSection section={sections?.hero_overview} />

        {/* About the Area Section */}
        <ContentSection section={sections?.about_area} />

        {/* Market Snapshot Section */}
        <ContentSection section={sections?.market_snapshot} />

        {/* Price Breakdown Section (REQUIRED - contains table) */}
        <ContentSection
          section={sections?.price_breakdown}
          className="price-breakdown-section"
        />

        {/* Buy vs Rent Intent Clarifier (REQUIRED) */}
        <ContentSection section={sections?.buy_vs_rent} />

        {/* Property Types Section */}
        <ContentSection section={sections?.property_types} />

        {/* Neighborhoods Section with Cards */}
        <NeighborhoodCards section={sections?.neighborhoods} />

        {/* Trust / Agent Box from DB content */}
        {trustContent && (
          <section className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-8 border border-gray-200 dark:border-slate-700">
            {trustContent.agent_box && (
              <div className="mb-5">
                {trustContent.agent_box.headline && (
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#fcba03' }}>
                    {trustContent.agent_box.headline}
                  </h3>
                )}
                {trustContent.agent_box.body && (
                  <p className="text-[1.1rem] leading-relaxed text-gray-600 dark:text-gray-400">
                    {trustContent.agent_box.body}
                  </p>
                )}
                {trustContent.agent_box.disclaimer && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-3 italic">
                    {trustContent.agent_box.disclaimer}
                  </p>
                )}
              </div>
            )}
            {trustContent.about_brand && (
              <p className="text-[1.05rem] leading-relaxed text-gray-500 dark:text-gray-400">
                {trustContent.about_brand}
              </p>
            )}
          </section>
        )}

        {/* Buyer Strategy Section with CTA */}
        <BuyerStrategySection section={sections?.buyer_strategy} />

        {/* Schools/Education Section */}
        <ContentSection section={sections?.schools_education} />

        {/* Lifestyle/Amenities Section */}
        <ContentSection section={sections?.lifestyle_amenities} />

        {/* Working with Agent Section */}
        <ContentSection section={sections?.working_with_agent} />
      </div>

      {/* Map */}
      <div className="w-full mt-6">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="h-64 rounded-xl border bg-muted animate-pulse" />
            }
          >
            <MapSection city={city} properties={featured} />
          </Suspense>
        </div>
      </div>

      {/* Bottom stack */}
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12 mt-12">
        <FAQSection
          items={
            faqItems && faqItems.length
              ? faqItems.map((f) => ({ q: f.question, a: f.answer }))
              : data.faq
          }
        />
        <RelatedLinksSection links={data.related} />
        {/*
         * RelatedCitiesSection — sibling-city links built from the same-county
         * lookup in query.ts.  Provides dense, topically-relevant internal links
         * that distribute PageRank and improve crawl depth for city-level pages.
         * The component renders nothing when relatedCities is empty or undefined.
         */}
        <RelatedCitiesSection cities={data.relatedCities} />
        <RelatedVariants citySlug={citySlug} currentSlug={kind} />

        <section className="mt-4">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#fcba03' }}>
            Related California Cities
          </h3>
          <div className="flex flex-wrap gap-3">
            {PRIORITY_CITY_SLUGS.slice(0, 12).map((c) => {
              const location = resolveCanonicalCityLocation(c)
              if (!location) return null
              return <Link
                key={c}
                href={`/buy/${location.county.slug}/${location.city.slug}`}
                className="rounded-full border px-5 py-3 min-h-[44px] flex items-center text-sm font-medium hover:bg-accent transition-colors active:scale-95"
              >
                {cityToTitle(c)}
              </Link>
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
