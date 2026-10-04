import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getPropertyDetail } from "@/lib/db/property-detail-repo";
import { isValidPropertyListingKey, propertyPathFor } from "@/lib/property-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isValidPropertyListingKey(id)) {
    return notFoundResponse();
  }

  const property = await getPropertyDetail(id);
  if (!property) {
    return notFoundResponse();
  }

  const destination = new URL(propertyPathFor(property), request.nextUrl.origin);
  destination.search = request.nextUrl.search;
  const response = NextResponse.redirect(destination, 308);
  response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  response.headers.set("CDN-Cache-Control", "public, s-maxage=3600");
  response.headers.set("Vercel-CDN-Cache-Control", "public, s-maxage=3600");
  return response;
}

function notFoundResponse() {
  return new NextResponse("Not Found", {
    status: 404,
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
}
