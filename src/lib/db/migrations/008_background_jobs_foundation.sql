CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  label TEXT,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  token UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_notified TIMESTAMPTZ
);

ALTER TABLE saved_searches
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS label TEXT,
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS last_notified TIMESTAMPTZ;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'saved_searches'
      AND column_name = 'name'
  ) THEN
    ALTER TABLE saved_searches ALTER COLUMN name DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'saved_searches'
      AND column_name = 'email_alerts'
  ) THEN
    UPDATE saved_searches
    SET active = COALESCE(email_alerts, TRUE)
    WHERE active IS DISTINCT FROM COALESCE(email_alerts, TRUE);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'saved_searches'
      AND column_name = 'sent_at'
  ) THEN
    UPDATE saved_searches
    SET last_notified = sent_at
    WHERE last_notified IS NULL AND sent_at IS NOT NULL;
  END IF;
END $$;

UPDATE saved_searches SET token = gen_random_uuid() WHERE token IS NULL;
ALTER TABLE saved_searches ALTER COLUMN token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS saved_searches_token_unique
  ON saved_searches (token);
CREATE INDEX IF NOT EXISTS saved_searches_active_notification_idx
  ON saved_searches (active, last_notified, created_at);
CREATE INDEX IF NOT EXISTS saved_searches_email_created_idx
  ON saved_searches (LOWER(email), created_at DESC);

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS walk_score INTEGER,
  ADD COLUMN IF NOT EXISTS transit_score INTEGER,
  ADD COLUMN IF NOT EXISTS bike_score INTEGER,
  ADD COLUMN IF NOT EXISTS flood_zone TEXT,
  ADD COLUMN IF NOT EXISTS flood_risk_score INTEGER,
  ADD COLUMN IF NOT EXISTS fire_risk_score INTEGER,
  ADD COLUMN IF NOT EXISTS school_rating NUMERIC(4, 2),
  ADD COLUMN IF NOT EXISTS enrichment_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS enrichment_error TEXT;

CREATE INDEX IF NOT EXISTS properties_enrichment_queue_idx
  ON properties (enrichment_synced_at ASC NULLS FIRST, modification_timestamp DESC)
  WHERE standard_status = 'Active' AND latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE TABLE IF NOT EXISTS mortgage_rate_cache (
  series_id TEXT PRIMARY KEY,
  rate NUMERIC(6, 3) NOT NULL,
  observation_date DATE NOT NULL,
  source TEXT NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS background_job_runs (
  id BIGSERIAL PRIMARY KEY,
  job_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed', 'skipped', 'check')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS background_job_runs_job_started_idx
  ON background_job_runs (job_name, started_at DESC);
