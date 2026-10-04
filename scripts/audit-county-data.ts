/**
 * Comprehensive audit script to identify data inconsistencies across all counties
 * This script checks:
 * 1. City vs county data mismatches
 * 2. Missing or incorrect zip code handling
 * 3. Property type filtering issues
 * 4. Median price calculation errors
 * 5. Active listings discrepancies
 */

import { getPool } from "../src/lib/db"
import { COUNTIES } from "../src/lib/counties"
import { getCityMetrics } from "../src/lib/city-metrics"
import { getCountyCityCounts } from "../src/lib/county-stats"

interface AuditReport {
  county: string
  totalActiveListings: number
  totalFromCities: number
  discrepancy: number
  medianPrice: number | null
  weightedMedianFromCities: number | null
  issues: string[]
}

async function auditCountyData(): Promise<void> {
  console.log("🔍 Starting comprehensive county data audit...\n")
  
  const pool = await getPool()
  const counties = COUNTIES
  const reports: AuditReport[] = []
  
  for (const county of counties) {
    console.log(`\n📊 Auditing ${county.name}...`)
    
    const report: AuditReport = {
      county: county.name,
      totalActiveListings: 0,
      totalFromCities: 0,
      discrepancy: 0,
      medianPrice: null,
      weightedMedianFromCities: null,
      issues: []
    }
    
    try {
      // Get county-level counts
      const countyCounts = await getCountyCityCounts(county.slug, "buy")
      const countyTotal = countyCounts.reduce((sum, city) => sum + (city.count || 0), 0)
      report.totalActiveListings = countyTotal
      
      // Get individual city metrics
      const cityMetrics = await Promise.all(
        county.cities.map(async (city) => {
          const metrics = await getCityMetrics({ citySlug: city.slug, countySlug: county.slug }, "buy")
          return { city: city.name, slug: city.slug, ...metrics }
        })
      )
      
      const citiesTotal = cityMetrics.reduce((sum, city) => sum + city.activeListings, 0)
      report.totalFromCities = citiesTotal
      report.discrepancy = Math.abs(countyTotal - citiesTotal)
      
      // Check for significant discrepancies (>5% difference)
      if (report.discrepancy > 0 && (report.discrepancy / Math.max(countyTotal, citiesTotal)) > 0.05) {
        report.issues.push(
          `Significant discrepancy: county shows ${countyTotal}, cities sum to ${citiesTotal} (${report.discrepancy} difference)`
        )
      }
      
      // Calculate weighted median from cities
      const validCities = cityMetrics.filter(c => c.medianPrice !== null && c.activeListings > 0)
      if (validCities.length > 0) {
        const allPrices: number[] = []
        validCities.forEach((city: any) => {
          const weight = Math.min(city.activeListings, 100)
          for (let i = 0; i < weight; i++) {
            allPrices.push(city.medianPrice!)
          }
        })
        allPrices.sort((a, b) => a - b)
        const mid = Math.floor(allPrices.length / 2)
        report.weightedMedianFromCities = allPrices.length % 2 === 0 
          ? (allPrices[mid - 1] + allPrices[mid]) / 2 
          : allPrices[mid]
      }
      
      // Check for cities with zero listings but should have some
      const zeroListingCities = cityMetrics.filter(c => c.activeListings === 0)
      if (zeroListingCities.length > 0) {
        report.issues.push(
          `${zeroListingCities.length} cities show 0 listings: ${zeroListingCities.map(c => c.city).join(", ")}`
        )
      }
      
      // Check for cities with null median prices
      const nullMedianCities = cityMetrics.filter(c => c.medianPrice === null && c.activeListings > 0)
      if (nullMedianCities.length > 0) {
        report.issues.push(
          `${nullMedianCities.length} cities have listings but null median: ${nullMedianCities.map(c => c.city).join(", ")}`
        )
      }
      
      // Check database directly for potential issues
      const directQuery = await pool.query(`
        SELECT 
          COUNT(*)::int as total_properties,
          COUNT(*) FILTER (WHERE standard_status = 'Active')::int as active_properties,
          COUNT(*) FILTER (WHERE standard_status = 'Active' AND property_type NOT IN ('Land', 'ResidentialLease', 'CommercialLease', 'CommercialSale', 'BusinessOpportunity'))::int as active_sale_properties,
          COUNT(DISTINCT city) as unique_cities,
          COUNT(DISTINCT split_part(postal_code, '-', 1)) as unique_zip_codes
        FROM properties 
        WHERE state_or_province = 'CA'
        AND (
          city = ANY($1) 
          OR split_part(postal_code, '-', 1) = ANY($2)
        )
      `, [county.cities.map(c => c.name), county.cities.flatMap(c => c.zipCodes || [])])
      
      const dbStats = directQuery.rows[0]
      console.log(`  DB Stats: Total=${dbStats.total_properties}, Active=${dbStats.active_properties}, Sale=${dbStats.active_sale_properties}`)
      console.log(`  Unique Cities: ${dbStats.unique_cities}, Unique Zips: ${dbStats.unique_zip_codes}`)
      
      // Check for property type issues
      const propertyTypes = await pool.query(`
        SELECT property_type, COUNT(*)::int
        FROM properties 
        WHERE state_or_province = 'CA'
        AND standard_status = 'Active'
        AND (
          city = ANY($1) 
          OR split_part(postal_code, '-', 1) = ANY($2)
        )
        GROUP BY property_type
        ORDER BY COUNT(*) DESC
        LIMIT 10
      `, [county.cities.map(c => c.name), county.cities.flatMap(c => c.zipCodes || [])])
      
      console.log("  Top Property Types:")
      propertyTypes.rows.forEach(row => {
        console.log(`    ${row.property_type}: ${row.count}`)
      })
      
      reports.push(report)
      
    } catch (error) {
      console.error(`  ❌ Error auditing ${county.name}:`, error)
      report.issues.push(`Audit failed: ${error}`)
    }
    
    // Print summary for this county
    console.log(`  Summary:`)
    console.log(`    County Total Listings: ${report.totalActiveListings}`)
    console.log(`    Sum of City Listings: ${report.totalFromCities}`)
    console.log(`    Discrepancy: ${report.discrepancy}`)
    console.log(`    Issues: ${report.issues.length}`)
    if (report.issues.length > 0) {
      report.issues.forEach(issue => console.log(`      - ${issue}`))
    }
  }
  
  // Generate overall summary
  console.log("\n\n📋 AUDIT SUMMARY")
  console.log("=================")
  
  const totalDiscrepancies = reports.reduce((sum, r) => sum + r.discrepancy, 0)
  const countiesWithIssues = reports.filter(r => r.issues.length > 0).length
  
  console.log(`Total counties audited: ${counties.length}`)
  console.log(`Counties with issues: ${countiesWithIssues}`)
  console.log(`Total listing discrepancies: ${totalDiscrepancies}`)
  
  console.log("\n🚨 Counties with significant issues:")
  reports
    .filter(r => r.issues.length > 0)
    .forEach(report => {
      console.log(`\n${report.county}:`)
      report.issues.forEach(issue => console.log(`  - ${issue}`))
    })
  
  // Recommendations
  console.log("\n💡 RECOMMENDATIONS:")
  console.log("==================")
  
  if (totalDiscrepancies > 1000) {
    console.log("1. High discrepancy detected - investigate property filtering logic")
  }
  
  const zeroListingIssues = reports.some(r => r.issues.some(i => i.includes("0 listings")))
  if (zeroListingIssues) {
    console.log("2. Many cities show 0 listings - check zip code mapping and city name matching")
  }
  
  const nullMedianIssues = reports.some(r => r.issues.some(i => i.includes("null median")))
  if (nullMedianIssues) {
    console.log("3. Null median prices detected - investigate price data quality")
  }
  
  console.log("4. Consider implementing data validation checks")
  console.log("5. Set up automated monitoring for data quality")
}

// Run the audit
auditCountyData().catch(console.error)
