import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export type ServerRouteScope = "admin" | "cron";

interface AuthorizationResult {
  authorized: boolean;
  configured: boolean;
}

function constantTimeEqual(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    timingSafeEqual(expectedBuffer, expectedBuffer);
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
}

function getProvidedCredential(request: Pick<Request, "headers">): string | null {
  const authorization = request.headers.get("authorization")?.trim() ?? "";
  const bearerMatch = authorization.match(/^Bearer\s+(.+)$/i);

  return (
    bearerMatch?.[1]?.trim() ||
    request.headers.get("x-admin-key")?.trim() ||
    request.headers.get("x-cron-secret")?.trim() ||
    null
  );
}

function hasValidBasicAdminCredentials(
  request: Pick<Request, "headers">,
  environment: NodeJS.ProcessEnv,
): boolean {
  const expectedUser = environment.ADMIN_BASIC_USERNAME?.trim();
  const expectedPassword = environment.ADMIN_BASIC_PASSWORD;
  if (!expectedUser || !expectedPassword) return false;

  const authorization = request.headers.get("authorization")?.trim() ?? "";
  if (!authorization.startsWith("Basic ")) return false;

  try {
    const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator < 0) return false;

    return constantTimeEqual(decoded.slice(0, separator), expectedUser) &&
      constantTimeEqual(decoded.slice(separator + 1), expectedPassword);
  } catch {
    return false;
  }
}

export function isServerRequestAuthorized(
  request: Pick<Request, "headers">,
  scope: ServerRouteScope,
  environment: NodeJS.ProcessEnv = process.env,
): AuthorizationResult {
  const expectedCredentials =
    scope === "admin"
      ? [environment.ADMIN_API_SECRET, environment.CRON_SECRET]
      : [environment.CRON_SECRET];

  const configuredCredentials = Array.from(
    new Set(expectedCredentials.map((value) => value?.trim()).filter(Boolean) as string[]),
  );
  const basicAdminConfigured = scope === "admin" && Boolean(
    environment.ADMIN_BASIC_USERNAME?.trim() && environment.ADMIN_BASIC_PASSWORD,
  );

  if (configuredCredentials.length === 0 && !basicAdminConfigured) {
    return { authorized: false, configured: false };
  }

  if (scope === "admin" && hasValidBasicAdminCredentials(request, environment)) {
    return { authorized: true, configured: true };
  }

  const providedCredential = getProvidedCredential(request);
  if (!providedCredential) {
    return { authorized: false, configured: true };
  }

  return {
    authorized: configuredCredentials.some((expected) =>
      constantTimeEqual(providedCredential, expected),
    ),
    configured: true,
  };
}

/**
 * Returns a response when access must be denied, otherwise null.
 * Admin routes accept ADMIN_API_SECRET and retain CRON_SECRET as a migration fallback.
 */
export function authorizeServerRequest(
  request: Pick<Request, "headers">,
  scope: ServerRouteScope,
): NextResponse | null {
  const result = isServerRequestAuthorized(request, scope);

  if (!result.configured) {
    console.error(`[server-route-auth] Missing secret for ${scope} route`);
    return NextResponse.json(
      { error: "Server authentication is not configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!result.authorized) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  return null;
}
