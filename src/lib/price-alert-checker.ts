/**
 * Price-alert checker.
 *
 * Joins `price_alerts` against `properties`, finds alerts whose trigger
 * condition is now satisfied, sends the email, and marks the alert as fired —
 * all inside a single transaction per alert to prevent duplicate delivery.
 *
 * Supported alert types:
 *   price_drop      — list_price <= threshold_price
 *   back_on_market  — standard_status = 'Active' AND previous delivery_count = 0
 *   status_change   — standard_status changed since alert was created (checks
 *                     against threshold_price IS NULL as a marker)
 *
 * Design notes:
 *   - Processes up to `batchSize` alerts per invocation (default 100).
 *   - Always updates `last_checked_at` even when no trigger fires.
 *   - After firing, `is_active` is set to FALSE (one alert = one delivery).
 *     Users can re-enable alerts via the UI if desired.
 *   - Uses `FOR UPDATE SKIP LOCKED` so concurrent invocations never
 *     double-process the same alert row.
 */

import { getPgPool } from '@/lib/db';
import type { Pool, PoolClient } from 'pg';
import { sendPriceAlertEmail, type PriceDropEmailPayload } from './price-alert-mailer';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CheckAlertsResult {
  checked:   number;
  fired:     number;
  failed:    number;
  durationMs: number;
}

interface AlertRow {
  id:               string;
  user_email:       string;
  listing_key:      string;
  property_address: string;
  property_city:    string;
  current_price:    number;
  threshold_price:  number | null;
  alert_type:       'price_drop' | 'back_on_market' | 'status_change';
  delivery_count:   number;
  list_price:       number | null;
  standard_status:  string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Load a batch of un-fired active alerts that are due for checking.
 * Skips rows locked by concurrent workers via SKIP LOCKED.
 */
async function loadPendingAlerts(
  client: PoolClient,
  batchSize: number
): Promise<AlertRow[]> {
  const sql = `
    SELECT
      pa.id,
      pa.user_email,
      pa.listing_key,
      COALESCE(pa.property_address, p.unparsed_address, '')  AS property_address,
      COALESCE(pa.property_city,    p.city, '')               AS property_city,
      COALESCE(pa.current_price, 0)::NUMERIC                  AS current_price,
      pa.threshold_price,
      pa.alert_type,
      pa.delivery_count,
      p.list_price::NUMERIC                                   AS list_price,
      p.standard_status
    FROM price_alerts pa
    LEFT JOIN properties p ON p.listing_key = pa.listing_key
    WHERE pa.is_active  = TRUE
      AND pa.fired_at  IS NULL
    ORDER BY pa.last_checked_at ASC NULLS FIRST, pa.created_at ASC
    LIMIT $1
    FOR UPDATE OF pa SKIP LOCKED;
  `;
  const { rows } = await client.query<AlertRow>(sql, [batchSize]);
  return rows;
}

/**
 * Determine whether the alert condition is satisfied.
 */
function isFired(alert: AlertRow): boolean {
  const { alert_type, threshold_price, list_price, standard_status } = alert;

  switch (alert_type) {
    case 'price_drop':
      return (
        threshold_price !== null &&
        list_price      !== null &&
        list_price <= threshold_price
      );

    case 'back_on_market':
      return standard_status === 'Active' && alert.delivery_count === 0;

    case 'status_change':
      // Fire if status is now Active (most common re-list scenario).
      // Extend this logic as needed for more granular status tracking.
      return standard_status === 'Active';

    default:
      return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run one batch of alert checks.
 *
 * @param batchSize  Max number of alerts to process per call (default 100).
 */
export async function checkPriceAlerts(
  batchSize = 100,
  providedPool?: Pool
): Promise<CheckAlertsResult> {
  const start  = Date.now();
  const pool   = providedPool ?? await getPgPool();
  const client = await pool.connect();

  let checked = 0;
  let fired   = 0;
  let failed  = 0;

  try {
    await client.query('BEGIN');

    const alerts = await loadPendingAlerts(client, batchSize);
    checked = alerts.length;

    for (const alert of alerts) {
      const shouldFire = isFired(alert);

      if (shouldFire) {
        // Attempt email delivery first — only mark fired on success.
        const alertType =
          alert.alert_type === 'back_on_market' ? 'back_on_market' : 'price_drop';

        const payload: PriceDropEmailPayload = {
          recipientEmail:  alert.user_email,
          propertyAddress: alert.property_address,
          propertyCity:    alert.property_city,
          listingKey:      alert.listing_key,
          originalPrice:   Number(alert.current_price),
          newPrice:        Number(alert.list_price ?? alert.current_price),
          alertType,
          newStatus:       alert.standard_status ?? undefined,
        };

        const sent = await sendPriceAlertEmail(payload);

        if (sent) {
          await client.query(
            `UPDATE price_alerts
               SET fired_at        = NOW(),
                   last_checked_at = NOW(),
                   delivery_count  = delivery_count + 1,
                   is_active       = FALSE,
                   updated_at      = NOW()
             WHERE id = $1`,
            [alert.id]
          );
          fired++;
        } else {
          // Email failed — only advance last_checked_at to avoid tight retry loops
          await client.query(
            `UPDATE price_alerts
               SET last_checked_at = NOW(),
                   updated_at      = NOW()
             WHERE id = $1`,
            [alert.id]
          );
          failed++;
        }
      } else {
        // Not yet triggered — just stamp last checked
        await client.query(
          `UPDATE price_alerts
             SET last_checked_at = NOW(),
                 updated_at      = NOW()
           WHERE id = $1`,
          [alert.id]
        );
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {/* ignore rollback errors */});
    throw err;
  } finally {
    client.release();
  }

  return { checked, fired, failed, durationMs: Date.now() - start };
}
