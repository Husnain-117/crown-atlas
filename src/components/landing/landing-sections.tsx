/**
 * Landing Page Components for SEO Landing Pages
 * These components render the structured content from the AI-generated JSON
 */

import React from "react";
import Link from "next/link";
import { MapPin, Home, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeContentHtml } from "@/lib/sanitize-content-html";

// ========== Market Snapshot Component ==========
export interface MarketSnapshotProps {
  heading: string;
  body: string;
  stats: Array<{
    label: string;
    value: string;
  }>;
  className?: string;
  dataSource?: string;
  lastUpdated?: string;
  dateRange?: string;
}

export function MarketSnapshot({
  heading,
  body,
  stats,
  className,
  dataSource,
  lastUpdated,
  dateRange,
}: MarketSnapshotProps & { dataSource?: string; lastUpdated?: string; dateRange?: string }) {
  const visibleStats = stats.filter((stat) => {
    if (!stat?.value) return false;
    const numericValue = Number(String(stat.value).replace(/[^0-9.-]/g, ""));
    if (!Number.isNaN(numericValue) && numericValue === 0) return false;
    return true;
  });

  const gridColsClass =
    visibleStats.length === 1
      ? "grid-cols-1"
      : visibleStats.length === 2
        ? "sm:grid-cols-2"
        : visibleStats.length === 3
          ? "sm:grid-cols-2 md:grid-cols-3"
          : "sm:grid-cols-2 md:grid-cols-4";

  // Methodology explanations
  const methodologyMap: Record<string, string> = {
    "Median Price": "Median price represents the middle value when all listing prices are sorted. Half of listings are priced above this value, and half are below. This metric is less affected by extremely high or low outliers than average price.",
    "$ / Sqft": "Price per square foot is calculated by dividing the listing price by the property's living area. This metric helps compare properties of different sizes and is useful for evaluating value across neighborhoods.",
    "Days on Market": "Days on market (DOM) measures how long a property has been listed as active. Lower DOM typically indicates a faster-moving market, while higher DOM may suggest overpricing or market slowdown.",
    "Active Listings": "Active listings represent the current inventory of properties available for sale. This count reflects the number of homes on the market at the time of data collection and can indicate market supply levels."
  };

  return (
    <section
      id="market-snapshot"
      className={cn("py-12 px-6 bg-neutral-50 dark:bg-slate-900 rounded-3xl", className)}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          {heading}
        </h2>

        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-8 text-neutral-700 dark:text-neutral-300"
          dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(body) }}
        />

        {/* Data Source & Date Info */}
        {(dataSource || lastUpdated || dateRange) && (
          <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-neutral-200 dark:border-slate-700">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
              {dataSource && (
                <div>
                  <strong className="text-neutral-900 dark:text-neutral-100">Data source:</strong> {dataSource}
                </div>
              )}
              {dateRange && (
                <div>
                  <strong className="text-neutral-900 dark:text-neutral-100">Date range:</strong> {dateRange}
                </div>
              )}
              {lastUpdated && (
                <div>
                  <strong className="text-neutral-900 dark:text-neutral-100">Last updated:</strong> {lastUpdated}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className={`grid gap-6 ${gridColsClass} mb-8`}>
          {visibleStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 font-medium mb-2">
                {stat.label}
              </div>
              {methodologyMap[stat.label] && (
                <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-2 pt-2 border-t border-neutral-200 dark:border-slate-700">
                  {methodologyMap[stat.label]}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Methodology Note */}
        <div className="text-xs text-neutral-500 dark:text-neutral-400 italic mt-4">
          <strong>Note:</strong> Market statistics reflect a snapshot of current active listings and are not a guarantee of future prices or market conditions. Data is subject to change as new listings are added and existing ones are sold or removed.
        </div>
      </div>
    </section>
  );
}

// ========== Neighborhood Cards Component ==========
export interface NeighborhoodCard {
  name: string;
  blurb: string;
  best_for: string[];
  internal_link_text?: string;
  internal_link_href?: string;
}

export interface NeighborhoodCardsProps {
  heading: string;
  body: string;
  cards: NeighborhoodCard[];
  className?: string;
}

export function NeighborhoodCards({
  heading,
  body,
  cards,
  className,
}: NeighborhoodCardsProps) {
  return (
    <section
      id="neighborhoods"
      className={cn("py-12 px-6", className)}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          {heading}
        </h2>

        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-10 text-neutral-700 dark:text-neutral-300"
          dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(body) }}
        />

        {/* Neighborhood Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-neutral-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {card.name}
                </h3>
              </div>

              <p className="text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
                {card.blurb}
              </p>

              {/* Internal Link */}
              {card.internal_link_href && card.internal_link_text && (
                <Link
                  href={card.internal_link_href}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm flex items-center gap-2 group"
                >
                  {card.internal_link_text}
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    →
                  </span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== What $1M+ Buys Component ==========
export interface WhatMBuysProps {
  heading: string;
  body: string;
  className?: string;
}

export function WhatMBuys({ heading, body, className }: WhatMBuysProps) {
  return (
    <section
      id="what-1m-buys"
      className={cn("py-12 px-6 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl", className)}
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          {heading}
        </h2>

        <div
          className="prose prose-lg dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300"
          dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(body) }}
        />
      </div>
    </section>
  );
}

// ========== Property Types Component ==========
export interface PropertyTypesProps {
  heading: string;
  body: string;
  className?: string;
}

export function PropertyTypes({ heading, body, className }: PropertyTypesProps) {
  return (
    <section
      id="property-types"
      className={cn("py-12 px-6", className)}
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          {heading}
        </h2>

        <div
          className="prose prose-lg dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300"
          dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(body) }}
        />
      </div>
    </section>
  );
}

// ========== Buyer Strategy Component ==========
export interface BuyerStrategyProps {
  heading: string;
  body: string;
  cta?: {
    title: string;
    body: string;
    button_text: string;
    button_href: string;
  };
  className?: string;
}

export function BuyerStrategy({
  heading,
  body,
  cta,
  className,
}: BuyerStrategyProps) {
  return (
    <section
      id="buyer-strategy"
      className={cn("py-12 px-6", className)}
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          {heading}
        </h2>

        <div
          className="prose prose-lg dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 mb-8"
          dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(body) }}
        />

        {/* CTA Box */}
        {cta && (
          <div className="bg-primary-600 dark:bg-primary-700 rounded-2xl p-8 text-white mt-10">
            <h3 className="text-2xl font-bold mb-4">{cta.title}</h3>
            <p className="mb-6 text-primary-50">{cta.body}</p>
            <Link
              href={cta.button_href}
              className="inline-block px-8 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-neutral-100 transition-colors duration-200"
            >
              {cta.button_text}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// ========== Trust Box Component ==========
export interface TrustBoxProps {
  about_brand: string;
  agent_box: {
    headline: string;
    body: string;
    disclaimer: string;
  };
  className?: string;
}

export function TrustBox({ about_brand, agent_box, className }: TrustBoxProps) {
  return (
    <section className={cn("py-12 px-6 bg-neutral-50 dark:bg-slate-900 rounded-3xl", className)}>
      <div className="max-w-4xl mx-auto">
        {/* About Brand */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Home className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              About Crown Coastal Homes
            </h3>
          </div>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {about_brand}
          </p>
        </div>

        {/* Agent Box */}
        <div className="border-l-4 border-primary-600 dark:border-primary-400 pl-6 py-4 bg-white dark:bg-slate-800 rounded-r-2xl shadow-md">
          <h4 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            {agent_box.headline}
          </h4>
          <p className="text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
            {agent_box.body}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
            {agent_box.disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}

// ========== Internal Links Component ==========
export interface InternalLinksProps {
  related_pages?: Array<{ href: string; anchor: string }>;
  more_in_city?: Array<{ href: string; anchor: string }>;
  nearby_cities?: Array<{ href: string; anchor: string }>;
  className?: string;
}

export function InternalLinks({
  related_pages,
  more_in_city,
  nearby_cities,
  className,
}: InternalLinksProps) {
  return (
    <section className={cn("py-12 px-6", className)}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Related Pages */}
        {related_pages && related_pages.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Related Pages
            </h3>
            <ul className="space-y-2">
              {related_pages.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline"
                  >
                    {link.anchor}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* More in City */}
        {more_in_city && more_in_city.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              More in This City
            </h3>
            <ul className="space-y-2">
              {more_in_city.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline"
                  >
                    {link.anchor}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Nearby Cities */}
        {nearby_cities && nearby_cities.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Nearby Cities
            </h3>
            <ul className="space-y-2">
              {nearby_cities.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline"
                  >
                    {link.anchor}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

// ========== Page Intro Component ==========
export interface PageIntroProps {
  subheadline: string;
  quick_bullets: string[];
  last_updated_line?: string;
  className?: string;
}

export function PageIntro({
  subheadline,
  quick_bullets,
  last_updated_line,
  className,
}: PageIntroProps) {
  return (
    <div className={cn("mb-12", className)}>
      <p className="text-xl text-neutral-700 dark:text-neutral-300 mb-6">
        {subheadline}
      </p>

      {last_updated_line && (
        <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
          {last_updated_line}
        </p>
      )}

      {/* Quick Bullets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {quick_bullets.map((bullet, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl"
          >
            <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
            <span className="text-neutral-700 dark:text-neutral-300">{bullet}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

// ========== Table of Contents Component ==========
export interface TOCItem {
  id: string;
  label: string;
}

export interface TOCProps {
  items: TOCItem[];
  className?: string;
}

export function TableOfContents({ items, className }: TOCProps) {
  return (
    <nav className={cn("mb-12 p-6 bg-neutral-50 dark:bg-slate-900 rounded-2xl", className)}>
      <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">
        On This Page
      </h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
