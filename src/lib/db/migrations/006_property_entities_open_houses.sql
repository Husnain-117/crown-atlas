-- Stable physical-property identities and first-class Open House storage.
-- This migration is additive: MLS listing rows remain intact as episodes.

CREATE OR REPLACE FUNCTION crown_property_entity_key(
  address_value TEXT,
  postal_value TEXT,
  listing_value TEXT
) RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT md5(
    CASE
      WHEN BTRIM(COALESCE(address_value, '')) <> '' THEN
        REGEXP_REPLACE(LOWER(BTRIM(address_value)), '[^a-z0-9]+', '', 'g')
        || '|'
        || SPLIT_PART(BTRIM(COALESCE(postal_value, '')), '-', 1)
      ELSE 'listing|' || COALESCE(listing_value, '')
    END
  )
$$;

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS property_entity_key TEXT;

UPDATE properties
SET property_entity_key = crown_property_entity_key(unparsed_address, postal_code, listing_key)
WHERE property_entity_key IS NULL OR property_entity_key = '';

CREATE INDEX IF NOT EXISTS idx_properties_entity_key
  ON properties (property_entity_key);

CREATE INDEX IF NOT EXISTS idx_properties_active_county_entity
  ON properties (
    LOWER(TRIM(REGEXP_REPLACE(COALESCE(county_or_parish, ''), '\s+county$', '', 'i'))),
    property_entity_key,
    modification_timestamp DESC
  )
  WHERE standard_status = 'Active';

CREATE TABLE IF NOT EXISTS property_entities (
  entity_key TEXT PRIMARY KEY,
  canonical_address TEXT,
  city TEXT,
  state_or_province TEXT,
  postal_code TEXT,
  county_or_parish TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  representative_listing_key TEXT,
  current_listing_key TEXT,
  current_status TEXT,
  current_list_price NUMERIC,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_entities_location
  ON property_entities (state_or_province, county_or_parish, city, postal_code);

CREATE TABLE IF NOT EXISTS property_listing_episodes (
  listing_key TEXT PRIMARY KEY,
  entity_key TEXT NOT NULL REFERENCES property_entities(entity_key) ON DELETE CASCADE,
  standard_status TEXT,
  original_list_price NUMERIC,
  latest_list_price NUMERIC,
  close_price NUMERIC,
  listing_contract_date DATE,
  on_market_date DATE,
  close_date DATE,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modification_timestamp TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_listing_episodes_entity
  ON property_listing_episodes (entity_key, COALESCE(on_market_date, listing_contract_date) DESC);

WITH ranked AS (
  SELECT DISTINCT ON (property_entity_key)
    property_entity_key,
    listing_key,
    unparsed_address,
    city,
    state_or_province,
    postal_code,
    county_or_parish,
    latitude,
    longitude,
    standard_status,
    list_price,
    COALESCE(created_at, modification_timestamp, NOW()) AS first_seen_at,
    COALESCE(last_seen_ts, modification_timestamp, updated_at, NOW()) AS last_seen_at
  FROM properties
  WHERE property_entity_key IS NOT NULL
  ORDER BY
    property_entity_key,
    CASE WHEN standard_status = 'Active' THEN 0 ELSE 1 END,
    COALESCE(modification_timestamp, updated_at, created_at) DESC NULLS LAST,
    listing_key DESC
)
INSERT INTO property_entities (
  entity_key, canonical_address, city, state_or_province, postal_code,
  county_or_parish, latitude, longitude, representative_listing_key,
  current_listing_key, current_status, current_list_price, first_seen_at,
  last_seen_at, updated_at
)
SELECT
  property_entity_key, unparsed_address, city, state_or_province, postal_code,
  county_or_parish, latitude, longitude, listing_key, listing_key,
  standard_status, list_price, first_seen_at, last_seen_at, NOW()
FROM ranked
ON CONFLICT (entity_key) DO UPDATE SET
  canonical_address = EXCLUDED.canonical_address,
  city = EXCLUDED.city,
  state_or_province = EXCLUDED.state_or_province,
  postal_code = EXCLUDED.postal_code,
  county_or_parish = EXCLUDED.county_or_parish,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  representative_listing_key = EXCLUDED.representative_listing_key,
  current_listing_key = EXCLUDED.current_listing_key,
  current_status = EXCLUDED.current_status,
  current_list_price = EXCLUDED.current_list_price,
  first_seen_at = LEAST(property_entities.first_seen_at, EXCLUDED.first_seen_at),
  last_seen_at = GREATEST(property_entities.last_seen_at, EXCLUDED.last_seen_at),
  updated_at = NOW();

INSERT INTO property_listing_episodes (
  listing_key, entity_key, standard_status, original_list_price,
  latest_list_price, close_price, listing_contract_date, on_market_date,
  close_date, first_seen_at, last_seen_at, modification_timestamp, updated_at
)
SELECT
  listing_key,
  property_entity_key,
  standard_status,
  original_list_price,
  list_price,
  close_price,
  listing_contract_date,
  on_market_date,
  close_date,
  COALESCE(created_at, modification_timestamp, NOW()),
  COALESCE(last_seen_ts, modification_timestamp, updated_at, NOW()),
  modification_timestamp,
  NOW()
FROM properties
WHERE property_entity_key IS NOT NULL
ON CONFLICT (listing_key) DO UPDATE SET
  entity_key = EXCLUDED.entity_key,
  standard_status = EXCLUDED.standard_status,
  original_list_price = COALESCE(property_listing_episodes.original_list_price, EXCLUDED.original_list_price),
  latest_list_price = EXCLUDED.latest_list_price,
  close_price = EXCLUDED.close_price,
  listing_contract_date = EXCLUDED.listing_contract_date,
  on_market_date = EXCLUDED.on_market_date,
  close_date = EXCLUDED.close_date,
  last_seen_at = GREATEST(property_listing_episodes.last_seen_at, EXCLUDED.last_seen_at),
  modification_timestamp = EXCLUDED.modification_timestamp,
  updated_at = NOW();

CREATE OR REPLACE FUNCTION crown_set_property_entity_key()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.property_entity_key := crown_property_entity_key(
    NEW.unparsed_address,
    NEW.postal_code,
    NEW.listing_key
  );
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS properties_set_entity_key ON properties;
CREATE TRIGGER properties_set_entity_key
BEFORE INSERT OR UPDATE OF unparsed_address, postal_code, listing_key
ON properties
FOR EACH ROW
EXECUTE FUNCTION crown_set_property_entity_key();

CREATE OR REPLACE FUNCTION crown_upsert_property_entity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  representative properties%ROWTYPE;
BEGIN
  SELECT *
  INTO representative
  FROM properties
  WHERE property_entity_key = NEW.property_entity_key
  ORDER BY
    CASE WHEN standard_status = 'Active' THEN 0 ELSE 1 END,
    COALESCE(modification_timestamp, updated_at, created_at) DESC NULLS LAST,
    listing_key DESC
  LIMIT 1;

  INSERT INTO property_entities (
    entity_key, canonical_address, city, state_or_province, postal_code,
    county_or_parish, latitude, longitude, representative_listing_key,
    current_listing_key, current_status, current_list_price, first_seen_at,
    last_seen_at, updated_at
  ) VALUES (
    representative.property_entity_key, representative.unparsed_address,
    representative.city, representative.state_or_province,
    representative.postal_code, representative.county_or_parish,
    representative.latitude, representative.longitude,
    representative.listing_key, representative.listing_key,
    representative.standard_status, representative.list_price,
    COALESCE(representative.created_at, representative.modification_timestamp, NOW()),
    COALESCE(representative.last_seen_ts, representative.modification_timestamp, NOW()), NOW()
  )
  ON CONFLICT (entity_key) DO UPDATE SET
    canonical_address = EXCLUDED.canonical_address,
    city = EXCLUDED.city,
    state_or_province = EXCLUDED.state_or_province,
    postal_code = EXCLUDED.postal_code,
    county_or_parish = EXCLUDED.county_or_parish,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    representative_listing_key = EXCLUDED.representative_listing_key,
    current_listing_key = EXCLUDED.current_listing_key,
    current_status = EXCLUDED.current_status,
    current_list_price = EXCLUDED.current_list_price,
    last_seen_at = GREATEST(property_entities.last_seen_at, EXCLUDED.last_seen_at),
    updated_at = NOW();

  INSERT INTO property_listing_episodes (
    listing_key, entity_key, standard_status, original_list_price,
    latest_list_price, close_price, listing_contract_date, on_market_date,
    close_date, first_seen_at, last_seen_at, modification_timestamp, updated_at
  ) VALUES (
    NEW.listing_key, NEW.property_entity_key, NEW.standard_status,
    NEW.original_list_price, NEW.list_price, NEW.close_price,
    NEW.listing_contract_date, NEW.on_market_date, NEW.close_date,
    COALESCE(NEW.created_at, NEW.modification_timestamp, NOW()),
    COALESCE(NEW.last_seen_ts, NEW.modification_timestamp, NOW()),
    NEW.modification_timestamp, NOW()
  )
  ON CONFLICT (listing_key) DO UPDATE SET
    entity_key = EXCLUDED.entity_key,
    standard_status = EXCLUDED.standard_status,
    latest_list_price = EXCLUDED.latest_list_price,
    close_price = EXCLUDED.close_price,
    listing_contract_date = EXCLUDED.listing_contract_date,
    on_market_date = EXCLUDED.on_market_date,
    close_date = EXCLUDED.close_date,
    last_seen_at = EXCLUDED.last_seen_at,
    modification_timestamp = EXCLUDED.modification_timestamp,
    updated_at = NOW();

  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS properties_upsert_entity ON properties;
CREATE TRIGGER properties_upsert_entity
AFTER INSERT OR UPDATE OF
  standard_status, list_price, original_list_price, close_price,
  listing_contract_date, on_market_date, close_date, modification_timestamp,
  unparsed_address, city, state_or_province, postal_code, county_or_parish,
  latitude, longitude, last_seen_ts
ON properties
FOR EACH ROW
EXECUTE FUNCTION crown_upsert_property_entity();

CREATE TABLE IF NOT EXISTS open_houses (
  open_house_key TEXT PRIMARY KEY,
  listing_key TEXT NOT NULL,
  open_house_date DATE,
  start_time TIME,
  end_time TIME,
  start_timestamp TIMESTAMPTZ,
  end_timestamp TIMESTAMPTZ,
  status TEXT,
  open_house_type TEXT,
  remarks TEXT,
  virtual_open_house_url TEXT,
  original_entry_timestamp TIMESTAMPTZ,
  modification_timestamp TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'CRMLS/Trestle',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_open_houses_listing_time
  ON open_houses (listing_key, start_timestamp, end_timestamp);

CREATE INDEX IF NOT EXISTS idx_open_houses_upcoming
  ON open_houses (start_timestamp, end_timestamp)
  WHERE LOWER(COALESCE(status, '')) NOT IN ('canceled', 'cancelled', 'deleted');

CREATE TABLE IF NOT EXISTS location_counties (
  county_id TEXT PRIMARY KEY,
  county_slug TEXT UNIQUE NOT NULL,
  county_name TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS location_cities (
  city_id TEXT PRIMARY KEY,
  county_id TEXT NOT NULL REFERENCES location_counties(county_id) ON DELETE CASCADE,
  city_slug TEXT NOT NULL,
  city_name TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (county_id, city_slug)
);

CREATE TABLE IF NOT EXISTS location_market_statistics (
  city_id TEXT PRIMARY KEY REFERENCES location_cities(city_id) ON DELETE CASCADE,
  active_listings INTEGER NOT NULL DEFAULT 0,
  median_price NUMERIC,
  avg_price NUMERIC,
  min_price NUMERIC,
  max_price NUMERIC,
  price_per_sqft NUMERIC,
  median_days_on_market NUMERIC,
  avg_days_on_market NUMERIC,
  houses_count INTEGER NOT NULL DEFAULT 0,
  condos_count INTEGER NOT NULL DEFAULT 0,
  townhomes_count INTEGER NOT NULL DEFAULT 0,
  under_300k_count INTEGER NOT NULL DEFAULT 0,
  under_500k_count INTEGER NOT NULL DEFAULT 0,
  under_750k_count INTEGER NOT NULL DEFAULT 0,
  under_1m_count INTEGER NOT NULL DEFAULT 0,
  under_2m_count INTEGER NOT NULL DEFAULT 0,
  over_2m_count INTEGER NOT NULL DEFAULT 0,
  pool_count INTEGER NOT NULL DEFAULT 0,
  waterfront_count INTEGER NOT NULL DEFAULT 0,
  ocean_view_count INTEGER NOT NULL DEFAULT 0,
  garage_count INTEGER NOT NULL DEFAULT 0,
  new_listings_7d INTEGER NOT NULL DEFAULT 0,
  new_listings_30d INTEGER NOT NULL DEFAULT 0,
  sold_30d INTEGER NOT NULL DEFAULT 0,
  median_sale_price_30d NUMERIC,
  sale_to_list_ratio_30d NUMERIC,
  months_supply NUMERIC,
  data_source TEXT NOT NULL DEFAULT 'CRMLS',
  stats_version INTEGER NOT NULL DEFAULT 2,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF TO_REGCLASS('public.city_statistics') IS NOT NULL THEN
    ALTER TABLE city_statistics
      ADD COLUMN IF NOT EXISTS city_id TEXT,
      ADD COLUMN IF NOT EXISTS county_slug TEXT,
      ADD COLUMN IF NOT EXISTS sold_30d INTEGER,
      ADD COLUMN IF NOT EXISTS median_sale_price_30d NUMERIC,
      ADD COLUMN IF NOT EXISTS sale_to_list_ratio_30d NUMERIC,
      ADD COLUMN IF NOT EXISTS months_supply NUMERIC,
      ADD COLUMN IF NOT EXISTS stats_version INTEGER NOT NULL DEFAULT 2;
  END IF;
END
$$;
