import { formatPriceWithCommas } from '@/lib/utils';
import { LandingStats } from '@/types/landing';

interface Props { stats?: LandingStats; }

const statMeta: Array<{ key: keyof LandingStats; label: string; format: (v: number) => string }> = [
  { key: 'medianPrice', label: 'Median Price', format: formatPriceWithCommas },
  { key: 'pricePerSqft', label: '$ / Sqft', format: (v) => `$${v.toLocaleString('en-US')}` },
  { key: 'daysOnMarket', label: 'Days on Market', format: (v) => `${v}` },
  { key: 'totalActive', label: 'Active Listings', format: (v) => v.toLocaleString('en-US') },
];

export default function StatsSection({ stats }: Props) {
  if (!stats || Object.keys(stats).length === 0) return null
  const visibleStats = statMeta
    .map((meta) => ({ meta, value: stats[meta.key] }))
    .filter((item): item is { meta: typeof statMeta[number]; value: number } => 
      typeof item.value === 'number' && item.value > 0
    )

  if (visibleStats.length === 0) return null

  const gridColsClass =
    visibleStats.length === 1
      ? 'grid-cols-1'
      : visibleStats.length === 2
        ? 'sm:grid-cols-2'
        : visibleStats.length === 3
          ? 'sm:grid-cols-2 md:grid-cols-3'
          : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'

  return (
    <section className="pt-2">
      <h2 className="mb-4 text-xl font-bold text-[var(--coastal-text)] sm:text-2xl">Market Snapshot</h2>
      <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${gridColsClass}`}>
        {visibleStats.map(({ meta, value }) => (
          <div key={meta.key} className="rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-4">
            <p className="text-xs font-semibold uppercase text-[var(--coastal-muted-text)]">{meta.label}</p>
            <p className="mt-1 text-xl font-bold text-[var(--coastal-text)] sm:text-2xl">
              {meta.format(value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
