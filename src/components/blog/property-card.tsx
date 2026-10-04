'use client';

import Image from '@/components/property-image';
import Link from 'next/link';
import { validateImageUrl } from '@/constants/placeholders';
import { propertyPathFor } from '@/lib/property-url';

interface PropertyCardProps {
  listingKey: string;
  address: string;
  city: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  description?: string;
  imageUrl?: string;
}

export function PropertyCard({
  listingKey,
  address,
  city,
  price,
  beds,
  baths,
  sqft,
  description,
  imageUrl
}: PropertyCardProps) {
  const propertyUrl = propertyPathFor({ listing_key: listingKey, address, city });
  
  // Use centralized placeholder system for consistent, validated images
  const displayImage = validateImageUrl(
    imageUrl,
    'property',
    listingKey,
    city
  );
  
  const unoptimized = /^https?:\/\//i.test(displayImage);

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-[var(--coastal-border)] hover-lift transition-all duration-300 group">
      {/* Property Image */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={displayImage}
          alt={address}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          unoptimized={unoptimized}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-[var(--coastal-primary)] text-white px-4 py-2 rounded-xl font-bold text-lg shadow-strong">
          ${price.toLocaleString()}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-6">
        {/* Address */}
        <h3 className="text-xl font-bold text-[var(--coastal-text)] mb-2 theme-transition group-hover:text-[var(--coastal-primary)] transition-colors">
          {address}
        </h3>
        <p className="text-sm text-[var(--coastal-muted-text)] mb-4 theme-transition">
          {city}, CA
        </p>

        {/* Property Stats */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[var(--coastal-border)]">
          {/* Beds */}
          {beds > 0 && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--coastal-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[var(--coastal-text)] font-semibold theme-transition">{beds} <span className="text-sm font-normal text-[var(--coastal-muted-text)]">BD</span></span>
            </div>
          )}

          {/* Baths */}
          {baths > 0 && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--coastal-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              <span className="text-[var(--coastal-text)] font-semibold theme-transition">{baths} <span className="text-sm font-normal text-[var(--coastal-muted-text)]">BA</span></span>
            </div>
          )}

          {/* Sqft */}
          {sqft > 0 && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--coastal-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span className="text-[var(--coastal-text)] font-semibold theme-transition">{sqft.toLocaleString()} <span className="text-sm font-normal text-[var(--coastal-muted-text)]">Sq Ft</span></span>
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-[var(--coastal-muted-text)] mb-4 line-clamp-2 theme-transition">
            {description}
          </p>
        )}

        {/* View Details Button */}
        <Link
          href={propertyUrl}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:shadow-strong transition-all duration-300 group/btn w-full justify-center"
        >
          <span>View Full Details</span>
          <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
