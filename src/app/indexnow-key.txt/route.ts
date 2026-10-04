import { getIndexNowKey } from "@/lib/seo/indexnow";

export function GET() {
  const key = getIndexNowKey();

  if (!key) {
    return new Response("INDEXNOW_KEY is not configured.", { status: 404 });
  }

  return new Response(key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
