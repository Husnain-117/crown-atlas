'use client';

import Link from 'next/link';

export default function BlogError({ reset }: { reset: () => void }) {
  return <section className="mx-auto max-w-3xl px-5 pt-32 pb-20 text-center text-[var(--coastal-text)]"><h1 className="font-display text-4xl">We couldn't load this article.</h1><p className="mt-5 text-[var(--coastal-muted-text)]">Please try again. Our buyer's guide and home search are still available.</p><div className="mt-7 flex flex-wrap justify-center gap-4"><button type="button" onClick={reset} className="min-h-12 rounded-xl bg-[var(--coastal-primary)] px-6 py-3 font-semibold text-white">Try again</button><Link href="/buyers-guide" className="min-h-12 rounded-xl border border-[var(--coastal-border)] px-6 py-3">Read the buyer's guide</Link><Link href="/properties" className="min-h-12 px-6 py-3 text-[var(--coastal-primary)] underline">Search homes</Link></div></section>;
}
