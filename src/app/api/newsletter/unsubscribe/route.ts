import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getMongoDb } from "@/lib/mongodb"

const tokenSchema = z.string().uuid()

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  const parsed = tokenSchema.safeParse(token)
  const target = parsed.success
    ? `/unsubscribe?token=${encodeURIComponent(parsed.data)}`
    : "/unsubscribe?status=invalid"
  return NextResponse.redirect(new URL(target, request.url))
}

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null)
  const parsed = tokenSchema.safeParse(formData?.get("token"))
  if (!parsed.success) {
    return NextResponse.redirect(new URL("/unsubscribe?status=invalid", request.url), 303)
  }

  try {
    const db = await getMongoDb()
    const result = await db.collection("email_subscribers").updateOne(
      { unsubscribeToken: parsed.data },
      { $set: { status: "unsubscribed", updatedAt: new Date() } },
    )

    const status = result.matchedCount > 0 ? "success" : "invalid"
    return NextResponse.redirect(new URL(`/unsubscribe?status=${status}`, request.url), 303)
  } catch (error) {
    console.error("[newsletter-unsubscribe] Failed", error)
    return NextResponse.redirect(new URL("/unsubscribe?status=error", request.url), 303)
  }
}
