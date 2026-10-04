import { Pool } from 'pg';
import { validateImageUrl } from '@/constants/placeholders';
import { BLOG_PUBLICATION_WHERE, requiresBlogFinancialReview } from '@/lib/blog-editorial';

let blogPool: Pool | null = null;

function isProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build" || process.env.npm_lifecycle_event === "build";
}

function getBlogPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured for blog articles');
  }

  if (!blogPool) {
    blogPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
      max: Number(process.env.PG_BLOG_POOL_MAX || process.env.PG_POOL_MAX || (isProductionBuild() ? 1 : 10)),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  return blogPool;
}

// PostgreSQL Article type (maps to articles table)
export interface Article {
  id: number;
  article_key: string;
  city: string;
  state: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  content_md: string;
  featured_image: string | null;
  faq_jsonld: any;
  data_snapshot: any;
  listing_count: number;
  original_title: string | null;
  created_at: Date;
  updated_at: Date;
}

// Mapped type for frontend (compatible with existing BlogPost interface)
export interface BlogArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  slug: string;
  category?: string;
  city?: string;
  tags: string[];
  readingTime?: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  schema_markup?: any;
  status: 'published';
  featured: boolean;
  author?: {
    name: string;
    organization: string;
  };
  data_snapshot?: {
    market_stats?: {
      total_listings: number;
      median_price: number;
      min_price: number;
      max_price: number;
      median_price_per_sqft: number;
    };
    [key: string]: any;
  };
}

export interface BlogSitemapArticle {
  slug: string;
  publishedAt: string;
  updatedAt: string;
}

// Map PostgreSQL article to frontend BlogArticle format
function mapArticleToBlog(article: Article): BlogArticle {
  // Calculate reading time from markdown content
  const words = article.content_md.split(/\s+/).length;
  const readingTime = Math.ceil(words / 200);

  // Extract tags from content (look for common real estate terms)
  const tags: string[] = [];
  const content = article.content_md.toLowerCase();
  if (content.includes('luxury')) tags.push('Luxury Homes');
  if (content.includes('beachfront') || content.includes('beach')) tags.push('Beachfront');
  if (content.includes('investment')) tags.push('Investment');
  if (content.includes('market')) tags.push('Market Trends');
  if (article.city) tags.push(article.city);

  // Sanitize content: replace localhost URLs with relative paths
  // This fixes any AI-generated content that includes localhost:3000 links
  let sanitizedContent = article.content_md;

  // Replace localhost URLs in markdown links: [text](http://localhost:3000/path) -> [text](/path)
  sanitizedContent = sanitizedContent.replace(
    /\[([^\]]+)\]\(https?:\/\/localhost:3000([^)]*)\)/gi,
    '[$1]($2)'
  );

  // Replace localhost URLs in HTML anchor tags: <a href="http://localhost:3000/path"> -> <a href="/path">
  sanitizedContent = sanitizedContent.replace(
    /(<a\s+[^>]*href=["'])https?:\/\/localhost:3000([^"']*)(["'][^>]*>)/gi,
    '$1$2$3'
  );

  // Replace plain localhost URLs that might appear in text
  sanitizedContent = sanitizedContent.replace(
    /https?:\/\/localhost:3000\//gi,
    '/'
  );

  const rawImage = (article.featured_image || "").trim();
  
  // Handle the old wrong path from cron job
  const correctedImage = rawImage === '/images/placeholder-16x9.png' ? '' : rawImage;
  
  // Use centralized placeholder system for consistent, validated images
  const imageUrl = validateImageUrl(
    correctedImage,
    'blog',
    article.id.toString(),
    article.city
  );

  return {
    id: article.id.toString(),
    title: article.meta_title,
    summary: article.meta_description,
    content: sanitizedContent,
    // Use DB-provided image when valid; otherwise fall back to a local placeholder.
    imageUrl,
    slug: article.slug,
    category: 'Real Estate',
    city: article.city,
    tags: tags.slice(0, 5),
    readingTime,
    publishedAt: article.created_at.toISOString(),
    createdAt: article.created_at.toISOString(),
    updatedAt: article.updated_at.toISOString(),
    schema_markup: article.faq_jsonld,
    status: 'published',
    featured: false,
    author: {
      name: 'Crown Coastal Homes',
      organization: 'Crown Coastal Homes',
    },
    data_snapshot: article.data_snapshot,
  };
}

// Fetch all published articles
export async function getPublishedArticles(options?: {
  limit?: number;
  skip?: number;
  city?: string;
}): Promise<{ articles: BlogArticle[]; total: number }> {
  const { limit = 50, skip = 0, city } = options || {};

  if (!process.env.DATABASE_URL) {
    return { articles: [], total: 0 };
  }

  try {
    let query = `SELECT * FROM articles WHERE ${BLOG_PUBLICATION_WHERE}`;
    const params: any[] = [];

    if (city) {
      query += ' AND LOWER(city) = LOWER($1)';
      params.push(city);
    }

    query += ' ORDER BY created_at DESC';

    // Get total count
    const countQuery = city
      ? `SELECT COUNT(*) FROM articles WHERE ${BLOG_PUBLICATION_WHERE} AND LOWER(city) = LOWER($1)`
      : `SELECT COUNT(*) FROM articles WHERE ${BLOG_PUBLICATION_WHERE}`;
    const pool = getBlogPool();
    const countResult = await pool.query(countQuery, city ? [city] : []);
    const total = parseInt(countResult.rows[0].count);

    // Get articles with pagination
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, skip);

    const result = await pool.query(query, params);
    const articles = result.rows.map(mapArticleToBlog);

    return { articles, total };
  } catch (error) {
    console.error('Error fetching articles from PostgreSQL:', error);
    throw error;
  }
}

export async function getPublishedArticleSitemapRows(
  limit = 45000
): Promise<BlogSitemapArticle[]> {
  const pool = getBlogPool();
  const result = await pool.query(
    `SELECT slug, created_at, updated_at, meta_title, meta_description, content_md, data_snapshot
     FROM articles
     WHERE slug IS NOT NULL AND slug <> '' AND ${BLOG_PUBLICATION_WHERE}
     ORDER BY COALESCE(updated_at, created_at) DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows.filter((row) => !requiresBlogFinancialReview({
    title: row.meta_title, summary: row.meta_description, content: row.content_md, data_snapshot: row.data_snapshot,
  })).map((row) => {
    const createdAt = row.created_at instanceof Date
      ? row.created_at
      : new Date(row.created_at);
    const updatedAt = row.updated_at
      ? row.updated_at instanceof Date
        ? row.updated_at
        : new Date(row.updated_at)
      : createdAt;

    return {
      slug: row.slug,
      publishedAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  });
}

// Fetch single article by slug
export async function getArticleBySlug(slug: string): Promise<BlogArticle | null> {
  try {
    const pool = getBlogPool();
    const result = await pool.query(
      `SELECT * FROM articles WHERE slug = $1 AND ${BLOG_PUBLICATION_WHERE} LIMIT 1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapArticleToBlog(result.rows[0]);
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    throw error;
  }
}

// Health check
export async function checkBlogDatabaseConnection(): Promise<boolean> {
  try {
    const pool = getBlogPool();
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Blog database connection error:', error);
    return false;
  }
}
