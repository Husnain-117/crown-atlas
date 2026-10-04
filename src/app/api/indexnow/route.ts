import { NextRequest } from "next/server";
import { submitIndexNowUrls } from "@/lib/seo/indexnow";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.INDEXNOW_SECRET || process.env.CRON_SECRET;

  if (!secret) return process.env.NODE_ENV !== "production";

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const headerSecret = request.headers.get("x-indexnow-secret");

  return bearer === secret || headerSecret === secret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { urls?: string[]; url?: string } | null;
  const urls = Array.isArray(body?.urls) ? body.urls : body?.url ? [body.url] : [];
  const result = await submitIndexNowUrls(urls);

  return Response.json(result, { status: result.submitted ? 200 : 400 });
}

export async function GET() {
  return Response.json({
    ok: true,
    message: "POST { urls: string[] } with INDEXNOW_SECRET or CRON_SECRET to submit URLs to IndexNow.",
  });
}
