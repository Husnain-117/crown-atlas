-- Explicit location dimensions used by landing pages, filters, and reporting.
-- This migration is additive; legacy rows remain addressable for old content FKs.

ALTER TABLE location_cities
  ADD COLUMN IF NOT EXISTS location_type TEXT NOT NULL DEFAULT 'city';

CREATE INDEX IF NOT EXISTS idx_location_cities_type
  ON location_cities (location_type, county_id, city_slug);

CREATE TABLE IF NOT EXISTS location_zip_codes (
  zip_id TEXT PRIMARY KEY,
  postal_code TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (state, postal_code)
);

CREATE TABLE IF NOT EXISTS location_city_zip_codes (
  city_id TEXT NOT NULL REFERENCES location_cities(city_id) ON DELETE CASCADE,
  zip_id TEXT NOT NULL REFERENCES location_zip_codes(zip_id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (city_id, zip_id)
);

CREATE INDEX IF NOT EXISTS idx_location_city_zip_codes_zip
  ON location_city_zip_codes (zip_id, city_id);

CREATE TABLE IF NOT EXISTS location_neighborhoods (
  neighborhood_id TEXT PRIMARY KEY,
  parent_city_id TEXT NOT NULL REFERENCES location_cities(city_id) ON DELETE CASCADE,
  neighborhood_slug TEXT NOT NULL,
  neighborhood_name TEXT NOT NULL,
  source_field TEXT NOT NULL DEFAULT 'subdivision_name',
  match_pattern TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (parent_city_id, neighborhood_slug)
);

CREATE INDEX IF NOT EXISTS idx_location_neighborhoods_parent
  ON location_neighborhoods (parent_city_id, neighborhood_slug);
