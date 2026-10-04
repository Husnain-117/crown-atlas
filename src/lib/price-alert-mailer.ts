/**
 * Price-alert email composer and sender.
 *
 * Uses the same Resend delivery path as the website lead forms.
 * Each public function is intentionally thin — business logic lives in
 * price-alert-checker.ts; this module only handles HTML composition and delivery.
 */

import { sendEmail } from '@/lib/email';
import { propertyUrlFor } from '@/lib/property-url';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PriceDropEmailPayload {
  recipientEmail: string;
  propertyAddress: string;
  propertyCity: string;
  listingKey: string;
  originalPrice: number;
  newPrice: number;
  alertType: 'price_drop' | 'back_on_market' | 'status_change';
  newStatus?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML helpers
// ─────────────────────────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatPrice(n: number): string {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function priceDrop(original: number, current: number): string {
  if (original <= 0) return '';
  const pct = ((original - current) / original) * 100;
  return pct.toFixed(1) + '% below original';
}

// ─────────────────────────────────────────────────────────────────────────────
// Email templates
// ─────────────────────────────────────────────────────────────────────────────

function buildPriceDropHtml(p: PriceDropEmailPayload): string {
  const address   = escapeHtml(p.propertyAddress);
  const city      = escapeHtml(p.propertyCity);
  const original  = formatPrice(p.originalPrice);
  const current   = formatPrice(p.newPrice);
  const dropInfo  = priceDrop(p.originalPrice, p.newPrice);
  const listingUrl = propertyUrlFor({
    listing_key: p.listingKey,
    address: p.propertyAddress,
    city: p.propertyCity,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Price Drop Alert</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0f4c81;padding:24px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;">Crown Coastal Homes</h1>
            <p  style="margin:6px 0 0;color:#a8c8e8;font-size:14px;">Property Alert Notification</p>
          </td>
        </tr>

        <!-- Price drop banner -->
        <tr>
          <td style="background:#e8f4e8;padding:16px 32px;border-left:4px solid #28a745;">
            <p style="margin:0;font-size:15px;color:#155724;font-weight:bold;">
              &#x25BC;&nbsp; Price Reduced
              ${dropInfo ? `&mdash; <span style="color:#28a745;">${escapeHtml(dropInfo)}</span>` : ''}
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:16px;color:#333;">A property on your watchlist just dropped in price:</p>

            <table width="100%" cellpadding="12" cellspacing="0" style="background:#f9f9f9;border-radius:6px;margin:16px 0;">
              <tr>
                <td style="font-size:15px;color:#222;">
                  <strong>${address}</strong><br/>
                  <span style="color:#666;">${city}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-right:24px;">
                        <p style="margin:0;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:.5px;">Was</p>
                        <p style="margin:4px 0 0;font-size:20px;color:#999;text-decoration:line-through;">${original}</p>
                      </td>
                      <td>
                        <p style="margin:0;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:.5px;">Now</p>
                        <p style="margin:4px 0 0;font-size:24px;font-weight:bold;color:#28a745;">${current}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
              <tr>
                <td style="background:#0f4c81;border-radius:6px;padding:12px 28px;">
                  <a href="${listingUrl}" style="color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
                    View Listing &rarr;
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#999;">
              You received this because you set a price alert for this property.
              To manage your alerts, sign in to your account at crowncoastalhomes.com.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f0f0f0;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#aaa;">
              Crown Coastal Homes &bull; California Real Estate<br/>
              DRE #02211952 &bull; All alerts are informational only.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildBackOnMarketHtml(p: PriceDropEmailPayload): string {
  const address    = escapeHtml(p.propertyAddress);
  const city       = escapeHtml(p.propertyCity);
  const price      = formatPrice(p.newPrice);
  const listingUrl = propertyUrlFor({
    listing_key: p.listingKey,
    address: p.propertyAddress,
    city: p.propertyCity,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Back on Market Alert</title></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <tr><td style="background:#0f4c81;padding:24px 32px;">
          <h1 style="margin:0;color:#fff;font-size:22px;">Crown Coastal Homes</h1>
          <p style="margin:6px 0 0;color:#a8c8e8;font-size:14px;">Property Alert Notification</p>
        </td></tr>
        <tr><td style="background:#fff3cd;padding:16px 32px;border-left:4px solid #ffc107;">
          <p style="margin:0;font-size:15px;color:#856404;font-weight:bold;">&#x21A9;&nbsp; Back on Market</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:16px;color:#333;">A property you tracked is back on the market:</p>
          <table width="100%" cellpadding="12" style="background:#f9f9f9;border-radius:6px;">
            <tr><td>
              <strong style="font-size:15px;">${address}</strong><br/>
              <span style="color:#666;">${city}</span><br/>
              <span style="font-size:20px;font-weight:bold;color:#0f4c81;">${price}</span>
            </td></tr>
          </table>
          <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td style="background:#0f4c81;border-radius:6px;padding:12px 28px;">
              <a href="${listingUrl}" style="color:#fff;font-size:15px;font-weight:bold;text-decoration:none;">View Listing &rarr;</a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#999;">Manage your alerts at crowncoastalhomes.com.</p>
        </td></tr>
        <tr><td style="background:#f0f0f0;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#aaa;">Crown Coastal Homes &bull; DRE #02211952</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a price-alert notification email.
 * Returns `true` on success, `false` on failure (errors are logged, never thrown).
 */
export async function sendPriceAlertEmail(
  payload: PriceDropEmailPayload
): Promise<boolean> {
  try {
    let subject: string;
    let html: string;

    if (payload.alertType === 'back_on_market') {
      subject = `Back on Market: ${payload.propertyAddress}, ${payload.propertyCity}`;
      html    = buildBackOnMarketHtml(payload);
    } else {
      // price_drop (and status_change fallback)
      const drop   = priceDrop(payload.originalPrice, payload.newPrice);
      subject = `Price Drop${drop ? ' (' + drop + ')' : ''}: ${payload.propertyAddress}, ${payload.propertyCity}`;
      html    = buildPriceDropHtml(payload);
    }

    const text = `${subject}\n\nView listing: ${propertyUrlFor({
      listing_key: payload.listingKey,
      address: payload.propertyAddress,
      city: payload.propertyCity,
    })}`;

    const delivery = await sendEmail({
      to: payload.recipientEmail,
      subject,
      text,
      html,
    });
    return delivery.success;
  } catch (err) {
    console.error('[price-alert-mailer] Failed to send email', {
      listingKey: payload.listingKey,
      recipient:  payload.recipientEmail,
      error:      err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
