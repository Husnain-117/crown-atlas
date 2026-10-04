export interface AdminPageAuthEnvironment {
  ADMIN_BASIC_USERNAME?: string
  ADMIN_BASIC_PASSWORD?: string
  ADMIN_API_SECRET?: string
  CRON_SECRET?: string
}

export interface AdminPageAuthResult {
  configured: boolean
  basicConfigured: boolean
  authorized: boolean
}

function constantTimeEqual(left: string, right: string): boolean {
  const length = Math.max(left.length, right.length)
  let mismatch = left.length ^ right.length

  for (let index = 0; index < length; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0)
  }

  return mismatch === 0
}

export function authorizeAdminPageRequest(
  request: Request,
  environment: AdminPageAuthEnvironment = process.env as AdminPageAuthEnvironment,
): AdminPageAuthResult {
  const expectedUser = environment.ADMIN_BASIC_USERNAME
  const expectedPassword = environment.ADMIN_BASIC_PASSWORD
  const basicConfigured = Boolean(expectedUser && expectedPassword)
  const apiSecrets = [environment.ADMIN_API_SECRET, environment.CRON_SECRET]
    .map((value) => value?.trim())
    .filter(Boolean) as string[]
  const configured = basicConfigured || apiSecrets.length > 0
  if (!configured) return { configured: false, basicConfigured: false, authorized: false }

  const authorization = request.headers.get("authorization")
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim()
  const providedApiSecret = bearer || request.headers.get("x-admin-key")?.trim()
  if (
    providedApiSecret &&
    apiSecrets.some((expected) => constantTimeEqual(providedApiSecret, expected))
  ) {
    return { configured: true, basicConfigured, authorized: true }
  }

  if (!basicConfigured || !expectedUser || !expectedPassword || !authorization?.startsWith("Basic ")) {
    return { configured: true, basicConfigured, authorized: false }
  }

  try {
    const decoded = atob(authorization.slice(6))
    const separator = decoded.indexOf(":")
    if (separator < 0) return { configured: true, basicConfigured, authorized: false }

    const authorized =
      constantTimeEqual(decoded.slice(0, separator), expectedUser) &&
      constantTimeEqual(decoded.slice(separator + 1), expectedPassword)

    return { configured: true, basicConfigured, authorized }
  } catch {
    return { configured: true, basicConfigured, authorized: false }
  }
}
