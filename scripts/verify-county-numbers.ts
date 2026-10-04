/**
 * Comprehensive County Data Verification Script
 * 
 * This script audits ALL county listing counts and median prices
 * to ensure displayed numbers match actual database values.
 * 
 * Run: npx tsx scripts/verify-county-numbers.ts
 */

import { getPool } from "../src/lib/db"
import { COUNTIES } from "../src/lib/counties"
import { getCityListingMetrics } from "../src/lib/city-metrics"

interface VerificationResult {
  county: string
  countySlug: string
  
  // Listing counts
  expectedListings: number
  actualListings: number
  listingsMismatch: boolean
  
  // Median prices
  expectedMedian: number | null
  actualMedian: number | null
  medianMismatch: boolean
  
  // City-level details
  cityCount: number
  citiesWithData: number
  citiesWithoutData: string[]
  
  // Issues
  issues: string[]
}

/**
 * Get actual county listing count from database
 * This mimics the homepage getCountyListingCounts() function
 */
async function getActualCountyListings(countySlug: string): Promise<number> {
  const pool = await getPool()
  const county = COUNTIES.find(c => c.slug === countySlug)
  if (!county) return 0

  const result = await pool.query(
    `
      SELECT LOWER(TRIM(city)) AS city_key, COUNT(*)::int AS count
      FROM properties
      WHERE standard_status = 'Active'
        AND property_type NOT IN (
          'Land',
          'ResidentialLease',
          'CommercialLease',
          'CommercialSale',
          'BusinessOpportunity'
        )
        AND LOWER(COALESCE(state_or_province, '')) = 'ca'
        AND city IS NOT NULL
        AND city <> ''
      GROUP BY LOWER(TRIM(city))
    `
  )

  const cityCounts = new Map<string, number>()
  for (const row of result.rows as Array<{ city_key: string; count: number }>) {
    cityCounts.set(row.city_key, Number(row.count) || 0)
  }

  const sum = county.cities.reduce((total, city) => {
    const key = city.name.trim().toLowerCase()
    return total + (cityCounts.get(key) ?? 0)
  }, 0)

  return sum
}

/**
 * Get actual county median price from database
 * This mimics the homepage getCountyMedianPrices() function
 */
async function getActualCountyMedian(countySlug: string): Promise<number | null> {
  const pool = await getPool()
  const county = COUNTIES.find(c => c.slug === countySlug)
  if (!county) return null

  const result = await pool.query(
    `
      SELECT 
        LOWER(TRIM(city)) AS city_key,
        COUNT(*)::int AS count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY list_price) 
          FILTER (WHERE list_price IS NOT NULL AND list_price > 0)::numeric AS median_price
      FROM properties
      WHERE standard_status = 'Active'
        AND property_type NOT IN (
          'Land',
          'ResidentialLease',
          'CommercialLease',
          'CommercialSale',
          'BusinessOpportunity'
        )
        AND LOWER(COALESCE(state_or_province, '')) = 'ca'
        AND city IS NOT NULL
        AND city <> ''
      GROUP BY LOWER(TRIM(city))
      HAVING COUNT(*) > 0
    `
  )

  const cityData = new Map<string, { count: number; median: number }>()
  for (const row of result.rows as Array<{ city_key: string; count: number; median_price: number }>) {
    if (row.median_price != null && row.median_price > 0) {
      cityData.set(row.city_key, {
        count: Number(row.count) || 0,
        median: Math.round(Number(row.median_price))
      })
    }
  }

  let totalWeightedPrice = 0
  let totalWeight = 0
  
  for (const city of county.cities) {
    const key = city.name.trim().toLowerCase()
    const data = cityData.get(key)
    if (data && data.median > 0) {
      totalWeightedPrice += data.median * data.count
      totalWeight += data.count
    }
  }
  
  if (totalWeight > 0) {
    return Math.round(totalWeightedPrice / totalWeight)
  }
  
  return null
}

/**
 * Get expected values using the city-metrics library
 * This is what the county discovery pages use
 */
async function getExpectedCountyData(countySlug: string): Promise<{
  listings: number
  median: number | null
  citiesWithData: number
  citiesWithoutData: string[]
}> {
  const county = COUNTIES.find(c => c.slug === countySlug)
  if (!county) {
    return { listings: 0, median: null, citiesWithData: 0, citiesWithoutData: [] }
  }

  const results = await Promise.allSettled(
    county.cities.map(async (city) => {
      const metrics = await getCityListingMetrics({ citySlug: city.slug, countySlug })
      return {
        cityName: city.name,
        citySlug: city.slug,
        listings: metrics.totalSales,
        median: metrics.medianSalePrice
      }
    })
  )

  let totalListings = 0
  let totalWeightedPrice = 0
  let totalWeight = 0
  let citiesWithData = 0
  const citiesWithoutData: string[] = []

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const data = result.value
      totalListings += data.listings
      
      if (data.listings > 0) {
        citiesWithData++
      } else {
        citiesWithoutData.push(data.cityName)
      }
      
      if (data.median != null && data.median > 0 && data.listings > 0) {
        totalWeightedPrice += data.median * data.listings
        totalWeight += data.listings
      }
    }
  }

  const median = totalWeight > 0 ? Math.round(totalWeightedPrice / totalWeight) : null

  return {
    listings: totalListings,
    median,
    citiesWithData,
    citiesWithoutData
  }
}

/**
 * Verify a single county's data
 */
async function verifyCounty(countySlug: string): Promise<VerificationResult> {
  const county = COUNTIES.find(c => c.slug === countySlug)
  if (!county) {
    throw new Error(`County not found: ${countySlug}`)
  }

  console.log(`\n🔍 Verifying ${county.name}...`)

  // Get expected values (from city-metrics library)
  const expected = await getExpectedCountyData(countySlug)
  
  // Get actual values (direct database queries)
  const actualListings = await getActualCountyListings(countySlug)
  const actualMedian = await getActualCountyMedian(countySlug)

  const issues: string[] = []
  
  // Check for listing count mismatch
  const listingsMismatch = expected.listings !== actualListings
  if (listingsMismatch) {
    const diff = Math.abs(expected.listings - actualListings)
    const percentDiff = actualListings > 0 ? (diff / actualListings * 100).toFixed(1) : '100'
    issues.push(`Listings mismatch: Expected ${expected.listings}, Actual ${actualListings} (${percentDiff}% difference)`)
  }

  // Check for median price mismatch
  const medianMismatch = expected.median !== actualMedian
  if (medianMismatch && (expected.median !== null || actualMedian !== null)) {
    if (expected.median === null) {
      issues.push(`Median mismatch: Expected NULL, Actual $${actualMedian?.toLocaleString()}`)
    } else if (actualMedian === null) {
      issues.push(`Median mismatch: Expected $${expected.median.toLocaleString()}, Actual NULL`)
    } else {
      const diff = Math.abs(expected.median - actualMedian)
      const percentDiff = actualMedian > 0 ? (diff / actualMedian * 100).toFixed(1) : '100'
      issues.push(`Median mismatch: Expected $${expected.median.toLocaleString()}, Actual $${actualMedian.toLocaleString()} (${percentDiff}% difference)`)
    }
  }

  // Check for cities without data
  if (expected.citiesWithoutData.length > 0) {
    issues.push(`${expected.citiesWithoutData.length} cities with no listings: ${expected.citiesWithoutData.slice(0, 5).join(', ')}${expected.citiesWithoutData.length > 5 ? '...' : ''}`)
  }

  return {
    county: county.name,
    countySlug,
    expectedListings: expected.listings,
    actualListings,
    listingsMismatch,
    expectedMedian: expected.median,
    actualMedian,
    medianMismatch,
    cityCount: county.cities.length,
    citiesWithData: expected.citiesWithData,
    citiesWithoutData: expected.citiesWithoutData,
    issues
  }
}

/**
 * Main verification function
 */
async function verifyAllCounties() {
  console.log("🚀 Starting comprehensive county data verification...\n")
  console.log(`Total counties to verify: ${COUNTIES.length}\n`)

  const results: VerificationResult[] = []
  let totalIssues = 0

  // Verify each county
  for (const county of COUNTIES) {
    try {
      const result = await verifyCounty(county.slug)
      results.push(result)
      
      if (result.issues.length > 0) {
        totalIssues += result.issues.length
        console.log(`❌ ${result.county}: ${result.issues.length} issue(s)`)
        result.issues.forEach(issue => console.log(`   - ${issue}`))
      } else {
        console.log(`✅ ${result.county}: All data verified`)
      }
    } catch (error) {
      console.error(`❌ Error verifying ${county.name}:`, error)
      totalIssues++
    }
  }

  // Summary report
  console.log("\n" + "=".repeat(80))
  console.log("📊 VERIFICATION SUMMARY")
  console.log("=".repeat(80))
  
  const countiesWithIssues = results.filter(r => r.issues.length > 0)
  const countiesVerified = results.filter(r => r.issues.length === 0)
  
  console.log(`\nTotal Counties Verified: ${results.length}`)
  console.log(`✅ Counties Verified OK: ${countiesVerified.length}`)
  console.log(`❌ Counties with Issues: ${countiesWithIssues.length}`)
  console.log(`Total Issues Found: ${totalIssues}`)

  // Detailed issue breakdown
  if (countiesWithIssues.length > 0) {
    console.log("\n" + "=".repeat(80))
    console.log("⚠️  COUNTIES WITH ISSUES")
    console.log("=".repeat(80))
    
    for (const result of countiesWithIssues) {
      console.log(`\n${result.county} (${result.countySlug}):`)
      console.log(`  Expected Listings: ${result.expectedListings.toLocaleString()}`)
      console.log(`  Actual Listings: ${result.actualListings.toLocaleString()}`)
      console.log(`  Expected Median: ${result.expectedMedian ? '$' + result.expectedMedian.toLocaleString() : 'NULL'}`)
      console.log(`  Actual Median: ${result.actualMedian ? '$' + result.actualMedian.toLocaleString() : 'NULL'}`)
      console.log(`  Cities: ${result.citiesWithData}/${result.cityCount} with data`)
      console.log(`  Issues:`)
      result.issues.forEach(issue => console.log(`    - ${issue}`))
    }
  }

  // Top counties by listing count
  console.log("\n" + "=".repeat(80))
  console.log("📈 TOP 10 COUNTIES BY LISTING COUNT")
  console.log("=".repeat(80))
  
  const topCounties = [...results]
    .sort((a, b) => b.actualListings - a.actualListings)
    .slice(0, 10)
  
  topCounties.forEach((result, index) => {
    const status = result.issues.length === 0 ? '✅' : '❌'
    console.log(`${index + 1}. ${status} ${result.county}: ${result.actualListings.toLocaleString()} listings, Median: ${result.actualMedian ? '$' + result.actualMedian.toLocaleString() : 'N/A'}`)
  })

  // Counties with zero listings
  const zeroListings = results.filter(r => r.actualListings === 0)
  if (zeroListings.length > 0) {
    console.log("\n" + "=".repeat(80))
    console.log("⚠️  COUNTIES WITH ZERO LISTINGS")
    console.log("=".repeat(80))
    zeroListings.forEach(result => {
      console.log(`- ${result.county}: ${result.cityCount} cities configured`)
    })
  }

  console.log("\n" + "=".repeat(80))
  console.log(totalIssues === 0 ? "✅ ALL VERIFICATIONS PASSED" : `⚠️  ${totalIssues} ISSUES REQUIRE ATTENTION`)
  console.log("=".repeat(80) + "\n")

  process.exit(totalIssues > 0 ? 1 : 0)
}

// Run verification
verifyAllCounties().catch((error) => {
  console.error("Fatal error during verification:", error)
  process.exit(1)
})
