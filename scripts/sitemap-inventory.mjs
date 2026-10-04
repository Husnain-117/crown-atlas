const baseUrl = normalizeBaseUrl(process.argv[2] || process.env.SITEMAP_INVENTORY_BASE_URL || "https://crowncoastalhomes.com");
const canonicalBaseUrl = normalizeBaseUrl(process.env.SITEMAP_INVENTORY_CANONICAL_BASE_URL || "https://crowncoastalhomes.com");
const sitemapUrl = new URL("/sitemap.xml", baseUrl).toString();
// The root sitemap is intentionally curated. Listing URLs live in dedicated
// county sitemaps referenced by robots.txt and should not force thousands of
// generated landing pages into this file.
const minTotalUrls = Number(process.env.SITEMAP_INVENTORY_MIN_TOTAL_URLS || 100);
const maxTotalUrls = Number(process.env.SITEMAP_INVENTORY_MAX_TOTAL_URLS || 1000);
const minStrategicUrls = Number(process.env.SITEMAP_INVENTORY_MIN_STRATEGIC_URLS || 40);

const response = await fetch(sitemapUrl, {
  headers: {
    "User-Agent": "CrownCoastalSitemapInventory/1.0",
  },
});

if (!response.ok) {
  console.error(`Failed to fetch sitemap: ${response.status} ${sitemapUrl}`);
  process.exit(1);
}

const xml = await response.text();
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const uniqueUrls = [...new Set(urls)];
const duplicates = urls.length - uniqueUrls.length;
const counts = new Map();
const samples = new Map();

for (const url of uniqueUrls) {
  const family = classifyUrl(url);
  counts.set(family, (counts.get(family) || 0) + 1);
  if (!samples.has(family)) samples.set(family, url);
}

const strategicFamilies = [
  "californiaLanding",
  "buyCounty",
  "buyCity",
  "rentCounty",
  "rentCity",
  "neighborhood",
  "listing",
  "blog",
];

const strategicUrlCount = strategicFamilies.reduce((sum, family) => sum + (counts.get(family) || 0), 0);
const sortedCounts = [...counts.entries()].sort((a, b) => b[1] - a[1]);
const failures = [];

if (uniqueUrls.length < minTotalUrls) {
  failures.push(`Sitemap has ${uniqueUrls.length} unique URLs, expected at least ${minTotalUrls}`);
}

if (uniqueUrls.length > maxTotalUrls) {
  failures.push(`Sitemap has ${uniqueUrls.length} unique URLs, expected at most ${maxTotalUrls}`);
}

if (strategicUrlCount < minStrategicUrls) {
  failures.push(`Strategic URL count is ${strategicUrlCount}, expected at least ${minStrategicUrls}`);
}

if (duplicates > 0) {
  failures.push(`Sitemap has ${duplicates} duplicate URL entries`);
}

for (const required of [
  `${canonicalBaseUrl}/`,
  `${canonicalBaseUrl}/buy/san-diego`,
  `${canonicalBaseUrl}/buy/san-diego/san-diego-ca`,
  `${canonicalBaseUrl}/properties`,
]) {
  if (!uniqueUrls.includes(required)) {
    failures.push(`Missing required URL: ${required}`);
  }
}

for (const legacyUrl of uniqueUrls.filter((url) =>
  new URL(url).pathname.startsWith("/discover/") &&
  new URL(url).pathname !== "/discover/san-diego/neighborhoods"
)) {
  failures.push(`Legacy discover URL must not be in the sitemap: ${legacyUrl}`);
}

for (const duplicateHomeSearch of uniqueUrls.filter((url) =>
  /\/california\/[^/]+\/homes-for-sale$/.test(new URL(url).pathname)
)) {
  failures.push(`Duplicate city homes-for-sale URL must not be in the sitemap: ${duplicateHomeSearch}`);
}

console.log(`Sitemap inventory for ${sitemapUrl}`);
console.log(`total: ${urls.length}`);
console.log(`unique: ${uniqueUrls.length}`);
console.log(`duplicates: ${duplicates}`);
console.log(`strategic: ${strategicUrlCount}`);
console.log("");

for (const [family, count] of sortedCounts) {
  console.log(`${family.padEnd(22)} ${String(count).padStart(5)}  ${samples.get(family)}`);
}

if (failures.length > 0) {
  console.error("\nSitemap inventory failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("\nSitemap inventory passed");

function classifyUrl(value) {
  const pathname = new URL(value).pathname;
  const segments = pathname.split("/").filter(Boolean);

  if (pathname === "/") return "home";
  if (pathname === "/properties") return "listingIndex";
  if (pathname.startsWith("/properties/")) return "listing";
  if (pathname === "/blogs") return "blogIndex";
  if (pathname.startsWith("/blogs/")) return "blog";
  if (pathname.startsWith("/california/")) return "californiaLanding";
  if (pathname.startsWith("/neighborhoods/") && segments.length === 3) return "neighborhood";
  if (pathname.startsWith("/discover/") && segments.length === 2) {
    return isCountySlug(segments[1]) ? "discoverCounty" : "discoverCity";
  }
  if (pathname.startsWith("/discover/") && segments.length === 3) return "discoverCluster";
  if (pathname.startsWith("/buy/") && segments.length === 2) return isCountySlug(segments[1]) ? "buyCounty" : "buyCategory";
  if (pathname.startsWith("/buy/") && segments.length === 3) return "buyCity";
  if (pathname.startsWith("/rent/") && segments.length === 2) return isCountySlug(segments[1]) ? "rentCounty" : "rentCategory";
  if (pathname.startsWith("/rent/") && segments.length === 3) return "rentCity";
  if (pathname.startsWith("/sitemap-listings/")) return "sitemapListingRoute";
  if (pathname.endsWith(".txt") || pathname.endsWith(".xml")) return "crawlerFile";
  return "staticOrTool";
}

function isCountySlug(slug) {
  return [
    "san-diego",
    "orange",
    "los-angeles",
    "napa",
    "santa-barbara",
    "santa-clara",
    "san-francisco",
  ].includes(slug);
}

function normalizeBaseUrl(value) {
  const url = new URL(value);
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}
