import { isUsablePropertyImage } from '@/lib/property-normalization';
import Image from '@/components/property-image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LandingPropertyCard } from '@/types/landing';
import { formatPriceWithCommas } from '@/lib/utils';

interface Props { properties?: LandingPropertyCard[]; }

export default function FeaturedGrid({ properties }: Props) {
  // Filter out any Land properties (safety check - should already be filtered from DB)
  const filteredProperties = (properties || []).filter(
    p => !p.status?.toLowerCase().includes('land')
  )
  const loading = !filteredProperties || filteredProperties.length === 0
  return (
    <section className="pt-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: '#fcba03' }}>Featured Listings</h2>
      </div>
      {loading && (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200/60 dark:border-slate-700 bg-muted/40 h-48 animate-pulse shadow-sm" />
          ))}
        </div>
      )}
      {!loading && (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProperties.map((p) => (
            <Card
              key={p.listingKey}
              className="overflow-hidden rounded-2xl group shadow-sm hover:shadow-md transition-all border border-neutral-200/60 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={isUsablePropertyImage(p.img) ? p.img : '/property-photo-pending.svg'}
                  alt={p.title || p.address || 'Listing'}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold line-clamp-1 tracking-tight">
                  {p.title || p.address || 'Listing'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1 text-xs">
                <p className="font-bold text-brand-midnightCove text-sm">
                  {p.price ? formatPriceWithCommas(p.price) : '—'}
                </p>
                <p className="text-gray-500 truncate">{p.address || `${p.city}, ${p.state}`}</p>
                <p className="text-gray-500">
                  {[p.beds && `${p.beds} bd`, p.baths && `${p.baths} ba`, p.sqft && `${p.sqft.toLocaleString()} sqft`]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
