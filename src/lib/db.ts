// src/lib/db.ts
// Unified PostgreSQL connection pool for Vercel serverless
// Uses global pool reuse to prevent connection exhaustion

import { Pool, PoolConfig } from "pg";
import { Connector, IpAddressTypes } from "@google-cloud/cloud-sql-connector";
import type { AuthClient } from "google-auth-library";
import { ExternalAccountClient } from "google-auth-library";
import { getVercelOidcToken } from "@vercel/oidc";

// Server-only export - prevents client-side usage
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Global pool for Vercel serverless reuse
// In serverless, each function invocation may reuse the same module instance
// We use a global variable to ensure pool reuse across invocations
declare global {
  var __pgPool: Pool | undefined;
  var __pgPoolPromise: Promise<Pool> | undefined;
}

let pool: Pool | null = null;
let poolPromise: Promise<Pool> | null = null;

function isProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build" || process.env.npm_lifecycle_event === "build";
}

function defaultPoolMax(): number {
  if (isProductionBuild()) return 1;
  return process.env.VERCEL === "1" ? 2 : 10;
}

function configuredPoolMax(): number {
  const configured = Number(process.env.PG_POOL_MAX || defaultPoolMax());
  const valid = Number.isFinite(configured) && configured > 0 ? Math.floor(configured) : defaultPoolMax();
  return process.env.VERCEL === "1" ? Math.min(valid, 2) : valid;
}

function tcpSslConfig(url: string): false | { rejectUnauthorized: boolean } {
  const override = process.env.DB_SSL?.trim().toLowerCase();
  if (["true", "require", "required"].includes(override || "")) {
    return { rejectUnauthorized: false };
  }
  if (["false", "disable", "disabled"].includes(override || "")) {
    return false;
  }

  const hostname = new URL(url).hostname;
  const isLocalhost = hostname === "127.0.0.1" || hostname === "localhost";
  const isDigitalOcean = hostname === "157.230.160.98" || hostname === "164.90.172.98";
  return isLocalhost || isDigitalOcean ? false : { rejectUnauthorized: false };
}

function pickIpType(): IpAddressTypes {
  const raw = (process.env.DB_IP_TYPE || "PUBLIC").toUpperCase();
  if (raw === "PRIVATE") return IpAddressTypes.PRIVATE;
  if (raw === "PSC") return IpAddressTypes.PSC;
  return IpAddressTypes.PUBLIC;
}

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

/**
 * Cloud SQL Connector on Vercel uses Workload Identity + OIDC and needs every var below.
 * If INSTANCE_CONNECTION_NAME is set but any of these are missing, we must not call
 * makeCloudSqlPool() — otherwise makeAuthClient() throws (e.g. Missing GCP_PROJECT_NUMBER).
 */
function hasFullCloudSqlConnectorConfig(): boolean {
  return !!(
    process.env.INSTANCE_CONNECTION_NAME &&
    process.env.GCP_PROJECT_NUMBER &&
    process.env.GCP_WORKLOAD_IDENTITY_POOL_ID &&
    process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID &&
    process.env.GCP_SERVICE_ACCOUNT_EMAIL
  );
}

export function isDatabaseConfigured(): boolean {
  return hasFullCloudSqlConnectorConfig() || Boolean(process.env.DATABASE_URL);
}

export function isDatabaseUnavailableDuringBuild(error: unknown): boolean {
  if (!isProductionBuild() || isDatabaseConfigured()) return false;
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('No DB configuration');
}

/**
 * Build an AuthClient backed by Vercel OIDC → Google STS (WIF) → SA impersonation.
 * Only used on Vercel with Cloud SQL Connector.
 */
async function makeAuthClient(): Promise<AuthClient> {
  const projectNumber = required("GCP_PROJECT_NUMBER");
  const poolId = required("GCP_WORKLOAD_IDENTITY_POOL_ID");
  const providerId = required("GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID");
  const saEmail = required("GCP_SERVICE_ACCOUNT_EMAIL");

  const options: any = {
    type: "external_account",
    audience: `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`,
    subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
    token_url: "https://sts.googleapis.com/v1/token",
    service_account_impersonation_url:
      `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${saEmail}:generateAccessToken`,
    subject_token_supplier: {
      getSubjectToken: getVercelOidcToken,
    },
  };

  const clientMaybe = ExternalAccountClient.fromJSON(options as any);
  if (!clientMaybe) {
    throw new Error("Failed to create ExternalAccountClient from JSON options");
  }
  (clientMaybe as any).scopes = ["https://www.googleapis.com/auth/sqlservice.admin"];
  return clientMaybe as unknown as AuthClient;
}

async function makeCloudSqlPool(): Promise<Pool> {
  const instance = required("INSTANCE_CONNECTION_NAME");
  console.log(`[DB] Initializing Cloud SQL pool with instance: ${instance}`);
  console.log(`[DB] Vercel environment: ${process.env.VERCEL === '1' ? 'Yes' : 'No'}`);

  const authClient = await makeAuthClient();
  const connector = new Connector({ auth: authClient as any });

  const clientOpts = await connector.getOptions({
    instanceConnectionName: instance,
    ipType: pickIpType(),
  });

  const cfg: PoolConfig = {
    ...clientOpts,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "redata",
    // Keep serverless pools conservative by default. Vercel may run multiple
    // lambdas/build workers at once, so a high per-instance pool easily exhausts
    // Postgres connection slots during static generation.
    max: configuredPoolMax(),
    min: Number(process.env.PG_POOL_MIN || 0),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30_000),
    connectionTimeoutMillis: Number(
      process.env.PG_CONNECTION_TIMEOUT_MS || process.env.PG_CONN_TIMEOUT_MS || 60_000
    ),
    maxUses: 7500,
    allowExitOnIdle: true,
    keepAlive: true,
    keepAliveInitialDelayMillis: 5_000,
    statement_timeout: 120_000,
    query_timeout: 120_000,
  } as any;

  const newPool = new Pool(cfg);
  
  // Test connection
  try {
    await newPool.query('SELECT 1 as test');
    console.log('[DB] ✅ Cloud SQL connection test successful');
  } catch (testError: any) {
    console.error('[DB] ❌ Cloud SQL connection test failed:', testError?.message || testError);
    throw new Error(`Cloud SQL connection failed: ${testError?.message || 'Unknown error'}`);
  }

  return newPool;
}

async function makeTcpPoolFromUrl(): Promise<Pool> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required for TCP connection");
  }

  console.log("[DB] Using direct TCP connection via DATABASE_URL");

  const newPool = new Pool({
    connectionString: url,
    ssl: tcpSslConfig(url),
    // Keep serverless pools conservative by default; override with env only
    // after confirming database max_connections and build concurrency.
    max: configuredPoolMax(),
    min: Number(process.env.PG_POOL_MIN || 0),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30_000),
    connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS || 60_000),
    maxUses: 7500,
    allowExitOnIdle: true,
    keepAlive: true,
    keepAliveInitialDelayMillis: 5_000,
    statement_timeout: 120_000,
    query_timeout: 120_000,
    application_name: process.env.VERCEL === "1" ? "crownlast-vercel" : "crownlast-node",
  } as any);

  // Test connection
  try {
    await newPool.query('SELECT 1 as test');
    console.log('[DB] ✅ TCP connection test successful');
  } catch (testError: any) {
    console.error('[DB] ❌ TCP connection test failed:', testError?.message || testError);
    throw new Error(`TCP connection failed: ${testError?.message || 'Unknown error'}`);
  }

  return newPool;
}

/**
 * Get PostgreSQL connection pool with Vercel serverless optimization.
 * Uses global pool reuse to prevent connection exhaustion.
 */
export async function getPool(): Promise<Pool> {
  // Use global pool in serverless (Vercel reuses module instances)
  if (typeof global !== 'undefined') {
    if (global.__pgPool) {
      return global.__pgPool;
    }
    if (global.__pgPoolPromise) {
      return global.__pgPoolPromise;
    }
  }

  // Use module-level pool as fallback
  if (pool) {
    return pool;
  }
  if (poolPromise) {
    return poolPromise;
  }

  // Create new pool
  const createPool = async (): Promise<Pool> => {
    try {
      const isVercel = process.env.VERCEL === '1';
      const isLocalDev = process.env.NODE_ENV === 'development' && !isVercel;

      let newPool: Pool;

      // Local development: Use DATABASE_URL directly (no Cloud SQL Connector needed)
      if (isLocalDev && process.env.DATABASE_URL) {
        console.log("[DB] Local development: using DATABASE_URL");
        newPool = await makeTcpPoolFromUrl();
      }
      // Cloud SQL Connector (Vercel OIDC → WIF) — only when *all* connector env vars are set
      else if (hasFullCloudSqlConnectorConfig()) {
        console.log("[DB] Using Cloud SQL Connector (full GCP + WIF config present)");
        newPool = await makeCloudSqlPool();
      }
      // INSTANCE_CONNECTION_NAME without full GCP/WIF: prefer DATABASE_URL so deploys don't crash
      else if (process.env.INSTANCE_CONNECTION_NAME && process.env.DATABASE_URL) {
        console.warn(
          "[DB] INSTANCE_CONNECTION_NAME is set but Cloud SQL connector env is incomplete " +
            "(need GCP_PROJECT_NUMBER, GCP_WORKLOAD_IDENTITY_POOL_ID, " +
            "GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID, GCP_SERVICE_ACCOUNT_EMAIL). " +
            "Using DATABASE_URL (TCP) instead."
        );
        newPool = await makeTcpPoolFromUrl();
      }
      // Fallback: Use DATABASE_URL (Neon, direct TCP to Cloud SQL IP, DigitalOcean, etc.)
      else if (process.env.DATABASE_URL) {
        console.log("[DB] Using DATABASE_URL (TCP)");
        newPool = await makeTcpPoolFromUrl();
      } else if (process.env.INSTANCE_CONNECTION_NAME) {
        throw new Error(
          "INSTANCE_CONNECTION_NAME is set but Cloud SQL connector is not fully configured " +
            "(missing GCP_PROJECT_NUMBER and related WIF vars) and DATABASE_URL is not set. " +
            "Either add all GCP_* env vars for the connector, or set DATABASE_URL for a direct TCP connection."
        );
      } else {
        throw new Error(
          "No DB configuration: set INSTANCE_CONNECTION_NAME + full GCP/WIF env for Cloud SQL Connector, or set DATABASE_URL (TCP)."
        );
      }

      console.log("[DB] ==============================================");

      // Store in both global and module-level for maximum reuse
      if (typeof global !== 'undefined') {
        global.__pgPool = newPool;
      }
      pool = newPool;

      // Handle pool errors
      newPool.on("error", (err: any) => {
        const code = (err && (err as any).code) || "";
        const low = String(err?.message || "").toLowerCase();
        const transient =
          ["connection terminated unexpectedly", "econnreset", "server closed the connection unexpectedly",
           "terminating connection due to administrator command", "could not receive data from server", "reset by peer",
           "connection lost", "connection timeout", "network error"]
            .some(t => low.includes(t)) || 
          ["57P01", "57P02", "57P03", "53300", "53400", "08006", "08000", "08003", "08P01"].includes(code);
        
        if (transient) {
          console.warn(`[DB] ⚠️ Transient database error detected: ${code || low.slice(0, 60)}`);
          // Reset pool on transient errors
          if (typeof global !== 'undefined') {
            global.__pgPool = undefined;
            global.__pgPoolPromise = undefined;
          }
          pool = null;
          poolPromise = null;
        } else {
          console.error('[DB] ❌ Database pool error:', err);
        }
      });

      console.log('[DB] ✅ Database connection pool initialized successfully');
      return newPool;
    } catch (err) {
      if (!isDatabaseUnavailableDuringBuild(err)) {
        console.error("[DB] ❌ Failed to initialize Postgres pool:", err);
      }
      // Clear promises on error
      if (typeof global !== 'undefined') {
        global.__pgPoolPromise = undefined;
      }
      poolPromise = null;
      throw err;
    }
  };

  // Create promise and store it
  poolPromise = createPool();
  if (typeof global !== 'undefined') {
    global.__pgPoolPromise = poolPromise;
  }

  return poolPromise;
}

// Back-compat alias
export const getPgPool = getPool;

/**
 * Health check for database connection
 */
export async function pgHealthCheck(): Promise<boolean> {
  try {
    const pool = await getPool();
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
