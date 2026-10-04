import type { Pool } from "pg"

let schemaPromise: Promise<boolean> | null = null

const LISTING_HISTORY_SCHEMA_SQL = `
  ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS tax_annual_amount NUMERIC,
    ADD COLUMN IF NOT EXISTS hoa_fee_frequency TEXT;

  CREATE TABLE IF NOT EXISTS listing_history_events (
    id BIGSERIAL PRIMARY KEY,
    listing_key TEXT NOT NULL,
    event_type TEXT NOT NULL,
    field_name TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source TEXT NOT NULL DEFAULT 'CRMLS/Trestle',
    event_fingerprint TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_listing_history_listing_observed
    ON listing_history_events (listing_key, observed_at DESC);

  CREATE OR REPLACE FUNCTION capture_property_history_event()
  RETURNS TRIGGER AS $$
  DECLARE
    tracked_field TEXT;
    old_record JSONB;
    new_record JSONB;
    event_timestamp TIMESTAMPTZ;
    event_kind TEXT;
    fingerprint TEXT;
  BEGIN
    old_record := CASE WHEN TG_OP = 'INSERT' THEN '{}'::JSONB ELSE to_jsonb(OLD) END;
    new_record := to_jsonb(NEW);
    event_timestamp := CASE
      WHEN COALESCE(new_record ->> 'modification_timestamp', '') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
        THEN (new_record ->> 'modification_timestamp')::TIMESTAMPTZ
      ELSE NOW()
    END;

    FOREACH tracked_field IN ARRAY ARRAY[
      'list_price', 'standard_status', 'hoa_fee', 'hoa_fee_frequency',
      'tax_annual_amount', 'school_district', 'elementary_school',
      'middle_school', 'high_school', 'close_price', 'close_date'
    ]
    LOOP
      IF (TG_OP = 'INSERT' AND new_record -> tracked_field IS DISTINCT FROM 'null'::JSONB)
        OR (TG_OP = 'UPDATE' AND old_record -> tracked_field IS DISTINCT FROM new_record -> tracked_field)
      THEN
        event_kind := CASE
          WHEN tracked_field = 'list_price' THEN 'price'
          WHEN tracked_field = 'standard_status' THEN 'status'
          WHEN tracked_field IN ('hoa_fee', 'hoa_fee_frequency') THEN 'hoa'
          WHEN tracked_field = 'tax_annual_amount' THEN 'tax'
          WHEN tracked_field IN ('school_district', 'elementary_school', 'middle_school', 'high_school') THEN 'school'
          WHEN tracked_field IN ('close_price', 'close_date') THEN 'sale'
          ELSE 'listing'
        END;
        fingerprint := md5(
          NEW.listing_key || '|' || tracked_field || '|' || event_timestamp::TEXT || '|' ||
          COALESCE(new_record ->> tracked_field, 'null')
        );

        INSERT INTO listing_history_events (
          listing_key, event_type, field_name, old_value, new_value,
          observed_at, event_fingerprint
        ) VALUES (
          NEW.listing_key, event_kind, tracked_field,
          CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE old_record -> tracked_field END,
          new_record -> tracked_field, event_timestamp, fingerprint
        )
        ON CONFLICT (event_fingerprint) DO NOTHING;
      END IF;
    END LOOP;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS properties_capture_history ON properties;
  CREATE TRIGGER properties_capture_history
  AFTER INSERT OR UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION capture_property_history_event();
`

export async function ensureListingHistorySchema(pool: Pool): Promise<boolean> {
  if (!schemaPromise) {
    schemaPromise = pool
      .query(LISTING_HISTORY_SCHEMA_SQL)
      .then(() => true)
      .catch((error) => {
        schemaPromise = null
        console.error("[listing-history] Schema setup failed", error)
        return false
      })
  }

  return schemaPromise
}
