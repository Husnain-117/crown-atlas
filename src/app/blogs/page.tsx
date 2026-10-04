import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getPublishedArticles } from '@/lib/blog-postgres';
import { requiresBlogFinancialReview } from '@/lib/blog-editorial';
import { EditorialImage } from '@/components/blog/editorial-image';
import { blogImageUrl, formatBlogDate, humanizeBlogLabel } from '@/lib/blog-presentation';

export const revalidate = 3600;
export const metadata: Metadata = {
  title: 'California Real Estate Journal | Crown Coastal Homes',
  description: 'Explore California property guides, coastal living and market articles. Find publication dates, practical buying steps and links to current homes.',
  alternates: { canonical: '/blogs' },
  openGraph: { title: 'California Real Estate Journal | Crown Coastal Homes', description: 'Property guides, coastal living and market perspectives from Crown Coastal Homes.', url: '/blogs' },
};

export default async function BlogsListPage() {
  const { articles } = await getPublishedArticles({ limit: 50 });
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--coastal-text)]">
      <section className="coastal-section-light border-b border-[var(--coastal-border)] px-5 pt-28 pb-14 sm:pt-36 sm:pb-20"><div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[var(--coastal-muted-text)]"><Link href="/" className="hover:underline">Home</Link><span className="mx-3" aria-hidden="true">/</span><span aria-current="page">Journal</span></nav>
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--coastal-primary)]">The Crown Coastal journal</p>
        <h1 className="max-w-3xl font-display text-5xl leading-tight sm:text-6xl lg:text-7xl">A clearer view of<br className="hidden sm:block" /> California living.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--coastal-muted-text)]">Explore property guides, local perspectives and articles from our archive. For a practical overview of the purchase process, start with our buyer's guide.</p>
        <Link href="/buyers-guide" className="mt-7 inline-flex min-h-12 items-center gap-2 font-semibold text-[var(--coastal-primary)] underline underline-offset-4">Plan your California home purchase <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div></section>
      <section aria-label="Articles" className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        {articles.length ? <div className="space-y-7">{articles.map((blog) => {
          const image = blogImageUrl(blog.imageUrl);
          const date = formatBlogDate(blog.publishedAt);
          const needsReview = requiresBlogFinancialReview(blog);
          return <article key={blog.id} className="overflow-hidden rounded-2xl border border-[var(--coastal-border)] bg-[var(--surface)]">
            <Link href={`/blogs/${blog.slug}`} className="group grid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--coastal-primary)] md:grid-cols-[minmax(0,1fr)_280px]">
              <div className="p-6 sm:p-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--coastal-primary)]">{humanizeBlogLabel(blog.city) || 'California'} · {humanizeBlogLabel(blog.category) || 'Real estate'}</p>
                <h2 className="font-display text-3xl leading-tight group-hover:text-[var(--coastal-primary)] sm:text-4xl">{humanizeBlogLabel(blog.title)}</h2>
                {needsReview ? <p className="mt-4 leading-relaxed text-[var(--coastal-muted-text)]"><span className="font-medium">Archive · Source review pending.</span> Read the original article or use our buyer’s guide and current listings to plan your search.</p> : blog.summary ? <p className="mt-4 line-clamp-3 leading-relaxed text-[var(--coastal-muted-text)]">{humanizeBlogLabel(blog.summary)}</p> : null}
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--coastal-muted-text)]">{date ? <time dateTime={blog.publishedAt}>{date}</time> : null}{blog.readingTime ? <span>{blog.readingTime} min read</span> : null}</div>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--coastal-primary)]">Read article <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </div>
              {image ? <div className="relative min-h-56 bg-[var(--surface-muted)] md:min-h-full"><EditorialImage src={image} sizes="(max-width: 768px) 100vw, 280px" /></div> : <div className="hidden items-end justify-end bg-[var(--surface-muted)] p-8 md:flex" aria-hidden="true"><span className="font-display text-7xl text-[var(--coastal-primary)] opacity-30">CC</span></div>}
            </Link>
          </article>;
        })}</div> : <div className="rounded-2xl border border-[var(--coastal-border)] bg-[var(--surface)] p-8 text-center"><h2 className="font-display text-3xl">Start with the buyer's guide</h2><p className="mx-auto mt-4 max-w-xl text-[var(--coastal-muted-text)]">Articles are not available here at the moment. You can still explore the buying process or speak with Reza about your search.</p><Link href="/buyers-guide" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-[var(--coastal-primary)] px-6 py-3 font-semibold text-white">Read the guide</Link></div>}
      </section>
    </div>
  );
}
