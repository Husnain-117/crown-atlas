import "dotenv/config"
import { getPool } from "@/lib/db"

async function main() {
  const pool = await getPool()

  const countyOrParishRows = await pool.query<{ v: string; c: number }>(
    `
      SELECT
        TRIM(county_or_parish) AS v,
        COUNT(*)::int AS c
      FROM properties
      WHERE county_or_parish IS NOT NULL
        AND TRIM(county_or_parish) <> ''
        AND county_or_parish ILIKE $1
      GROUP BY TRIM(county_or_parish)
      ORDER BY c DESC
      LIMIT 50;
    `,
    ["%san%francisco%"]
  )

  const stateOrProvinceRows = await pool.query<{ v: string; c: number }>(
    `
      SELECT
        TRIM(state_or_province) AS v,
        COUNT(*)::int AS c
      FROM properties
      WHERE state_or_province IS NOT NULL
        AND TRIM(state_or_province) <> ''
        AND state_or_province ILIKE $1
      GROUP BY TRIM(state_or_province)
      ORDER BY c DESC
      LIMIT 50;
    `,
    ["%san%francisco%"]
  )

  console.log("\n=== county_or_parish values matching '%san%francisco%' ===")
  console.log(countyOrParishRows.rows.map((r) => `${r.v} (${r.c})`).join("\n"))

  console.log("\n=== state_or_province values matching '%san%francisco%' ===")
  console.log(stateOrProvinceRows.rows.map((r) => `${r.v} (${r.c})`).join("\n"))

  // City values where either field matches, to avoid schema mismatch.
  const cityRows = await pool.query<{ city: string; c: number }>(
    `
      SELECT
        TRIM(city) AS city,
        COUNT(*)::int AS c
      FROM properties
      WHERE city IS NOT NULL
        AND TRIM(city) <> ''
        AND (
          (county_or_parish IS NOT NULL AND county_or_parish ILIKE $1)
          OR
          (state_or_province IS NOT NULL AND state_or_province ILIKE $1)
        )
      GROUP BY TRIM(city)
      ORDER BY c DESC
      LIMIT 100;
    `,
    ["%san%francisco%"]
  )

  console.log("\n=== Distinct cities where county/state matches San Francisco ===")
  console.log(cityRows.rows.map((r) => `${r.city} (${r.c})`).join("\n"))
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

