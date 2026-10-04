/**
 * Shared types for the enrichment pipeline.
 * Imported by every enricher module and the orchestrator.
 */

/** Minimum property data required to run any enricher. */
export interface ListingInput {
  listing_key:         string;
  latitude:            number;
  longitude:           number;
  unparsed_address?:   string | null;
  city?:               string | null;
  state_or_province?:  string | null;
  postal_code?:        string | null;
}

/**
 * Fields written by the enrichment pipeline.
 *
 * All fields are optional.  A missing / undefined field means
 * "leave the existing DB column unchanged" — the orchestrator uses
 * `COALESCE($n, existing_column)` so disabled enrichers never clobber
 * data from a prior successful run.
 */
export interface EnrichmentPatch {
  // ── Walk Score ──────────────────────────────────────────────────────────
  walk_score?:       number | null;
  transit_score?:    number | null;
  bike_score?:       number | null;

  // ── FEMA Flood ──────────────────────────────────────────────────────────
  /** Raw FEMA flood zone code, e.g. "AE", "X", "VE". */
  flood_zone?:       string | null;
  /** 0–100 risk index derived from flood_zone (higher = greater hazard). */
  flood_risk_score?: number | null;

  // ── CAL FIRE ────────────────────────────────────────────────────────────
  /** 0–100 risk index derived from CAL FIRE HAZ_CLASS (higher = greater hazard). */
  fire_risk_score?:  number | null;

  // ── GreatSchools ────────────────────────────────────────────────────────
  /** GreatSchools summary rating 1–10 for the nearest elementary school. */
  school_rating?:    number | null;
}

/** Uniform function signature shared by every enricher. */
export type EnricherFn = (listing: ListingInput) => Promise<Partial<EnrichmentPatch>>;
