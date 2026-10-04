/**
 * GreatSchools enricher
 *
 * GreatSchools v3 API: https://developer.greatschools.org/
 *
 * Required env var:
 *   GREAT_SCHOOLS_API_KEY — partner key from developer.greatschools.org
 *   (Requires a free partner application; not a standard developer key.)
 *
 * Columns written:
 *   school_rating (1–10)  — GreatSchools summary rating for the nearest
 *                           elementary school within ~0.5 km of the property.
 *                           School names come from Trestle — this enricher
 *                           adds ratings only.
 *
 * Caching: 30 days — GreatSchools ratings are refreshed annually.
 *
 * Graceful degradation: returns `{}` when GREAT_SCHOOLS_API_KEY is absent.
 */

import { rget, rset } from "@/lib/redis";
import type { ListingInput, EnrichmentPatch } from "./types";

const API_URL = "https://gs-api.greatschools.org/schools";

/** Cache TTL: 30 days — ratings change at most once per year. */
const CACHE_TTL_S = 30 * 24 * 60 * 60;

/** Full-name → 2-letter state abbreviation lookup (covers Trestle values). */
const STATE_TO_CODE: Record<string, string> = {
  california:   "CA", arizona:      "AZ", nevada:       "NV",
  oregon:       "OR", washington:   "WA", colorado:     "CO",
  utah:         "UT", idaho:        "ID", montana:      "MT",
  wyoming:      "WY", "new mexico": "NM", texas:        "TX",
  florida:      "FL", "new york":   "NY",
};

function toStateCode(raw?: string | null): string {
  if (!raw) return "CA";
  const trimmed = raw.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return STATE_TO_CODE[trimmed.toLowerCase()] ?? "CA";
}

function cacheKey(lat: number, lng: number): string {
  return `enrich:v1:gs:${lat.toFixed(3)}:${lng.toFixed(3)}`;
}

interface GsSchool {
  rating?: number | null;
  gradeLevels?: string;
}

export async function enrichWithGreatSchools(
  listing: ListingInput
): Promise<Partial<EnrichmentPatch>> {
  const apiKey = process.env.GREAT_SCHOOLS_API_KEY;
  if (!apiKey) return {};

  // ── Redis cache hit ──────────────────────────────────────────────────────
  const key = cacheKey(listing.latitude, listing.longitude);
  const cached = await rget(key);
  if (cached) {
    try { return JSON.parse(cached) as Partial<EnrichmentPatch>; } catch { /* fall through */ }
  }

  // ── Build request ────────────────────────────────────────────────────────
  const state = toStateCode(listing.state_or_province);
  const params = new URLSearchParams({
    state:           state,
    neighborhoodLat: String(listing.latitude),
    neighborhoodLon: String(listing.longitude),
    limit:           "5",
    levelCodes:      "e", // elementary schools carry strongest buyer weight
  });

  const res = await fetch(`${API_URL}?${params}`, {
    headers: { "X-API-Key": apiKey },
    signal:  AbortSignal.timeout(10_000),
  });

  if (!res.ok) throw new Error(`GreatSchools API HTTP ${res.status}`);

  const data = await res.json() as { schools?: GsSchool[] };
  const schools = data.schools ?? [];

  // Prefer the first school with a published numeric rating.
  const rated = schools.find(
    (s) => typeof s.rating === "number" && s.rating > 0
  );

  if (!rated) return {};

  const patch: Partial<EnrichmentPatch> = { school_rating: rated.rating! };
  await rset(key, JSON.stringify(patch), CACHE_TTL_S);
  return patch;
}
