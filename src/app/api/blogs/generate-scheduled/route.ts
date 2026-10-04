import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { authorizeServerRequest } from '@/lib/server-route-auth';
import { getPool } from '@/lib/db';
import { BLOG_DRAFT_INSTRUCTIONS, createBlogDraftReview, parseBlogDraft } from '@/lib/blog-editorial';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Read an env var and strip any Windows CRLF or surrounding whitespace. */
function env(key: string): string {
  return (process.env[key] ?? '').replace(/\r/g, '').trim();
}

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  const apiKey = env('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not set in environment');
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// ─────────────────────────────────────────────────────────────────────────────
// Large topic pool – city × angle combinations.
// This list grows the blog indefinitely; same city+topic re-runs monthly with
// fresh content because the slug includes a YYYY-MM suffix.
// ─────────────────────────────────────────────────────────────────────────────
const CITIES = [
  'San Diego', 'Los Angeles', 'Orange County', 'San Francisco',
  'Malibu', 'Santa Monica', 'La Jolla', 'Newport Beach', 'Beverly Hills',
  'Laguna Beach', 'Manhattan Beach', 'Redondo Beach', 'Huntington Beach',
  'Coronado', 'Carlsbad', 'Encinitas', 'Del Mar', 'Pacific Palisades',
  'Santa Barbara', 'Monterey', 'Carmel', 'Napa', 'Sonoma',
  'Palo Alto', 'Atherton', 'Sausalito', 'Mill Valley',
  'Rancho Palos Verdes', 'Palos Verdes Estates', 'Bel Air',
  'Brentwood', 'West Hollywood', 'Calabasas', 'Hidden Hills',
  'Irvine', 'Dana Point', 'San Clemente', 'Aliso Viejo',
  'Ventura', 'Oxnard', 'Santa Cruz', 'Half Moon Bay',
];

const TOPIC_ANGLES = [
  { topic: 'Luxury Real Estate',      imageQuery: 'luxury mansion california' },
  { topic: 'Investment Properties',    imageQuery: 'real estate investment property' },
  { topic: 'Beachfront Properties',    imageQuery: 'beachfront luxury home ocean' },
  { topic: 'Coastal Living',           imageQuery: 'coastal luxury home ocean view' },
  { topic: 'Real Estate Market Trends',imageQuery: 'real estate market modern home' },
  { topic: 'Home Buying Guide',        imageQuery: 'luxury home interior design' },
  { topic: 'Neighborhood Guide',       imageQuery: 'luxury neighborhood street upscale' },
  { topic: 'Waterfront Properties',    imageQuery: 'waterfront luxury home marina' },
  { topic: 'Comparing Home Layouts',   imageQuery: 'california home floor plan interior' },
  { topic: 'New Construction Homes',   imageQuery: 'new construction modern home' },
  { topic: 'Top School Districts',     imageQuery: 'suburban neighborhood homes school' },
  { topic: 'Vacation & Second Homes',  imageQuery: 'vacation home california coast' },
  { topic: 'International Buyer Guide',imageQuery: 'luxury real estate california international' },
  { topic: 'Condo & High-Rise Living', imageQuery: 'modern condo highrise urban' },
  { topic: 'Gated Communities',        imageQuery: 'gated community estate security' },
  { topic: 'Eco-Friendly Homes',       imageQuery: 'sustainable green home solar california' },
  { topic: 'Golf Course Communities',  imageQuery: 'golf course community homes california' },
  { topic: 'Historic & Architectural Homes', imageQuery: 'historic architectural home california' },
  { topic: 'Retirement & 55+ Living',  imageQuery: 'retirement community homes sunny' },
  { topic: 'Short-Term Rental Investment', imageQuery: 'airbnb vacation rental property' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Slug generator
// ─────────────────────────────────────────────────────────────────────────────
function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─────────────────────────────────────────────────────────────────────────────
// Image fetch: Pexels → Unsplash API → null  (source.unsplash.com is DEAD)
// ─────────────────────────────────────────────────────────────────────────────
async function fetchBestImage(query: string): Promise<string | null> {
  // 1. Pexels
  const pexelsKey = env('PEXELS_API_KEY');
  if (pexelsKey) {
    try {
      const page = Math.floor(Math.random() * 5) + 1;
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6&page=${page}`,
        { headers: { Authorization: pexelsKey } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.photos?.length > 0) {
          const pick = data.photos[Math.floor(Math.random() * Math.min(data.photos.length, 4))];
          console.log('[CRON] ✅ Pexels image fetched:', pick.src.large2x ? 'large2x' : 'large');
          return pick.src.large2x || pick.src.large || pick.src.original;
        }
        console.warn('[CRON] Pexels: no photos in response for query:', query);
      } else {
        console.warn('[CRON] Pexels: HTTP', res.status, 'for query:', query);
      }
    } catch (e) { console.warn('[CRON] Pexels fetch error:', (e as Error).message); }
  } else {
    console.log('[CRON] Pexels: PEXELS_API_KEY not set — skipping');
  }

  // 2. Unsplash proper API  (env helper trims CRLF/whitespace that can break reads)
  const unsplashKey = env('UNSPLASH_ACCESS_KEY');
  console.log(`[CRON] Unsplash key present: ${!!unsplashKey} (length ${unsplashKey.length})`);
  if (unsplashKey) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=8&orientation=landscape`,
        {
          headers: { Authorization: `Client-ID ${unsplashKey}` },
          signal: AbortSignal.timeout(10_000), // 10s hard timeout
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results?.length > 0) {
          const pick = data.results[Math.floor(Math.random() * Math.min(data.results.length, 5))];
          console.log('[CRON] ✅ Unsplash image fetched:', pick.urls.regular?.slice(0, 60));
          return pick.urls.regular || pick.urls.full;
        }
        console.warn('[CRON] Unsplash: 0 results for query:', query);
      } else {
        const body = await res.text().catch(() => '');
        console.warn(`[CRON] Unsplash: HTTP ${res.status} — ${body.slice(0, 200)}`);
      }
    } catch (e) { console.warn('[CRON] Unsplash fetch error:', (e as Error).message); }
  } else {
    console.warn('[CRON] Unsplash: UNSPLASH_ACCESS_KEY not set or empty — skipping');
  }

  console.warn('[CRON] ⚠️ No image could be fetched (both APIs returned nothing) — blog will be saved without image');
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// OpenAI blog content generation
// ─────────────────────────────────────────────────────────────────────────────
// Known-safe model names — gpt-5-mini / gpt-4-mini etc. do not exist.
const KNOWN_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];

async function generateContent(city: string, topic: string): Promise<{
  title: string; summary: string; tags: string[]; content: string;
}> {
  const rawModel = env('OPENAI_MODEL');
  // Only use the env model if it's a known valid name; otherwise default to gpt-4o-mini
  const model = KNOWN_MODELS.includes(rawModel) ? rawModel : 'gpt-4o-mini';
  if (rawModel && !KNOWN_MODELS.includes(rawModel)) {
    console.warn(`[CRON] OPENAI_MODEL="${rawModel}" is not a recognised model — using gpt-4o-mini instead. Fix your .env.local.`);
  }
  const now = new Date();
  const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prompt = `Generate a professional real estate blog post for Crown Coastal Homes, a luxury real estate agency specializing in Southern California coastal properties.

**City:** ${city}
**Topic:** ${topic}
**Month/Year:** ${monthYear}

**Requirements:**
- Engaging, professional English; approachable tone for affluent buyers
- ~800–1000 words (4-5 min read)
- Use markdown: # title, ## sections, - bullet points, **bold**
- Provide practical research questions and a useful next step for the named location
- Do not present the drafting month as the date of market observations

${BLOG_DRAFT_INSTRUCTIONS}

**Return ONLY this JSON (no markdown wrapper, no code fences):**
{
  "title": "SEO-optimised title (60-70 chars)",
  "summary": "1-2 sentence meta description (140-160 chars)",
  "tags": ["Tag1","Tag2","Tag3","Tag4"],
  "content": "full markdown body starting with # title"
}`;

  const msgs: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: 'You are a luxury real estate content writer. Output ONLY valid JSON.' },
    { role: 'user',   content: prompt },
  ];

  let completion: OpenAI.Chat.Completions.ChatCompletion;
  const openai = getOpenAIClient();
  try {
    completion = await openai.chat.completions.create({ model, messages: msgs });
  } catch (primaryErr: any) {
    console.warn(`[CRON] OpenAI primary model "${model}" failed: ${primaryErr.message} — retrying with gpt-4o-mini`);
    completion = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: msgs });
  }

  const raw = (completion.choices[0].message.content || '{}')
    .replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  return parseBlogDraft(JSON.parse(raw));
}

// ─────────────────────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest)  { return handleCron(req); }
export async function POST(req: NextRequest) { return handleCron(req); }

async function handleCron(req: NextRequest) {
  const t0 = Date.now();

  const unauthorized = authorizeServerRequest(req, 'cron');
  if (unauthorized) return unauthorized;

  console.log('[CRON] 🚀 Blog generation started at', new Date().toISOString());

  // ── Pre-flight env checks (fast-fail before any expensive calls) ───────────
  const openaiKey = env('OPENAI_API_KEY');
  if (!openaiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not set in environment' }, { status: 500 });
  }
  console.log('[CRON] ENV check - OpenAI:', !!openaiKey, '| Unsplash:', !!env('UNSPLASH_ACCESS_KEY'), '| Pexels:', !!env('PEXELS_API_KEY'));

  try {
    const pool = await getPool();
    await pool.query('SELECT 1');

    // ── Build the slug for today's pick (city + topic + YYYY-MM) ──────────
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const existingPosts = await pool.query<{ slug: string }>('SELECT slug FROM articles');
    const existingSlugs = new Set(existingPosts.rows.map((post) => post.slug));

    // Find a city+topic combo not yet published this month
    const shuffledCities  = [...CITIES].sort(() => Math.random() - 0.5);
    const shuffledTopics  = [...TOPIC_ANGLES].sort(() => Math.random() - 0.5);

    let chosenCity: string | null = null;
    let chosenAngle: typeof TOPIC_ANGLES[0] | null = null;
    let chosenSlug = '';

    outer:
    for (const city of shuffledCities) {
      for (const angle of shuffledTopics) {
        const candidateSlug = slugify(`${angle.topic} ${city} ${ym}`);
        if (!existingSlugs.has(candidateSlug)) {
          chosenCity  = city;
          chosenAngle = angle;
          chosenSlug  = candidateSlug;
          break outer;
        }
      }
    }

    if (!chosenCity || !chosenAngle) {
      console.log('[CRON] ℹ️ All city+topic combos already published this month');
      return NextResponse.json({ success: true, generated: false, message: 'All combos published this month' });
    }

    console.log(`[CRON] 📝 Generating: "${chosenAngle.topic}" for ${chosenCity}`);

    // ── Fetch image ───────────────────────────────────────────────────────
    const imageQuery = `${chosenAngle.imageQuery} ${chosenCity}`;
    const imageUrl   = await fetchBestImage(imageQuery);

    // ── Generate content ──────────────────────────────────────────────────
    const gen = await generateContent(chosenCity, chosenAngle.topic);
    console.log('[CRON] ✅ Content generated:', gen.title);

    const inserted = await pool.query<{ id: number }>(
      `INSERT INTO articles
         (article_key,city,state,slug,meta_title,meta_description,content_md,featured_image,faq_jsonld,data_snapshot,listing_count,created_at,updated_at)
       VALUES ($1,$2,'CA',$3,$4,$5,$6,$7,$8,$9,0,NOW(),NOW())
       ON CONFLICT (slug) DO NOTHING
       RETURNING id`,
      [
        chosenSlug,
        chosenCity,
        chosenSlug,
        gen.title,
        gen.summary,
        gen.content,
        imageUrl || '',
        '{}',
        JSON.stringify({ editorial: createBlogDraftReview() }),
      ],
    );
    const postId = inserted.rows[0]?.id;

    const duration = Date.now() - t0;
    console.log(`[CRON] ✅ Done in ${duration}ms — slug: ${chosenSlug}`);

    return NextResponse.json({
      success:  true,
      generated: Boolean(postId),
      published: false,
      status: 'draft',
      message: 'Saved for editorial review. Not published; verified sources and a documented review are required.',
      postId,
      slug:     chosenSlug,
      title:    gen.title,
      city:     chosenCity,
      topic:    chosenAngle.topic,
      imageUrl,
      duration: `${duration}ms`,
    });

  } catch (err: any) {
    console.error('[CRON] ❌ Fatal error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
