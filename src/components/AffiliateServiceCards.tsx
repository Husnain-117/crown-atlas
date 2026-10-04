import Link from "next/link";
import { AFFILIATES } from "@/lib/constants/affiliates";

export function AffiliateServiceCards({ services }: { services: string[] }) {
  const selected = AFFILIATES.filter((a) => services.includes(a.id));

  return (
    <section id="homeowner-resources-section" className="rounded-xl border border-[var(--coastal-border)] bg-[var(--surface)] p-5 shadow-sm">
      <h3 id="homeowner-resources-heading" className="text-xl font-semibold text-[var(--coastal-text)] mb-4">Homeowner resources</h3>
      <div className="grid md:grid-cols-3 gap-3">
        {selected.map((s) => (
          <article key={s.id} className="rounded border border-[var(--coastal-border)] bg-[var(--surface)] p-3 hover:border-[var(--coastal-primary)] transition-all">
            <div className="font-medium text-[var(--coastal-text)] mb-1">{s.name}</div>
            <p className="mb-2 text-sm text-[#5B6674] dark:text-[#B7C7D6]">{s.description}</p>
            {s.url.startsWith('/') ? (
              <Link
                href={`${s.url}?utm_source=crowncoastal&utm_medium=website&utm_campaign=${s.id}`}
                className="text-sm font-semibold text-[var(--coastal-accent-text)] hover:text-[var(--coastal-link)] transition-colors"
              >
                {s.ctaText}
              </Link>
            ) : (
              <a
                href={`${s.url}?utm_source=crowncoastal&utm_medium=website&utm_campaign=${s.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-[var(--coastal-accent-text)] hover:text-[var(--coastal-link)] transition-colors"
              >
                {s.ctaText}
              </a>
            )}
          </article>
        ))}
      </div>
      <p className="text-xs text-[var(--coastal-muted-text)] mt-3">Disclosure: We may have a referral relationship with selected providers.</p>
    </section>
  );
}
