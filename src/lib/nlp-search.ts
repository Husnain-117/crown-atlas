/**
 * NLP property search — converts free-text queries into structured
 * PropertySearchParams via OpenAI, then executes the search.
 *
 * Speed strategy:
 *   1. Hash the normalised query → Redis cache key (`nlp:v1:<sha256>`)
 *   2. Return immediately on cache HIT (parsed params + result)
 *   3. On MISS: call gpt-4o-mini with JSON response_format, parse, validate
 *   4. Cache the parsed params for 1 hour so identical queries never re-hit OpenAI
 *
 * The model is kept firmly in the JSON extraction lane — it never queries the
 * database directly and cannot execute arbitrary SQL.
 */

import crypto from 'crypto';
import OpenAI from 'openai';
import { rget, rset } from '@/lib/redis';
import { searchProperties, type PropertySearchParams } from '@/lib/db/property-repo';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Subset of PropertySearchParams the LLM is allowed to populate. */
export interface ParsedSearchIntent {
  city?:             string;
  county?:           string;
  state?:            string;
  minPrice?:         number;
  maxPrice?:         number;
  minBedrooms?:      number;
  maxBedrooms?:      number;
  minBathrooms?:     number;
  propertyType?:     string;
  propertyCategory?: string;
  hasPool?:          boolean;
  hasView?:          boolean;
  isWaterfront?:     boolean;
  minLivingArea?:    number;
  maxLivingArea?:    number;
  keywords?:         string;
}

export interface NlpSearchResult {
  intent: ParsedSearchIntent;
  /** true when the intent was served from cache */
  intentCached: boolean;
  properties: Awaited<ReturnType<typeof searchProperties>>;
}

// ─────────────────────────────────────────────────────────────────────────────
// OpenAI client (lazy singleton)
// ─────────────────────────────────────────────────────────────────────────────

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (_openai) return _openai;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
  _openai = new OpenAI({ apiKey });
  return _openai;
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a real estate search query parser for Crown Coastal Homes, a California-focused MLS platform.

Extract structured search parameters from the user's natural-language query and return them as a JSON object.

RULES:
- Only output valid JSON that matches the schema below. No prose, no markdown, no extra keys.
- All fields are optional. Omit any field that cannot be confidently inferred.
- Prices: extract as integer USD (e.g. "$1.2M" → 1200000, "800k" → 800000).
- Bedrooms/Bathrooms: extract minimum counts (e.g. "3+ beds" → minBedrooms: 3).
- propertyType: one of "Residential" | "ResidentialLease" | "Land" | "Commercial".
  Omit for ambiguous queries.
- propertyCategory: one of "house" | "condo" | "townhouse" | "manufactured".
  Omit when unclear.
- state: 2-letter abbreviation (e.g. "CA"). Default to "CA" for California city queries.
- For "under $X" use maxPrice only. For "over $X" use minPrice only.
- hasPool, hasView, isWaterfront: true only when explicitly mentioned.
- keywords: only use for phrases that don't map to any structured field.

OUTPUT SCHEMA (all fields optional):
{
  "city":             string,
  "county":           string,
  "state":            string,
  "minPrice":         number,
  "maxPrice":         number,
  "minBedrooms":      number,
  "maxBedrooms":      number,
  "minBathrooms":     number,
  "propertyType":     string,
  "propertyCategory": string,
  "hasPool":          boolean,
  "hasView":          boolean,
  "isWaterfront":     boolean,
  "minLivingArea":    number,
  "maxLivingArea":    number,
  "keywords":         string
}

EXAMPLES:
Query: "3 bedroom homes in San Diego under 800k"
Output: {"city":"San Diego","state":"CA","minBedrooms":3,"maxPrice":800000}

Query: "waterfront condo in Malibu with ocean view"
Output: {"city":"Malibu","state":"CA","propertyCategory":"condo","hasView":true,"isWaterfront":true}

Query: "luxury houses near Newport Beach with pool over 2 million"
Output: {"city":"Newport Beach","state":"CA","propertyCategory":"house","hasPool":true,"minPrice":2000000}

Query: "cheap rentals in LA 1 bed"
Output: {"city":"Los Angeles","state":"CA","propertyType":"ResidentialLease","minBedrooms":1}

Query: "2 bed 2 bath condo San Francisco under 1.5M"
Output: {"city":"San Francisco","state":"CA","propertyCategory":"condo","minBedrooms":2,"minBathrooms":2,"maxPrice":1500000}`;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Deterministic cache key from normalised query text. */
function queryCacheKey(query: string): string {
  const normalised = query.toLowerCase().trim().replace(/\s+/g, ' ');
  const hash = crypto.createHash('sha256').update(normalised).digest('hex').slice(0, 16);
  return `nlp:v1:${hash}`;
}

/** Type-safe numeric guard — reject NaN, Infinity, and unrealistic values. */
function safeNum(v: unknown, min: number, max: number): number | undefined {
  const n = Number(v);
  if (!isFinite(n) || n < min || n > max) return undefined;
  return Math.round(n);
}

/**
 * Validate and sanitise the raw JSON from OpenAI to prevent any injection or
 * type coercion attacks.  Only known string values pass the whitelist checks.
 */
function sanitiseIntent(raw: unknown): ParsedSearchIntent {
  if (typeof raw !== 'object' || raw === null) return {};
  const r = raw as Record<string, unknown>;

  const VALID_PROPERTY_TYPES = new Set([
    'Residential', 'ResidentialLease', 'Land', 'Commercial',
  ]);
  const VALID_CATEGORIES = new Set([
    'house', 'condo', 'townhouse', 'manufactured',
  ]);
  const VALID_STATES = new Set([
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
    'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
    'VA','WA','WV','WI','WY','DC',
  ]);

  const intent: ParsedSearchIntent = {};

  // String fields — strip HTML and limit length
  const strField = (v: unknown, maxLen = 100): string | undefined => {
    if (typeof v !== 'string') return undefined;
    const cleaned = v.replace(/<[^>]*>/g, '').trim().slice(0, maxLen);
    return cleaned || undefined;
  };

  const city = strField(r.city);
  if (city) intent.city = city;

  const county = strField(r.county);
  if (county) intent.county = county;

  const state = strField(r.state, 2)?.toUpperCase();
  if (state && VALID_STATES.has(state)) intent.state = state;

  const pt = strField(r.propertyType);
  if (pt && VALID_PROPERTY_TYPES.has(pt)) intent.propertyType = pt;

  const pc = strField(r.propertyCategory)?.toLowerCase();
  if (pc && VALID_CATEGORIES.has(pc)) intent.propertyCategory = pc;

  const kw = strField(r.keywords, 200);
  if (kw) intent.keywords = kw;

  // Numeric fields
  const minPrice = safeNum(r.minPrice, 0, 1e9);
  if (minPrice !== undefined) intent.minPrice = minPrice;

  const maxPrice = safeNum(r.maxPrice, 0, 1e9);
  if (maxPrice !== undefined) intent.maxPrice = maxPrice;

  const minBedrooms = safeNum(r.minBedrooms, 0, 20);
  if (minBedrooms !== undefined) intent.minBedrooms = minBedrooms;

  const maxBedrooms = safeNum(r.maxBedrooms, 0, 20);
  if (maxBedrooms !== undefined) intent.maxBedrooms = maxBedrooms;

  const minBathrooms = safeNum(r.minBathrooms, 0, 20);
  if (minBathrooms !== undefined) intent.minBathrooms = minBathrooms;

  const minLivingArea = safeNum(r.minLivingArea, 0, 100_000);
  if (minLivingArea !== undefined) intent.minLivingArea = minLivingArea;

  const maxLivingArea = safeNum(r.maxLivingArea, 0, 100_000);
  if (maxLivingArea !== undefined) intent.maxLivingArea = maxLivingArea;

  // Boolean fields (strict)
  if (r.hasPool      === true) intent.hasPool      = true;
  if (r.hasView      === true) intent.hasView      = true;
  if (r.isWaterfront === true) intent.isWaterfront = true;

  return intent;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core parse function
// ─────────────────────────────────────────────────────────────────────────────

async function parseIntent(query: string): Promise<{ intent: ParsedSearchIntent; cached: boolean }> {
  const cacheKey = queryCacheKey(query);

  // Cache HIT
  const cached = await rget(cacheKey);
  if (cached) {
    try {
      const intent = sanitiseIntent(JSON.parse(cached));
      return { intent, cached: true };
    } catch { /* fall through to OpenAI */ }
  }

  // Cache MISS — call OpenAI
  const ai = getOpenAI();
  const model = process.env.NLP_SEARCH_MODEL ?? 'gpt-4o-mini';

  const completion = await ai.chat.completions.create({
    model,
    temperature: 0,
    max_tokens:  256,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: query.slice(0, 500) }, // cap at 500 chars
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  const intent = sanitiseIntent(parsed);

  // Cache for 1 hour — identical queries never re-hit OpenAI
  void rset(cacheKey, JSON.stringify(intent), 3600);

  return { intent, cached: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse a natural-language search query and execute the resulting DB search.
 *
 * @param query    Free-text user query (e.g. "3 bed condo in San Diego under 800k")
 * @param limit    Max results to return (default 20, max 100)
 * @param cursor   Optional keyset cursor for pagination
 */
export async function nlpSearch(
  query: string,
  limit = 20,
  offset = 0
): Promise<NlpSearchResult> {
  const { intent, cached } = await parseIntent(query);

  const searchParams: PropertySearchParams = {
    ...intent,
    limit: Math.min(Math.max(1, limit), 100),
    offset: Math.max(0, offset),
    sort: 'updated',
  };

  const properties = await searchProperties(searchParams);

  return { intent, intentCached: cached, properties };
}
