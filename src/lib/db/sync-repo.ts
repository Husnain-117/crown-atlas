import { getPgPool } from "@/lib/db";

export interface SyncJob {
  id: string;
  job_type: string;
  status: 'running' | 'success' | 'partial' | 'failed';
  started_at: Date;
  completed_at: Date | null;
  records_fetched: number;
  records_inserted: number;
  records_updated: number;
  records_failed: number;
  error_message: string | null;
  triggered_by: string;
}

export interface SyncMetrics {
  totalActive: number;
  staleActive: number;
  recentlyUpdated: number;
  lastSuccess: Date | null;
  isRunning: boolean;
  runningJobId: string | null;
  recentFailures: number;
}

/**
 * Get basic health metrics about the property sync DB.
 */
export async function getSyncMetrics(): Promise<SyncMetrics> {
  const pool = await getPgPool();
  const metrics: SyncMetrics = {
    totalActive: 0,
    staleActive: 0,
    recentlyUpdated: 0,
    lastSuccess: null,
    isRunning: false,
    runningJobId: null,
    recentFailures: 0,
  };

  try {
    // 1. Check properties table for freshness
    const propsResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE standard_status = 'Active')::int AS total_active,
        COUNT(*) FILTER (WHERE standard_status = 'Active' AND updated_at < NOW() - INTERVAL '30 days')::int AS stale_active,
        COUNT(*) FILTER (WHERE standard_status = 'Active' AND updated_at >= NOW() - INTERVAL '24 hours')::int AS recently_updated
      FROM properties
    `);
    
    if (propsResult.rows.length) {
      metrics.totalActive = propsResult.rows[0].total_active || 0;
      metrics.staleActive = propsResult.rows[0].stale_active || 0;
      metrics.recentlyUpdated = propsResult.rows[0].recently_updated || 0;
    }

    // 2. Check sync jobs
    const jobsResult = await pool.query(`
      SELECT
        status,
        completed_at,
        started_at,
        id
      FROM sync_jobs
      WHERE job_type = 'trestle_listing_delta'
      ORDER BY started_at DESC
      LIMIT 10
    `);

    for (const job of jobsResult.rows) {
      if (job.status === 'success' && !metrics.lastSuccess) {
        metrics.lastSuccess = job.completed_at;
      }
      if (job.status === 'running') {
        metrics.isRunning = true;
        metrics.runningJobId = job.id;
      }
      if (job.status === 'failed') {
        metrics.recentFailures++;
      }
    }
  } catch (err) {
    console.error("[sync-repo] Failed to fetch sync metrics:", err);
  }

  return metrics;
}

/**
 * Get recent sync jobs history.
 */
export async function getSyncHistory(limit = 20): Promise<SyncJob[]> {
  try {
    const pool = await getPgPool();
    const result = await pool.query(`
      SELECT *
      FROM sync_jobs
      WHERE job_type = 'trestle_listing_delta'
      ORDER BY started_at DESC
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  } catch (err) {
    console.error("[sync-repo] Failed to fetch sync history:", err);
    return [];
  }
}

/**
 * Clear any 'running' jobs that have been stuck for more than a given number of hours.
 * 
 * @param timeoutHours Formatted interval to consider a job stuck, e.g., "1 hour".
 * @returns Number of stuck jobs cleared.
 */
export async function clearStuckJobs(timeoutHours = '2 hours'): Promise<number> {
  try {
    const pool = await getPgPool();
    const result = await pool.query(`
      UPDATE sync_jobs
      SET status = 'failed',
          error_message = 'Job was stuck in running state for over ' || $1 || ' and was cleared.',
          updated_at = NOW(),
          completed_at = NOW()
      WHERE status = 'running'
        AND started_at < NOW() - $1::interval
    `, [timeoutHours]);
    
    return result.rowCount || 0;
  } catch (err) {
    console.error("[sync-repo] Failed to clear stuck jobs:", err);
    return 0;
  }
}
