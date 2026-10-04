import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getArticleBySlug } from '@/lib/blog-postgres';
import { ArticleMarkdown } from '@/components/blog/article-markdown';
import { EditorialImage } from '@/components/blog/editorial-image';
import { SITE_NAME, SITE_URL, SITE_LOGO_URL, absoluteUrl } from '@/lib/constants/site';
import { buildMetadataTitle, truncateMetadataText } from '@/lib/seo/meta';
import { blogDate, blogFaqs, blogImageUrl, blogMarketSnapshot, blogSearchDestination, formatBlogDate, humanizeBlogLabel, serializeBlogJsonLd } from '@/lib/blog-presentation';
import { requiresBlogFinancialReview } from '@/lib/blog-editorial';

export const revalidate = 3600;
export const dynamicParams = true;
const loadArticle = cache((slug: string) => getArticleBySlug(slug.trim().toLowerCase()));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const blog = await loadArticle((await params).slug);
  if (!blog) return { title: 'Article not found', robots: { index: false, follow: true } };
  const title = humanizeBlogLabel(blog.title);
  const description = truncateMetadataText(humanizeBlogLabel(blog.summary), 160);
  const image = blogImageUrl(blog.imageUrl);
  const publishedTime = blogDate(blog.publishedAt) || undefined;
  const modifiedTime = blogDate(blog.updatedAt) || publishedTime;
  return {
    title: buildMetadataTitle(title, SITE_NAME, 65), description,
    ...(requiresBlogFinancialReview(blog) ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical: `/blogs/${blog.slug}` },
    openGraph: { type: 'article', title, description, url: `/blogs/${blog.slug}`, publishedTime, modifiedTime,
      ...(image ? { images: [{ url: absoluteUrl(image) }] } : {}) },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description,
      ...(image ? { images: [absoluteUrl(image)] } : {}) },
  };
}

function storedProperties(value: unknown): { address: string; price: number | null }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const address = humanizeBlogLabel(item.address || item.title);
    if (!address) return [];
    const amount = typeof item.price === 'number' || typeof item.price === 'string' ? Number(item.price) : NaN;
    return [{ address, price: Number.isFinite(amount) && amount > 0 ? amount : null }];
  }).slice(0, 10);
}

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const blog = await loadArticle((await params).slug);
  if (!blog) notFound();
  const title = humanizeBlogLabel(blog.title);
  const summary = humanizeBlogLabel(blog.summary);
  const city = humanizeBlogLabel(blog.city);
  const date = formatBlogDate(blog.publishedAt);
  const image = blogImageUrl(blog.imageUrl);
  const destination = blogSearchDestination(blog);
  const snapshot = blogMarketSnapshot(blog.data_snapshot?.market_stats);
  const properties = storedProperties(blog.data_snapshot?.all_properties || blog.data_snapshot?.featured_properties);
  const faqs = blogFaqs(blog.data_snapshot?.faqs);
  const rawInsights = blog.data_snapshot?.insights;
  const insights = rawInsights && typeof rawInsights === 'object' ? [
    { title: 'Market context', body: rawInsights.market_snapshot },
    { title: 'Neighbourhood notes', body: rawInsights.neighborhood_stats },
    { title: 'Property notes', body: rawInsights.top_listings },
  ].filter((item): item is { title: string; body: string } => typeof item.body === 'string' && Boolean(item.body.trim())) : [];
  const hasArchive = Boolean(snapshot || properties.length || insights.length);
  const needsReview = requiresBlogFinancialReview(blog);
  const articleSchema = {
    '@context': 'https://schema.org', '@type': 'Article', headline: title, description: summary,
    ...(image ? { image: absoluteUrl(image) } : {}),
    ...(blogDate(blog.publishedAt) ? { datePublished: blogDate(blog.publishedAt) } : {}),
    ...(blogDate(blog.updatedAt) ? { dateModified: blogDate(blog.updatedAt) } : {}),
    author: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/about` },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL, logo: { '@type': 'ImageObject', url: SITE_LOGO_URL } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blogs/${blog.slug}` },
  };
  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--coastal-text)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeBlogJsonLd(articleSchema) }} />
      <header className="coastal-section-light border-b border-[var(--coastal-border)] px-5 pt-28 pb-12 sm:pt-36 sm:pb-16">
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[var(--coastal-muted-text)]"><Link href="/" className="hover:underline">Home</Link><span aria-hidden="true" className="mx-3">/</span><Link href="/blogs" className="hover:underline">Journal</Link><span aria-hidden="true" className="mx-3">/</span><span aria-current="page">Article</span></nav>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--coastal-primary)]">California real estate journal{city ? ` · ${city}` : ''}</p>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">{title}</h1>
          {summary ? <p className="mt-6 text-lg leading-relaxed text-[var(--coastal-muted-text)] sm:text-xl">{summary}</p> : null}
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--coastal-muted-text)]"><Link href="/about" className="underline underline-offset-4">By Crown Coastal Homes</Link>{date ? <time dateTime={blog.publishedAt}>Published {date}</time> : null}{blog.readingTime ? <span>{blog.readingTime} min read</span> : null}</div>
        </div>
      </header>
      <article className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
        {image ? <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl bg-[var(--surface-muted)]"><EditorialImage src={image} priority sizes="(max-width: 896px) 100vw, 896px" /></div> : null}
        <aside className="mb-10 rounded-xl border border-[var(--coastal-border)] bg-[var(--bg)] p-5 text-sm leading-relaxed text-[var(--coastal-muted-text)]"><p>This is an archived article{date ? `, published on ${date}` : ''}. Prices, availability and market conditions may have changed.</p>{needsReview ? <p className="mt-2">Financial and market claims in this article have not received a documented source review. Confirm figures and specialist advice before relying on them.</p> : null}<p className="mt-2"><Link href={destination.href} className="font-medium text-[var(--coastal-primary)] underline underline-offset-4">Check current listings{city ? ` in ${city}` : ''}</Link> or <Link href="/contact" className="font-medium text-[var(--coastal-primary)] underline underline-offset-4">ask about your plans</Link>.</p></aside>
        <ArticleMarkdown>{blog.content}</ArticleMarkdown>
        {hasArchive ? <section aria-labelledby="article-archive" className="mt-12 border-t border-[var(--coastal-border)] pt-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--coastal-muted-text)]">Historical reference</p>
          <h2 id="article-archive" className="font-display text-3xl sm:text-4xl">Figures and notes from this article</h2>
          <p className="mt-3 mb-7 text-sm leading-relaxed text-[var(--coastal-muted-text)]">These saved details relate to the article’s original property selection. They are not a live count or a valuation of the whole {city || 'California'} market.</p>
          {snapshot ? <dl className="mb-8 grid grid-cols-2 gap-4">{[
            ['Listings in the original selection', snapshot.totalListings.toLocaleString()],
            ['Median asking price in that selection', money(snapshot.medianPrice)],
            ['Recorded asking-price range', `${money(snapshot.minPrice)} – ${money(snapshot.maxPrice)}`],
            ...(snapshot.pricePerSqft ? [['Median asking price per sq ft', money(snapshot.pricePerSqft)]] : []),
          ].map(([label, value]) => <div key={label} className="rounded-xl bg-[var(--bg)] p-5"><dt className="text-xs leading-relaxed text-[var(--coastal-muted-text)]">{label}</dt><dd className="mt-2 text-xl font-semibold sm:text-2xl">{value}</dd></div>)}</dl> : null}
          {properties.length ? <div className="mb-8 overflow-x-auto rounded-xl border border-[var(--coastal-border)]"><table className="w-full text-sm"><caption className="p-4 text-left font-medium">Properties referenced in the original article — availability has not been rechecked</caption><thead className="bg-[var(--surface-muted)]"><tr><th scope="col" className="px-4 py-3 text-left">Property</th><th scope="col" className="px-4 py-3 text-right">Recorded asking price</th></tr></thead><tbody>{properties.map((property, index) => <tr key={`${property.address}-${index}`} className="border-t border-[var(--coastal-border)]"><td className="px-4 py-3">{property.address}</td><td className="px-4 py-3 text-right">{property.price ? money(property.price) : 'Not recorded'}</td></tr>)}</tbody></table></div> : null}
          {insights.map((item) => <section key={item.title} className="mt-7"><h3 className="mb-3 text-xl font-semibold">{item.title}</h3><ArticleMarkdown>{item.body}</ArticleMarkdown></section>)}
        </section> : null}
        {faqs.length ? <section className="mt-12 border-t border-[var(--coastal-border)] pt-10" aria-labelledby="article-questions"><h2 id="article-questions" className="mb-6 font-display text-3xl">Questions covered in this article</h2><div className="space-y-3">{faqs.map((faq, index) => <details key={`${faq.question}-${index}`} className="rounded-xl border border-[var(--coastal-border)] p-5"><summary className="cursor-pointer font-semibold">{faq.question}</summary><div className="mt-4"><ArticleMarkdown>{faq.answer}</ArticleMarkdown></div></details>)}</div></section> : null}
      </article>
      <section className="border-t border-[var(--coastal-border)] bg-[var(--bg)] px-5 py-14"><div className="mx-auto max-w-4xl"><p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--coastal-primary)]">Put your research into practice</p><h2 className="font-display text-3xl sm:text-4xl">Plan your next move{city ? ` in ${city}` : ''}.</h2><p className="mt-4 max-w-2xl leading-relaxed text-[var(--coastal-muted-text)]">Compare current homes, work through the buying process or discuss your search with Reza.</p><div className="mt-7 flex flex-wrap gap-3"><Link href={destination.href} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--coastal-primary)] px-5 py-3 font-semibold text-white hover:opacity-90">{destination.label}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><Link href="/buyers-guide" className="inline-flex min-h-12 items-center rounded-xl border border-[var(--coastal-border)] px-5 py-3 font-semibold hover:bg-[var(--surface)]">Read the buyer's guide</Link><Link href="/contact" className="inline-flex min-h-12 items-center px-4 py-3 font-semibold text-[var(--coastal-primary)] underline underline-offset-4">Talk with Reza</Link></div></div></section>
    </div>
  );
}
