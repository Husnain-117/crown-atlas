'use client';

import Link from 'next/link';
import { Home, DollarSign, Sparkles, MapPin, Building2 } from 'lucide-react';

interface TaxonomyLinksProps {
  cityName: string;
  citySlug: string;
  stats: {
    houses_count: number;
    condos_count: number;
    townhomes_count: number;
    under_300k_count: number;
    under_500k_count: number;
    under_750k_count: number;
    under_1m_count: number;
    under_2m_count: number;
    over_2m_count: number;
    pool_count: number;
    waterfront_count: number;
    ocean_view_count: number;
    single_story_count: number;
    garage_count: number;
    studio_count: number;
    one_bed_count: number;
    two_bed_count: number;
    three_bed_count: number;
    four_plus_bed_count: number;
    top_neighborhoods: Array<{
      name: string;
      slug: string;
      count: number;
      avg_price: number;
    }>;
  };
}

export default function TaxonomyLinks({ cityName, citySlug, stats }: TaxonomyLinksProps) {
  // Property Types
  const propertyTypes = [
    { label: 'Homes for Sale', href: `/buy/houses?city=${cityName}`, count: stats.houses_count, icon: Home },
    { label: 'Condos for Sale', href: `/buy/condos?city=${cityName}`, count: stats.condos_count, icon: Building2 },
    { label: 'Townhomes for Sale', href: `/buy/townhouses?city=${cityName}`, count: stats.townhomes_count, icon: Home },
  ].filter(item => item.count > 0);

  // Price Ranges - Brackets (all for-sale property types, no rental)
  const priceRanges = [
    { label: 'Under $300K', href: `/properties?city=${cityName}&maxPrice=300000`, count: stats.under_300k_count },
    { label: '$300K - $500K', href: `/properties?city=${cityName}&minPrice=300000&maxPrice=500000`, count: stats.under_500k_count },
    { label: '$500K - $750K', href: `/properties?city=${cityName}&minPrice=500000&maxPrice=750000`, count: stats.under_750k_count },
    { label: '$750K - $1M', href: `/properties?city=${cityName}&minPrice=750000&maxPrice=1000000`, count: stats.under_1m_count },
    { label: '$1M - $2M', href: `/properties?city=${cityName}&minPrice=1000000&maxPrice=2000000`, count: stats.under_2m_count },
    { label: 'Over $2M', href: `/properties?city=${cityName}&minPrice=2000000`, count: stats.over_2m_count },
  ].filter(item => item.count > 0);

  // Features
  const features = [
    { label: 'Pool', href: `/properties?city=${cityName}&hasPool=true`, count: stats.pool_count },
    { label: 'Waterfront', href: `/buy/waterfront?city=${cityName}`, count: stats.waterfront_count },
    { label: 'Ocean View', href: `/properties?city=${cityName}&hasView=true`, count: stats.ocean_view_count },
    { label: 'Single Story', href: `/properties?city=${cityName}&stories=1`, count: stats.single_story_count },
    { label: 'Garage', href: `/properties?city=${cityName}&hasGarage=true`, count: stats.garage_count },
  ].filter(item => item.count > 0).slice(0, 6);

  // Bedrooms - Use exact matching (beds=X&maxBeds=X) except for 4+ which is minimum
  const bedrooms = [
    { label: 'Studio', href: `/properties?city=${cityName}&beds=0&maxBeds=0`, count: stats.studio_count },
    { label: '1 Bedroom', href: `/properties?city=${cityName}&beds=1&maxBeds=1`, count: stats.one_bed_count },
    { label: '2 Bedrooms', href: `/properties?city=${cityName}&beds=2&maxBeds=2`, count: stats.two_bed_count },
    { label: '3 Bedrooms', href: `/properties?city=${cityName}&beds=3&maxBeds=3`, count: stats.three_bed_count },
    { label: '4+ Bedrooms', href: `/properties?city=${cityName}&beds=4`, count: stats.four_plus_bed_count },
  ].filter(item => item.count > 0);

  // Top Neighborhoods (max 12)
  const neighborhoods = stats.top_neighborhoods?.slice(0, 12) || [];

  return (
    <section className="py-16 md:py-20 bg-[var(--surface)] theme-transition">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-[2px] bg-[var(--coastal-secondary)] rounded-full"></div>
            <span className="text-[var(--coastal-primary)] font-semibold text-sm uppercase tracking-wider">
              Quick Links
            </span>
            <div className="w-8 h-[2px] bg-[var(--coastal-secondary)] rounded-full"></div>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-4 theme-transition">
            Explore {cityName} Real Estate
          </h2>
          <p className="text-[var(--coastal-muted-text)] text-lg max-w-2xl mx-auto theme-transition">
            Browse properties by type, price, features, and neighborhood
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Property Types */}
          {propertyTypes.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-[var(--coastal-border)] theme-transition">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-[var(--coastal-text)] theme-transition">
                  Home Types
                </h3>
              </div>
              <ul className="space-y-3">
                {propertyTypes.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between text-[var(--coastal-muted-text)] hover:text-[var(--coastal-primary)] transition-colors group theme-transition"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {item.label}
                      </span>
                      <span className="text-sm text-[var(--coastal-muted-text)]">
                        {item.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Price Ranges */}
          {priceRanges.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-[var(--coastal-border)] theme-transition">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-[var(--coastal-text)] theme-transition">
                  Price Ranges
                </h3>
              </div>
              <ul className="space-y-3">
                {priceRanges.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between text-[var(--coastal-muted-text)] hover:text-[var(--coastal-primary)] transition-colors group theme-transition"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {item.label}
                      </span>
                      <span className="text-sm text-[var(--coastal-muted-text)]">
                        {item.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features */}
          {features.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-[var(--coastal-border)] theme-transition">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-[var(--coastal-text)] theme-transition">
                  Features
                </h3>
              </div>
              <ul className="space-y-3">
                {features.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between text-[var(--coastal-muted-text)] hover:text-[var(--coastal-primary)] transition-colors group theme-transition"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {item.label}
                      </span>
                      <span className="text-sm text-[var(--coastal-muted-text)]">
                        {item.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bedrooms */}
          {bedrooms.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-[var(--coastal-border)] theme-transition">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-[var(--coastal-text)] theme-transition">
                  Bedrooms
                </h3>
              </div>
              <ul className="space-y-3">
                {bedrooms.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between text-[var(--coastal-muted-text)] hover:text-[var(--coastal-primary)] transition-colors group theme-transition"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {item.label}
                      </span>
                      <span className="text-sm text-[var(--coastal-muted-text)]">
                        {item.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Neighborhoods Section */}
        {neighborhoods.length > 0 && (
          <div className="mt-12">
            <div className="glass-card rounded-2xl p-8 border border-[var(--coastal-border)] theme-transition">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[var(--coastal-text)] theme-transition">
                  Popular Neighborhoods
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {neighborhoods.map((neighborhood) => (
                  <Link
                    key={neighborhood.slug}
                    href={`/properties?city=${cityName}&neighborhood=${neighborhood.name}`}
                    className="flex flex-col p-4 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--coastal-primary)]/10 border border-[var(--coastal-border)] transition-all duration-300 hover:scale-105 group theme-transition"
                  >
                    <span className="font-semibold text-[var(--coastal-text)] group-hover:text-[var(--coastal-primary)] transition-colors mb-1 theme-transition">
                      {neighborhood.name}
                    </span>
                    <span className="text-sm text-[var(--coastal-muted-text)] theme-transition">
                      {neighborhood.count} homes
                    </span>
                  </Link>
                ))}
              </div>
              {stats.top_neighborhoods && stats.top_neighborhoods.length > 12 && (
                <div className="mt-6 text-center">
                  <Link
                    href={`/discover/${citySlug}/neighborhoods`}
                    className="inline-flex items-center gap-2 text-[var(--coastal-primary)] hover:text-[var(--coastal-link)] font-semibold transition-colors theme-transition"
                  >
                    <span>View All Neighborhoods</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
