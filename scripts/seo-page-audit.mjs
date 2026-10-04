const urls = process.argv.slice(2);

if (urls.length === 0) {
  console.error("Usage: npm run audit:seo -- <url> [url...]");
  process.exit(1);
}

const failures = [];

for (const url of urls) {
  const result = await auditUrl(url);
  printResult(result);

  if (result.issues.length > 0) {
    failures.push({ url, issues: result.issues });
  }
}

if (failures.length > 0) {
  console.error("\nSEO audit failed:");
  for (const failure of failures) {
    console.error(`- ${failure.url}`);
    for (const issue of failure.issues) {
      console.error(`  - ${issue}`);
    }
  }
  process.exit(1);
}

async function auditUrl(url) {
  let response;

  try {
    response = await fetch(url, {
      headers: {
        "User-Agent": "CrownCoastalSEOAudit/1.0",
      },
    });
  } catch (error) {
    return {
      url,
      status: "fetch failed",
      bytes: 0,
      title: "",
      description: "",
      canonical: "",
      h1s: [],
      jsonLdTypes: [],
      issues: [`Fetch failed: ${error?.cause?.code || error?.message || "unknown error"}`],
    };
  }

  const html = await response.text();
  const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description =
    firstMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
    firstMatch(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i);
  const canonical = firstMatch(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["'][^>]*>/i);
  const h1s = allMatches(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map(stripTags);
  const scripts = allMatches(html, /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const jsonLdDocuments = scripts.map(parseJsonLd);
  const jsonLdNodes = jsonLdDocuments.flatMap(readTopLevelJsonLdNodes);
  const jsonLdTypes = jsonLdNodes.flatMap(readJsonLdTypes);
  const allJsonLdObjects = jsonLdDocuments.flatMap(walkJsonLdObjects);
  const issues = [];

  if (response.status < 200 || response.status >= 400) issues.push(`HTTP status ${response.status}`);
  if (!title) issues.push("Missing <title>");
  if (title && title.length > 70) issues.push(`Title too long (${title.length})`);
  if (!description) issues.push("Missing meta description");
  if (description && description.length > 170) issues.push(`Meta description too long (${description.length})`);
  if (!canonical) issues.push("Missing canonical");
  if (h1s.length !== 1) issues.push(`Expected exactly one H1, found ${h1s.length}`);
  if (count(jsonLdTypes, "BreadcrumbList") > 1) issues.push("Multiple BreadcrumbList JSON-LD scripts");
  if (count(jsonLdTypes, "FAQPage") > 1) issues.push("Multiple FAQPage JSON-LD scripts");
  if (jsonLdDocuments.some((document) => document === null)) issues.push("Unparseable JSON-LD script");
  if (html.includes("+1-XXX-XXX-XXXX")) issues.push("Production HTML contains placeholder phone number");
  if (html.includes("reza@crowncoastal.com")) issues.push("Production HTML contains retired business email address");
  if (allJsonLdObjects.some(hasSelfServingReviewMarkup)) {
    issues.push("Business or organization JSON-LD contains self-serving review markup");
  }
  if (html.includes("127.0.0.1:7460")) issues.push("Production HTML contains local debug ingest URL");
  if (html.includes("#region agent log")) issues.push("Production HTML contains agent log markers");

  return {
    url,
    status: response.status,
    bytes: Buffer.byteLength(html),
    title,
    description,
    canonical,
    h1s,
    jsonLdTypes,
    issues,
  };
}

function firstMatch(value, regex) {
  const match = value.match(regex);
  return match ? decodeHtml(match[1]).replace(/\s+/g, " ").trim() : "";
}

function allMatches(value, regex) {
  return [...value.matchAll(regex)].map((match) => match[1] || "");
}

function stripTags(value) {
  return decodeHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseJsonLd(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readTopLevelJsonLdNodes(document) {
  if (!document) return [];
  if (Array.isArray(document)) return document;
  if (Array.isArray(document["@graph"])) return document["@graph"];
  return [document];
}

function readJsonLdTypes(node) {
  const types = node?.["@type"];
  if (Array.isArray(types)) return types.filter(Boolean);
  return types ? [types] : [];
}

function walkJsonLdObjects(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(walkJsonLdObjects);
  if (typeof value !== "object") return [];

  return [value, ...Object.values(value).flatMap(walkJsonLdObjects)];
}

function hasSelfServingReviewMarkup(node) {
  const businessTypes = ["LocalBusiness", "Organization", "RealEstateAgent"];
  const types = readJsonLdTypes(node);
  return businessTypes.some((type) => types.includes(type)) && Boolean(node.aggregateRating || node.review);
}

function count(values, expected) {
  return values.filter((value) => value === expected).length;
}

function printResult(result) {
  console.log(`\n${result.url}`);
  console.log(`  status: ${result.status}`);
  console.log(`  bytes: ${result.bytes}`);
  console.log(`  title: ${result.title}`);
  console.log(`  description: ${result.description}`);
  console.log(`  canonical: ${result.canonical}`);
  console.log(`  h1: ${result.h1s.join(" | ") || "(none)"}`);
  console.log(`  jsonLd: ${result.jsonLdTypes.join(", ") || "(none)"}`);
  console.log(`  issues: ${result.issues.length ? result.issues.join("; ") : "none"}`);
}
