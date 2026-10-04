/**
 * GET /api/admin/connection-tests
 *
 * Runs the full end-to-end connection test battery and returns a structured
 * JSON report.  Secured by CRON_SECRET (same as all cron + admin endpoints).
 *
 * Query params:
 *   ?category=redis|postgresql|mls_api|email|environment
 *     — filter to a single category (optional, runs all by default)
 *   ?format=summary
 *     — return only the summary + overall verdict (no per-test detail)
 *
 * Example:
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *        https://your-domain/api/admin/connection-tests
 *
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *        "https://your-domain/api/admin/connection-tests?category=mls_api"
 */

import { NextRequest, NextResponse } from "next/server";
import {
  runAllConnectionTests,
  type ConnectionTestReport,
  type TestResult,
} from "@/lib/connection-test-runner";
import { authorizeServerRequest } from "@/lib/server-route-auth";

export const runtime    = "nodejs";
export const dynamic    = "force-dynamic";
export const maxDuration = 90; // generous — parallel tests across all services

// ─────────────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const unauthorized = authorizeServerRequest(req, "admin");
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(req.url);
  const categoryFilter = searchParams.get("category") ?? null;
  const summaryOnly    = searchParams.get("format") === "summary";

  let report: ConnectionTestReport;
  try {
    report = await runAllConnectionTests();
  } catch (err) {
    // This should not happen — each test has its own try/catch.
    // Guard here in case of a bug in the runner itself.
    return NextResponse.json(
      {
        error:     "Connection test runner threw unexpectedly",
        message:   err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  // Apply optional category filter
  const filtered: ConnectionTestReport = categoryFilter
    ? {
        ...report,
        tests: report.tests.filter((t: TestResult) => t.category === categoryFilter),
      }
    : report;

  // Optional summary-only mode
  const body = summaryOnly
    ? {
        timestamp:   filtered.timestamp,
        environment: filtered.environment,
        overall:     filtered.overall,
        summary:     filtered.summary,
        durationMs:  filtered.durationMs,
        // Surface any failures even in summary mode
        failures: filtered.tests
          .filter((t: TestResult) => t.status === "fail")
          .map((t: TestResult) => ({ name: t.name, category: t.category, message: t.message })),
      }
    : filtered;

  // Use 200 for healthy/degraded, 503 for critical so uptime monitors can alert
  const httpStatus = filtered.overall === "critical" ? 503 : 200;

  return NextResponse.json(body, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-store",
      "X-Connection-Test-Overall": filtered.overall,
    },
  });
}
