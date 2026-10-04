export const SITE_NAME = "Crown Coastal Homes";
export const SITE_DOMAIN = "crowncoastalhomes.com";
export const SITE_URL = `https://${SITE_DOMAIN}`;
export const SITE_LOGO_PATH = "/logo.svg";
export const SITE_LOGO_URL = `${SITE_URL}${SITE_LOGO_PATH}`;

export function getConfiguredSiteUrl(): string {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    SITE_URL;

  if (!candidate || /localhost|127\.0\.0\.1/i.test(candidate)) {
    return SITE_URL;
  }

  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase();

    if (
      host === SITE_DOMAIN ||
      host === `www.${SITE_DOMAIN}` ||
      host === "crowncostalhomes.com" ||
      host === "www.crowncostalhomes.com" ||
      host === "crowncoastal.com" ||
      host === "www.crowncoastal.com"
    ) {
      return SITE_URL;
    }
  } catch {
    return SITE_URL;
  }

  return SITE_URL;
}

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}
