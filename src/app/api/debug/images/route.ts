import { NextResponse } from "next/server"

import { LOS_ANGELES_CITY_IMAGES } from "@/lib/los-angeles-city-images"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Lightweight debug endpoint (no filesystem access).
 *
 * A previous version used `fs.readdirSync` / walks under `public/County`.
 * Next.js output file tracing then bundled huge portions of `public/` into
 * this serverless function (~500MB+), exceeding Vercel's 300MB limit.
 *
 * For on-disk verification, use `node scripts/verify-images.js` locally.
 */

const LOS_ANGELES_SPOT_CHECKS = Object.entries(LOS_ANGELES_CITY_IMAGES).map(
  ([city, image]) => ({ city, imagePath: image.src }),
)

export async function GET() {
  return NextResponse.json({
    message: "No filesystem checks in this route (keeps Vercel bundle under size limits).",
    verifyLocally: "node scripts/verify-images.js",
    losAngelesSpotChecks: LOS_ANGELES_SPOT_CHECKS,
  })
}
