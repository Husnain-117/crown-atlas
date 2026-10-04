/**
 * Verify city-level sale/rent data consistency across ALL counties.
 * Ensures city card counts (getCountyCityCounts) match city detail page (getCityMetrics / getCityListingMetrics).
 * Run: npm run verify:all-cities
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { COUNTIES } from "../src/lib/counties";
import { getCityMetrics, getCityListingMetrics } from "../src/lib/city-metrics";

interface Row {
  county: string;
  city: string;
  slug: string;
  dbSales: number;
  dbRentals: number;
  buyApi: number;
  rentApi: number;
  status: "MATCH" | "MISMATCH";
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  All Counties / All Cities — Sale & Rent Verification");
  console.log("  Compares getCityListingMetrics vs getCityMetrics(buy/rent)");
  console.log("  City cards and detail pages both use this single source.");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const rows: Row[] = [];
  let totalCities = 0;
  const totalCounties = COUNTIES.filter((c) => c.cities.length > 0).length;

  for (const county of COUNTIES) {
    if (county.cities.length === 0) continue;

    for (const city of county.cities) {
      const [direct, buyMetrics, rentMetrics] = await Promise.all([
        getCityListingMetrics({ citySlug: city.slug, countySlug: county.slug }),
        getCityMetrics({ citySlug: city.slug, countySlug: county.slug }, "buy"),
        getCityMetrics({ citySlug: city.slug, countySlug: county.slug }, "rent"),
      ]);
      const salesMatch = direct.totalSales === buyMetrics.activeListings;
      const rentalsMatch = direct.totalRentals === rentMetrics.activeListings;
      const status: "MATCH" | "MISMATCH" =
        salesMatch && rentalsMatch ? "MATCH" : "MISMATCH";

      rows.push({
        county: county.name,
        city: city.name,
        slug: city.slug,
        dbSales: direct.totalSales,
        dbRentals: direct.totalRentals,
        buyApi: buyMetrics.activeListings,
        rentApi: rentMetrics.activeListings,
        status,
      });
      totalCities += 1;

      const icon = status === "MATCH" ? "✅" : "❌";
      console.log(`  ${icon} County: ${county.name} | City: ${city.name} (${city.slug})`);
      console.log(`      DB Sales: ${direct.totalSales} | getCityMetrics(buy): ${buyMetrics.activeListings}`);
      console.log(`      DB Rentals: ${direct.totalRentals} | getCityMetrics(rent): ${rentMetrics.activeListings}`);
      console.log(`      Status: ${status}\n`);
    }
  }

  const mismatches = rows.filter((r) => r.status === "MISMATCH");

  console.log("───────────────────────────────────────────────────────────────");
  console.log("  Verification Report");
  console.log("───────────────────────────────────────────────────────────────");
  console.log(`  Total counties checked: ${totalCounties}`);
  console.log(`  Total cities checked: ${totalCities}`);
  console.log(`  Total mismatches: ${mismatches.length}`);
  console.log("───────────────────────────────────────────────────────────────\n");

  if (mismatches.length > 0) {
    console.log("  Mismatches (County | City | DB Sales | API Buy | DB Rentals | API Rent):");
    mismatches.forEach((r) => {
      console.log(
        `    ${r.county} | ${r.city} | ${r.dbSales} | ${r.buyApi} | ${r.dbRentals} | ${r.rentApi}`
      );
    });
    console.log("\n═══════════════════════════════════════════════════════════════\n");
    process.exit(1);
  }

  console.log("  ✓ All counts from single source. Mismatches: 0.\n");
  console.log("═══════════════════════════════════════════════════════════════\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
