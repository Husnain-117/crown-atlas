import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { ApiAuthMiddleware } from "@/lib/api-auth-middleware"
import { authorizeServerRequest } from "@/lib/server-route-auth"
import { refreshLocationStatistics } from "@/lib/jobs/refresh-location-statistics"
import { PRIORITY_COUNTY_SLUGS } from "@/lib/seo/priority-locations"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 300

async function handler(req: NextRequest) {
  const unauthorized = authorizeServerRequest(req, "cron")
  if (unauthorized) return unauthorized

  try {
    const result = await refreshLocationStatistics()
    for (const county of PRIORITY_COUNTY_SLUGS) {
      revalidatePath(`/buy/${county}`)
    }

    return ApiAuthMiddleware.successResponse(
      result,
      `Refreshed exact market statistics for ${result.locations} configured locations.`
    )
  } catch (error) {
    console.error("[refresh-city-stats] Failed", error)
    return ApiAuthMiddleware.errorResponse(
      error instanceof Error ? error.message : "Location statistics refresh failed",
      500
    )
  }
}

export async function GET(req: NextRequest) {
  return handler(req)
}

export async function POST(req: NextRequest) {
  return handler(req)
}
