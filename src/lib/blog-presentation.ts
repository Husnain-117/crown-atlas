/** Presentation rules for archived articles; stored snapshots are never live inventory. */
export function humanizeBlogLabel(value: unknown): string {
  return typeof value === 'string'
    ? value.replace(/([a-z0-9])_+(?=[a-z0-9])/gi, '$1 ').replace(/\s+/g, ' ').trim()
    : '';
}

export function blogDate(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

export function formatBlogDate(value: unknown): string | null {
  const date = blogDate(value);
  return date ? new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  }) : null;
}

export function blogImageUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const url = value.trim();
  if (!url || /placeholder|localhost|127\.0\.0\.1/i.test(url)) return null;
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) ? url : null;
  } catch {
    return null;
  }
}

export function blogSearchDestination(article: { city?: string; title: string; slug: string }) {
  const city = humanizeBlogLabel(article.city);
  const params = new URLSearchParams();
  if (city) params.set('city', city);
  // A snapshot's highest price is not a reader's budget. Only explicit article
  // intent can supply a price filter; general buyer guides have no price cap.
  const title = humanizeBlogLabel(article.title);
  const match = title.match(/\b(?:under|below)\s+\$?([\d,]+(?:\.\d+)?)\s*(million|thousand|m|k)?\b/i);
  if (match) {
    const scale = /^(million|m)$/i.test(match[2] || '') ? 1_000_000
      : /^(thousand|k)$/i.test(match[2] || '') ? 1_000 : 1;
    const maximum = Number(match[1].replace(/,/g, '')) * scale;
    if (Number.isFinite(maximum) && maximum >= 10_000 && maximum <= 1_000_000_000) {
      params.set('maxPrice', String(Math.round(maximum)));
    }
  }
  return {
    href: `/properties${params.size ? `?${params.toString()}` : ''}`,
    label: city ? `Explore current homes in ${city}` : 'Explore current California homes',
  };
}

export interface BlogFaq { question: string; answer: string }

export function blogFaqs(value: unknown): BlogFaq[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const question = humanizeBlogLabel(item.question);
    const answer = humanizeBlogLabel(item.answer);
    return question && answer ? [{ question, answer }] : [];
  });
}

export interface BlogMarketSnapshot {
  totalListings: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  pricePerSqft: number | null;
}

function finiteNumber(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function blogMarketSnapshot(value: unknown): BlogMarketSnapshot | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const totalListings = finiteNumber(raw.total_listings);
  const medianPrice = finiteNumber(raw.median_price);
  const minPrice = finiteNumber(raw.min_price);
  const maxPrice = finiteNumber(raw.max_price);
  const pricePerSqft = finiteNumber(raw.median_price_per_sqft);
  if (totalListings === null || !Number.isInteger(totalListings) || totalListings < 1
    || medianPrice === null || minPrice === null || maxPrice === null
    || minPrice <= 0 || medianPrice < minPrice || medianPrice > maxPrice) return null;
  return { totalListings, medianPrice, minPrice, maxPrice,
    pricePerSqft: pricePerSqft !== null && pricePerSqft > 0 ? pricePerSqft : null };
}

interface MarkdownNode {
  type: string;
  value?: string;
  children?: MarkdownNode[];
}

/** Change visible keyword tokens only, preserving URL targets and code. */
export function readableBlogText() {
  return function transform(tree: MarkdownNode) {
    function visit(node: MarkdownNode) {
      if (node.type === 'text' && node.value) {
        node.value = node.value.replace(/([a-z0-9])_+(?=[a-z0-9])/gi, '$1 ');
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}

export function serializeBlogJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
