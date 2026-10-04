import "dotenv/config"
import { getPool } from "@/lib/db"

async function main() {
  const pool = await getPool()

  // 1) Inspect how the DB stores the county name for SF
  const countyRows = await pool.query<{
    county_or_parish: string | null
    count: number
  }>(
    `
      SELECT
        county_or_parish,
        COUNT(*)::int AS count
      FROM properties
      WHERE county_or_parish IS NOT NULL
        AND TRIM(county_or_parish) <> ''
        AND county_or_parish ILIKE $1
      GROUP BY county_or_parish
      ORDER BY count DESC
      LIMIT 20;
    `,
    ["%san%francisco%"]
  )

  console.log("\n=== Matching county_or_parish values (top) ===")
  for (const r of countyRows.rows) {
    console.log(`${r.county_or_parish} (${r.count})`)
  }

  // 2) List distinct cities in those rows (with counts)
  const cityRows = await pool.query<{ city: string; count: number }>(
    `
      SELECT DISTINCT
        TRIM(city) AS city,
        COUNT(*)::int AS count
      FROM properties
      WHERE county_or_parish IS NOT NULL
        AND TRIM(county_or_parish) <> ''
        AND county_or_parish ILIKE $1
        AND city IS NOT NULL
        AND TRIM(city) <> ''
      GROUP BY TRIM(city)
      ORDER BY city ASC;
    `,
    ["%san%francisco%"]
  )

  console.log("\n=== Distinct city values for San Francisco County (city ASC) ===")
  console.log(
    cityRows.rows.map((r) => `${r.city} (${r.count})`).join(", ")
  )
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

