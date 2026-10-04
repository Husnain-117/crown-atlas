import { z } from 'zod';

export const BLOG_DRAFT_INSTRUCTIONS = `
Create an editorial draft, not a publication-ready or reviewed article.
Use supplied, verifiable source material for factual claims. No source material
is supplied in this request: do not invent current market figures, inventory,
prices, rates, forecasts, investment returns, school rankings, or local rules.
Focus on practical research steps and questions a buyer can ask. Do not invent
client stories, credentials, professional reviews, exclusive listings, personal
experience, citations, or claims that Crown Coastal Homes is the best provider.
Do not promise financing, residency, tax savings, appreciation, rental income,
or free representation. Explain specialist questions as things to verify with
qualified professionals. Write readable topic names instead of underscore
keywords. A stock editorial image is not evidence about an actual property.
Do not mark the draft as reviewed, verified, approved, or published.
`;

const draftSchema = z.object({
  title: z.string().trim().min(5).max(200),
  summary: z.string().trim().min(20).max(400),
  tags: z.array(z.string().trim().min(1).max(80)).max(8).default([]),
  content: z.string().trim().min(350).max(40_000),
});

/** Validation checks shape only. Factual review is a separate human action. */
export function parseBlogDraft(value: unknown) {
  return draftSchema.parse(value);
}

export function createBlogDraftReview(generatedAt = new Date().toISOString()) {
  return {
    status: 'draft' as const,
    generated_at: generatedAt,
    review_required: true,
    reviewed_by: null,
    reviewed_at: null,
    sources: [],
  };
}

const reviewSchema = z.object({
  status: z.literal('published'),
  reviewed_by: z.string().trim().min(1),
  reviewed_at: z.string().datetime({ offset: true }),
  sources: z.array(z.object({ url: z.string().url().refine((url) => /^https?:\/\//i.test(url)), note: z.string().trim().min(1) })).min(1),
});

export function requiresBlogFinancialReview(article: {
  title?: string; summary?: string; content?: string; data_snapshot?: unknown;
}): boolean {
  const snapshot = article.data_snapshot && typeof article.data_snapshot === 'object'
    ? article.data_snapshot as Record<string, unknown> : {};
  if (reviewSchema.safeParse(snapshot.editorial).success) return false;
  const text = `${article.title || ''} ${article.summary || ''} ${article.content || ''}`;
  return /[$£€]\s*\d|\b\d+(?:\.\d+)?\s*(?:%|(?:percent|million|billion)\b)|\b(?:guaranteed\s+(?:returns?|income|appreciation)|tax[- ]free|rental\s+yields?|return\s+on\s+investment|mortgage\s+rates?|capital\s+gains\s+tax|FIRPTA)\b/i.test(text)
    || Boolean(snapshot.market_stats);
}

// Existing articles without editorial metadata retain their published state.
// New drafts use the existing JSONB column, so no schema migration is required.
// Documented human review and source evidence are required for new publications.
export const BLOG_PUBLICATION_WHERE = `(
  data_snapshot->'editorial' IS NULL
  OR (
    data_snapshot->'editorial'->>'status' = 'published'
    AND NULLIF(BTRIM(data_snapshot->'editorial'->>'reviewed_by'), '') IS NOT NULL
    AND NULLIF(BTRIM(data_snapshot->'editorial'->>'reviewed_at'), '') IS NOT NULL
    AND CASE WHEN jsonb_typeof(data_snapshot->'editorial'->'sources') = 'array'
      THEN jsonb_array_length(data_snapshot->'editorial'->'sources') > 0
      ELSE FALSE END
  )
)`;
