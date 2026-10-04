/**
 * FEMA Flood Zone enricher
 *
 * FEMA National Flood Hazard Layer (NFHL) REST API:
 *   https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query
 *
 * No API key required — public US government data.
 * Layer 28 = S_FLD_HAZ_AR (Special Flood Hazard Area polygons).
 *
 * Columns written:
 *   flood_zone       — raw FEMA zone code ("AE", "X", "VE", …)
 *   flood_risk_score — 0–100 risk index (higher = greater hazard)
 *
 * Zone → score mapping:
 *   V, VE                            → 95  (coastal SFHA — storm surge)
 *   A, AE, AH, AO, AR, AZ            → 80  (riverine SFHA — 1 % annual chance)
 *   X (shaded) / 0.2 % annual chance → 40  (moderate — 500-year flood)
 *   C, X (unshaded)                  → 10  (minimal hazard)
 *   D                                → 50  (undetermined)
 *   (no feature returned)            → 10  (outside any mapped SFHA)
 *
 * Caching: 30 days — flood maps change only with published FEMA amendments.
 */

import { rget, rset } from "@/lib/redis";
import type { ListingInput, EnrichmentPatch } from "./types";

const NFHL_URL =
  "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query";

/** Cache TTL: 30 days. */
const CACHE_TTL_S = 30 * 24 * 60 * 60;

function cacheKey(lat: number, lng: number): string {
  return `enrich:v1:fema:${lat.toFixed(3)}:${lng.toFixed(3)}`;
}

/** Derive a 0–100 risk score from the FEMA flood zone code and sub-type. */
function floodZoneToScore(zone: string, subtype?: string): number {
  const z = zone.toUpperCase().trim();
  if (z === "V" || z === "VE")  return 95;   // coastal SFHA — highest risk
  if (z.startsWith("A"))        return 80;   // riverine SFHA — 1 % annual chance
  if (z === "D")                return 50;   // undetermined — conservative
  if (z === "X" || z === "C") {
    // X-shaded (0.2 % / 500-year) = moderate; X-unshaded = minimal
    const sub = (subtype ?? "").toUpperCase();
    if (sub.includes("0.2") || sub.includes("500-YEAR") || sub.includes("500 YEAR")) {
      return 40;
    }
    return 10;
  }
  return 50; // unknown zone — treat as moderate
}

export async function enrichWithFEMAFlood(
  listing: ListingInput
): Promise<Partial<EnrichmentPatch>> {
  // ── Redis cache hit ──────────────────────────────────────────────────────
  const key = cacheKey(listing.latitude, listing.longitude);
  const cached = await rget(key);
  if (cached) {
    try { return JSON.parse(cached) as Partial<EnrichmentPatch>; } catch { /* fall through */ }
  }

  // ── Build request ────────────────────────────────────────────────────────
  const params = new URLSearchParams({
    // geometry is a JSON point object in WGS-84 (lon, lat)
    geometry:       JSON.stringify({ x: listing.longitude, y: listing.latitude }),
    geometryType:   "esriGeometryPoint",
    inSR:           "4326",
    spatialRel:     "esriSpatialRelIntersects",
    outFields:      "FLD_ZONE,ZONE_SUBTY",
    returnGeometry: "false",
    f:              "json",
  });

  const res = await fetch(`${NFHL_URL}?${params}`, {
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`FEMA NFHL HTTP ${res.status}`);

  const data = await res.json() as {
    features?: Array<{ attributes: { FLD_ZONE?: string; ZONE_SUBTY?: string } }>;
    error?: { message: string; code?: number };
  };

  // FEMA returns ArcGIS errors as 200 responses with an `error` field.
  if (data.error) throw new Error(`FEMA error ${data.error.code ?? ""}: ${data.error.message}`);

  // No feature = point is outside every mapped flood hazard area → minimal risk.
  const feature  = data.features?.[0];
  const zone     = feature?.attributes?.FLD_ZONE   ?? "X";
  const subtype  = feature?.attributes?.ZONE_SUBTY ?? "";
  const score    = floodZoneToScore(zone, subtype);

  const patch: Partial<EnrichmentPatch> = { flood_zone: zone, flood_risk_score: score };
  await rset(key, JSON.stringify(patch), CACHE_TTL_S);
  return patch;
}
