import { NextRequest, NextResponse } from "next/server";
import { pgHealthCheck } from "@/lib/db";
import { SITE_DOMAIN, SITE_NAME, SITE_URL } from "@/lib/constants/site";
import {
  isTrestleConfigured,
  trestleHealthCheck,
} from "@/lib/trestle-property-fallback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckState = "ok" | "degraded" | "skipped";

interface MonitoringCheck {
  status: CheckState;
  message?: string;
  latencyMs?: number;
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const deep = request.nextUrl.searchParams.get("deep") === "1";
  const listingDataChecks = deep
    ? await getListingDataChecks()
    : {
        database: { status: "skipped", message: "Pass ?deep=1 to run database check" } as MonitoringCheck,
        listingData: { status: "skipped", message: "Pass ?deep=1 to run listing source check" } as MonitoringCheck,
      };
  const checks: Record<string, MonitoringCheck> = {
    app: { status: "ok", message: "Application route responded" },
    environment: getEnvironmentCheck(),
    email: getConfiguredServiceCheck("RESEND_API_KEY", "Resend lead delivery"),
    clientMonitoring: getConfiguredServiceCheck("NEXT_PUBLIC_SENTRY_DSN", "Sentry browser monitoring"),
    database: listingDataChecks.database,
    listingData: listingDataChecks.listingData,
  };

  // PostgreSQL is the preferred store and Sentry is optional observability.
  // Neither should take the public service offline while the application,
  // lead delivery, and at least one listing source are healthy.
  const nonCriticalChecks = new Set(["database", "clientMonitoring"]);
  const status = Object.entries(checks).some(
    ([name, check]) => !nonCriticalChecks.has(name) && check.status === "degraded"
  )
    ? "degraded"
    : "ok";

  return NextResponse.json(
    {
      status,
      service: SITE_NAME,
      site: SITE_URL,
      domain: SITE_DOMAIN,
      generatedAt: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
      deployment: {
        environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
        region: process.env.VERCEL_REGION || "unknown",
        url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
        gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || null,
      },
      checks,
    },
    {
      status: status === "ok" ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

function getConfiguredServiceCheck(variableName: string, label: string): MonitoringCheck {
  if (process.env[variableName]) {
    return { status: "ok", message: label + " is configured" };
  }

  const isProduction = isProductionDeployment();
  return {
    status: isProduction ? "degraded" : "skipped",
    message: label + " is not configured",
  };
}

function getEnvironmentCheck(): MonitoringCheck {
  const hasDatabaseConfig = Boolean(process.env.DATABASE_URL || process.env.INSTANCE_CONNECTION_NAME);
  const hasListingSource = hasDatabaseConfig || isTrestleConfigured();
  const hasSiteUrl = Boolean(SITE_URL);

  if (!hasSiteUrl) {
    return { status: "degraded", message: "Site URL is not configured" };
  }

  if (!hasListingSource) {
    const isProduction = isProductionDeployment();
    return isProduction
      ? { status: "degraded", message: "No property listing source is configured" }
      : { status: "skipped", message: "Property data is optional outside production" };
  }

  return {
    status: "ok",
    message: hasDatabaseConfig
      ? "Required public and database env are present"
      : "Required public and Trestle fallback env are present",
  };
}

function isProductionDeployment(): boolean {
  return process.env.VERCEL === "1"
    ? process.env.VERCEL_ENV === "production"
    : process.env.NODE_ENV === "production";
}

async function getListingDataChecks(): Promise<{
  database: MonitoringCheck;
  listingData: MonitoringCheck;
}> {
  const startedAt = Date.now();

  try {
    const postgresOk = await withTimeout(pgHealthCheck(), 5000);
    const database: MonitoringCheck = {
      status: postgresOk ? "ok" : "degraded",
      message: postgresOk ? "Postgres responded" : "Postgres health check failed",
      latencyMs: Date.now() - startedAt,
    };

    if (postgresOk) {
      return {
        database,
        listingData: {
          status: "ok",
          message: "Property listings are served from Postgres",
          latencyMs: Date.now() - startedAt,
        },
      };
    }

    const fallbackStartedAt = Date.now();
    const fallbackOk = isTrestleConfigured()
      ? await withTimeout(trestleHealthCheck(), 10_000)
      : false;
    return {
      database,
      listingData: {
        status: fallbackOk ? "ok" : "degraded",
        message: fallbackOk
          ? "Postgres unavailable; Trestle fallback responded"
          : "Postgres and Trestle listing sources are unavailable",
        latencyMs: Date.now() - fallbackStartedAt,
      },
    };
  } catch (error) {
    return {
      database: {
        status: "degraded",
        message: error instanceof Error ? error.message : "Database health check timed out",
        latencyMs: Date.now() - startedAt,
      },
      listingData: {
        status: "degraded",
        message: "Property listing source health check failed",
        latencyMs: Date.now() - startedAt,
      },
    };
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}
