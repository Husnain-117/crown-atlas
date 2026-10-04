/**
 * CAL FIRE Fire Hazard Severity Zone (FHSZ) enricher
 *
 * Source: CAL FIRE ArcGIS REST API (public, no API key required)
 *   https://gis.fire.ca.gov/arcgis/rest/services/FHSZ/FireHazardSeverityZones/MapServer
 *
 * Layers queried:
 *   /2 — State Responsibility Area (SRA)  — queried first
 *   /0 — Local Responsibility Area (LRA)  — fallback for urban parcels
 *
 * Field: HAZ_CLASS → "Moderate" | "High" | "Very High"
 *
 * Columns written:
 *   fire_risk_score — 0–100 risk index (higher = greater wildfire hazard)
 *
 * HAZ_CLASS → score mapping:
 *   Very High → 90   High → 65   Moderate → 35   (no zone / non-wildland) → 0
 *
 * Non-California properties always receive fire_risk_score = 0 — CAL FIRE
 * zones cover only California parcels.
 *
 * Caching: 30 days — FHSZ maps change only after a formal CAL FIRE revision.
 */

import { rget, rset } from "@/lib/redis";
import type { ListingInput, EnrichmentPatch } from "./types";

const BASE_URL =
  "https://gis.fire.ca.gov/arcgis/rest/services/FHSZ/FireHazardSeverityZones/MapServer";

const SRA_URL = `${BASE_URL}/2/query`; // State Responsibility Area
const LRA_URL = `${BASE_URL}/0/query`; // Local Responsibility Area

/** Cache TTL: 30 days. */
const CACHE_TTL_S = 30 * 24 * 60 * 60;

const CA_IDENTIFIERS = new Set(["CA", "CALIFORNIA"]);

function cacheKey(lat: number, lng: number): string {
  return `enrich:v1:fire:${lat.toFixed(3)}:${lng.toFixed(3)}`;
}

/** Convert CAL FIRE HAZ_CLASS text to a 0–100 risk score. */
function hazClassToScore(haz: string): number {
  const h = haz.toUpperCase().trim();
  if (h.includes("VERY HIGH")) return 90;
  if (h.includes("HIGH"))      return 65;
  if (h.includes("MODERATE"))  return 35;
  return 0; // non-designated / non-wildland parcel
}

/**
 * Query a single CAL FIRE layer for the point's hazard zone.
 * Returns the HAZ_CLASS string, or `null` when the point is outside
 * every polygon in this layer (or the request fails).
 */
async function queryLayer(
  url: string,
  lat: number,
  lng: number
): Promise<string | null> {
  const params = new URLSearchParams({
    geometry:       JSON.stringify({ x: lng, y: lat }),
    geometryType:   "esriGeometryPoint",
    inSR:           "4326",
    spatialRel:     "esriSpatialRelIntersects",
    outFields:      "HAZ_CLASS",
    returnGeometry: "false",
    f:              "json",
  });

  const res = await fetch(`${url}?${params}`, {
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) return null;

  const data = await res.json() as {
    features?: Array<{ attributes: { HAZ_CLASS?: string } }>;
    error?: unknown;
  };

  if (data.error) return null;
  return data.features?.[0]?.attributes?.HAZ_CLASS ?? null;
}

export async function enrichWithCALFIRE(
  listing: ListingInput
): Promise<Partial<EnrichmentPatch>> {
  // ── Non-California fast-path ─────────────────────────────────────────────
  const stateRaw = (listing.state_or_province ?? "").trim().toUpperCase();
  if (stateRaw && !CA_IDENTIFIERS.has(stateRaw)) {
    // Outside CA — no CAL FIRE zone by definition.
    return { fire_risk_score: 0 };
  }

  // ── Redis cache hit ──────────────────────────────────────────────────────
  const key = cacheKey(listing.latitude, listing.longitude);
  const cached = await rget(key);
  if (cached) {
    try { return JSON.parse(cached) as Partial<EnrichmentPatch>; } catch { /* fall through */ }
  }

  // ── Query CAL FIRE layers ────────────────────────────────────────────────
  // SRA covers most rural/suburban parcels; LRA covers incorporated cities.
  let hazClass: string | null = null;

  try {
    hazClass = await queryLayer(SRA_URL, listing.latitude, listing.longitude);
  } catch { /* fall through to LRA */ }

  if (!hazClass) {
    try {
      hazClass = await queryLayer(LRA_URL, listing.latitude, listing.longitude);
    } catch { /* both layers failed or not in any zone */ }
  }

  const score = hazClass ? hazClassToScore(hazClass) : 0;
  const patch: Partial<EnrichmentPatch> = { fire_risk_score: score };

  await rset(key, JSON.stringify(patch), CACHE_TTL_S);
  return patch;
}
