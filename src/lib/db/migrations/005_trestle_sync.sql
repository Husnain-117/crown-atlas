BEGIN;

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS modification_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_seen_ts TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_seen_active_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sync_source TEXT,
  ADD COLUMN IF NOT EXISTS price_change_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS on_market_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS close_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS close_price NUMERIC;

-- RESO permits half-spaces for parking and garages (for example 2.5).
-- The legacy import created these columns as INTEGER.
ALTER TABLE properties
  ALTER COLUMN parking_total TYPE NUMERIC USING parking_total::NUMERIC,
  ALTER COLUMN garage_spaces TYPE NUMERIC USING garage_spaces::NUMERIC,
  ALTER COLUMN carport_spaces TYPE NUMERIC USING carport_spaces::NUMERIC;

CREATE TABLE IF NOT EXISTS sync_jobs (
  id BIGSERIAL PRIMARY KEY,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'partial', 'failed', 'skipped')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  triggered_by TEXT NOT NULL DEFAULT 'systemd',
  records_fetched INTEGER NOT NULL DEFAULT 0,
  records_inserted INTEGER NOT NULL DEFAULT 0,
  records_updated INTEGER NOT NULL DEFAULT 0,
  records_deactivated INTEGER NOT NULL DEFAULT 0,
  records_failed INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sync_state (
  state_key TEXT PRIMARY KEY,
  state_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_jobs_type_started
  ON sync_jobs (job_type, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_sync_jobs_running
  ON sync_jobs (started_at)
  WHERE status = 'running';

CREATE INDEX IF NOT EXISTS idx_properties_modification_timestamp
  ON properties (modification_timestamp DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_properties_active_seen
  ON properties (last_seen_active_at DESC NULLS LAST)
  WHERE standard_status = 'Active';

CREATE INDEX IF NOT EXISTS idx_properties_deactivated
  ON properties (deactivated_at DESC NULLS LAST)
  WHERE standard_status IS DISTINCT FROM 'Active';

CREATE OR REPLACE VIEW sync_jobs_last_success AS
SELECT DISTINCT ON (job_type)
  job_type,
  id::TEXT AS id,
  completed_at,
  records_inserted,
  records_updated,
  duration_ms
FROM sync_jobs
WHERE status = 'success'
ORDER BY job_type, completed_at DESC NULLS LAST;

CREATE OR REPLACE VIEW sync_jobs_stale AS
SELECT *
FROM sync_jobs
WHERE status = 'running'
  AND started_at < NOW() - INTERVAL '30 minutes';

COMMIT;
