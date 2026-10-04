import { getAIFactsMarkdown } from "@/lib/seo/ai-facts";

export const revalidate = 3600;

export function GET() {
  return new Response(getAIFactsMarkdown(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
