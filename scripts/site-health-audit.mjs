const baseUrl = normalizeBaseUrl(process.argv[2] || process.env.SITE_AUDIT_BASE_URL || "https://crowncoastalhomes.com");
const canonicalBaseUrl = normalizeBaseUrl(process.env.SITE_AUDIT_CANONICAL_BASE_URL || "https://crowncoastalhomes.com");
const minSitemapUrls = Number(process.env.SITE_AUDIT_MIN_SITEMAP_URLS || 1000);
const failures = [];

const pageChecks = [
  { path: "/", status: 200 },
  { path: "/robots.txt", status: 200 },
  { path: "/sitemap.xml", status: 200 },
  { path: "/llms.txt", status: 200 },
  { path: "/api/health", status: 200 },
  { path: "/api/monitoring/status", status: 200 },
  { path: "/about/data-methodology", status: 200 },
  { path: "/discover/san-diego", status: 200 },
  { path: "/properties/12647-trent-jones-lane-tustin-ca-92782/1170715833", status: 200 },
];

const redirectChecks = [
  {
    path: "/properties/property/1159659265",
    status: 308,
    locationIncludes: "/properties/listing/1159659265",
  },
  {
    path: "/homes/1159659265",
    status: 308,
    locationIncludes: "/properties/listing/1159659265",
  },
];

for (const check of pageChecks) {
  const result = await request(check.path);
  print(`${result.status}`, check.path, result.latencyMs);

  if (result.status !== check.status) {
    fail(`${check.path} expected ${check.status}, got ${result.status}`);
  }
}

for (const check of redirectChecks) {
  const result = await request(check.path, { redirect: "manual" });
  const location = result.headers.get("location") || "";
  print(`${result.status} -> ${location}`, check.path, result.latencyMs);

  if (result.status !== check.status) {
    fail(`${check.path} expected redirect ${check.status}, got ${result.status}`);
  }

  if (!location.includes(check.locationIncludes)) {
    fail(`${check.path} redirect location missing ${check.locationIncludes}`);
  }
}

await auditRobots();
await auditSitemap();
await auditLlms();
await auditMonitoringStatus();

if (failures.length > 0) {
  console.error("\nSite health audit failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`\nSite health audit passed for ${baseUrl}`);

async function auditRobots() {
  const text = await textFor("/robots.txt");
  if (!/Sitemap:\s*https:\/\/crowncoastalhomes\.com\/sitemap\.xml/i.test(text)) {
    fail("robots.txt does not advertise canonical sitemap.xml");
  }

  const oaiSearchBotBlock = text.match(/User-agent:\s*OAI-SearchBot[\s\S]*?(?=User-agent:|$)/i)?.[0] || "";
  if (!/Allow:\s*\//i.test(oaiSearchBotBlock)) {
    fail("robots.txt does not explicitly allow OAI-SearchBot");
  }
}

async function auditSitemap() {
  const text = await textFor("/sitemap.xml");
  const urls = [...text.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  console.log(`  sitemap urls: ${urls.length}`);

  if (urls.length < minSitemapUrls) {
    fail(`sitemap.xml has ${urls.length} URLs, expected at least ${minSitemapUrls}`);
  }

  const duplicates = findDuplicates(urls);
  if (duplicates.length > 0) {
    fail(`sitemap.xml has duplicate URLs: ${duplicates.slice(0, 5).join(", ")}`);
  }

  for (const required of [
    `${canonicalBaseUrl}/`,
    `${canonicalBaseUrl}/discover/san-diego`,
    `${canonicalBaseUrl}/properties`,
    `${canonicalBaseUrl}/about/data-methodology`,
  ]) {
    if (!urls.includes(required)) {
      fail(`sitemap.xml missing ${required}`);
    }
  }
}

async function auditLlms() {
  const text = await textFor("/llms.txt");
  if (text.length < 200) {
    fail("llms.txt is unexpectedly short");
  }

  if (!/Crown Coastal/i.test(text)) {
    fail("llms.txt does not mention Crown Coastal");
  }

  if (!text.includes("/about/data-methodology")) {
    fail("llms.txt does not link to the data methodology page");
  }

  if (!/CRMLS|Trestle/i.test(text)) {
    fail("llms.txt does not identify the listing data source");
  }

  if (text.includes("/discover/orange-county")) {
    fail("llms.txt contains the obsolete Orange County URL");
  }
}

async function auditMonitoringStatus() {
  const response = await request("/api/monitoring/status");
  const json = JSON.parse(await response.text());

  if (json.status !== "ok") {
    fail(`/api/monitoring/status returned status ${json.status}`);
  }

  if (json.checks?.database?.status !== "skipped") {
    fail("/api/monitoring/status should skip database by default");
  }
}

async function textFor(path) {
  const response = await request(path);
  return response.text();
}

async function request(path, init = {}) {
  const url = new URL(path, baseUrl);
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "User-Agent": "CrownCoastalSiteHealthAudit/1.0",
        ...(init.headers || {}),
      },
    });
    response.latencyMs = Date.now() - startedAt;
    return response;
  } catch (error) {
    fail(`${path} fetch failed: ${error instanceof Error ? error.message : error}`);
    return {
      status: "fetch failed",
      latencyMs: Date.now() - startedAt,
      headers: new Map(),
      text: async () => "",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeBaseUrl(value) {
  const url = new URL(value);
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }

  return [...duplicates];
}

function fail(message) {
  failures.push(message);
}

function print(status, path, latencyMs) {
  console.log(`${status} ${path} (${latencyMs}ms)`);
}
