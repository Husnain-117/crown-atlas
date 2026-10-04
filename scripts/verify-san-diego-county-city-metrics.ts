/**
 * Verify San Diego County city data consistency: database count vs UI count.
 * All displayed values must come from getCityMetrics (single source of truth).
 * Run: npm run verify:san-diego-county
 * Requires DATABASE_URL or INSTANCE_CONNECTION_NAME in .env or .env.local
 *
 * @deprecated Prefer npm run verify:all-cities to validate every county and city.
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { getCountyCities } from "../src/lib/counties";
import { getCityMetrics } from "../src/lib/city-metrics";
import { searchProperties } from "../src/lib/db/property-repo";

const SD_COUNTY_SLUG = "san-diego";

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  San Diego County City Metrics Verification");
  console.log("  Source of truth: getCityMetrics({ citySlug, countySlug }, 'buy')");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const cities = getCountyCities(SD_COUNTY_SLUG);
  if (cities.length === 0) {
    console.log("No cities found for county slug:", SD_COUNTY_SLUG);
    process.exit(1);
  }

  console.log(`Validating ${cities.length} San Diego County cities...\n`);

  const results: Array<{
    name: string;
    slug: string;
    dbCount: number;
    searchTotal: number;
    medianPrice: number | null;
    match: boolean;
  }> = [];

  for (const city of cities) {
    const metrics = await getCityMetrics({ citySlug: city.slug, countySlug: SD_COUNTY_SLUG }, "buy");
    const searchResult = await searchProperties({
      city: city.zipCodes?.length ? undefined : city.name,
      postalCodes: city.zipCodes?.length ? city.zipCodes : undefined,
      state: "CA",
      status: "for_sale",
      limit: 1,
      offset: 0,
    });
    const searchTotal = searchResult.total ?? 0;
    const match = metrics.activeListings === searchTotal;
    results.push({
      name: city.name,
      slug: city.slug,
      dbCount: metrics.activeListings,
      searchTotal,
      medianPrice: metrics.medianPrice,
      match,
    });
    console.log(
      `  ${city.name} (${city.slug}): getCityMetrics=${metrics.activeListings}, searchProperties.total=${searchTotal}, median=${metrics.medianPrice != null ? `$${metrics.medianPrice.toLocaleString()}` : "N/A"} ${match ? "✓" : "✗ MISMATCH"}`
    );
  }

  console.log("\n───────────────────────────────────────────────────────────────");
  console.log("  Verification Summary");
  console.log("───────────────────────────────────────────────────────────────");

  const allMatch = results.every((r) => r.match);
  const mismatches = results.filter((r) => !r.match);

  if (allMatch) {
    console.log("  ✓ All San Diego County cities: database count matches UI count (search total).");
  } else {
    console.log(`  ✗ ${mismatches.length} city/cities have count mismatch:`);
    mismatches.forEach((r) => {
      console.log(`      ${r.name} (${r.slug}): getCityMetrics=${r.dbCount}, searchTotal=${r.searchTotal}`);
    });
  }

  console.log("\n  Per-city breakdown (DB count = getCityMetricsBuy; UI uses same):");
  console.log("  " + results.map((r) => `${r.name}=${r.dbCount}`).join(", "));
  console.log("\n═══════════════════════════════════════════════════════════════\n");

  process.exit(allMatch ? 0 : 1);
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});

