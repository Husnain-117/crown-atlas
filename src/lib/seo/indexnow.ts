import { SITE_DOMAIN, SITE_URL, absoluteUrl } from "@/lib/constants/site";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS_PER_REQUEST = 1000;

export type IndexNowResult = {
  submitted: boolean;
  status?: number;
  urlCount: number;
  message: string;
};

export function getIndexNowKey(): string | null {
  return process.env.INDEXNOW_KEY || process.env.NEXT_PUBLIC_INDEXNOW_KEY || null;
}

export function normalizeIndexNowUrls(urls: string[]): string[] {
  return Array.from(
    new Set(
      urls
        .map((url) => (url.startsWith("http") ? url : absoluteUrl(url)))
        .filter((url) => {
          try {
            return new URL(url).hostname.replace(/^www\./, "") === SITE_DOMAIN;
          } catch {
            return false;
          }
        })
        .slice(0, MAX_URLS_PER_REQUEST)
    )
  );
}

export async function submitIndexNowUrls(urls: string[]): Promise<IndexNowResult> {
  const key = getIndexNowKey();
  const normalizedUrls = normalizeIndexNowUrls(urls);

  if (!key) {
    return {
      submitted: false,
      urlCount: normalizedUrls.length,
      message: "INDEXNOW_KEY is not configured.",
    };
  }

  if (normalizedUrls.length === 0) {
    return {
      submitted: false,
      urlCount: 0,
      message: "No valid crowncoastalhomes.com URLs were provided.",
    };
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host: SITE_DOMAIN,
      key,
      keyLocation: `${SITE_URL}/indexnow-key.txt`,
      urlList: normalizedUrls,
    }),
  });

  return {
    submitted: response.ok,
    status: response.status,
    urlCount: normalizedUrls.length,
    message: response.ok
      ? "URLs submitted to IndexNow."
      : `IndexNow returned HTTP ${response.status}.`,
  };
}
