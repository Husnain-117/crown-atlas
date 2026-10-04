import { cache } from "react"
import { getPgPool } from "@/lib/db"

export interface PropertyComparable {
  listingKey: string
  address: string
  city: string
  price: number | null
  bedrooms: number | null
  bathrooms: number | null
  livingArea: number | null
  status: string
  closeDate: string | null
}

interface ComparableGroups {
  active: PropertyComparable[]
  sold: PropertyComparable[]
}

function mapRows(rows: Record<string, unknown>[]): PropertyComparable[] {
  return rows.map((row) => ({
    listingKey: String(row.listing_key),
    address: String(row.unparsed_address || "Address available on request"),
    city: String(row.city || ""),
    price: row.display_price == null ? null : Number(row.display_price),
    bedrooms: row.bedrooms_total == null ? null : Number(row.bedrooms_total),
    bathrooms: row.bathrooms_total_integer == null ? null : Number(row.bathrooms_total_integer),
    livingArea: row.living_area == null ? null : Number(row.living_area),
    status: String(row.standard_status || ""),
    closeDate: row.close_date ? String(row.close_date) : null,
  }))
}

export const getPropertyComparables = cache(
  async (
    listingKey: string,
    city: string,
    bedrooms: number | null,
    listPrice: number | null,
    propertyType: string,
    propertySubType: string | null,
  ): Promise<ComparableGroups> => {
    if (!listingKey || !city || !propertyType) return { active: [], sold: [] }

    const normalizedType = propertyType.replace(/\s+/g, "").toLowerCase()
    if (["land", "residentiallease", "commerciallease", "commercialsale", "businessopportunity"].includes(normalizedType)) {
      return { active: [], sold: [] }
    }

    try {
      const pool = await getPgPool()
      const comparableBedrooms = bedrooms != null && bedrooms > 0 ? bedrooms : null
      const comparableSubType = propertySubType?.trim() || null
      const baseValues = [listingKey, city, comparableBedrooms, propertyType, comparableSubType]
      const baseWhere = `
        listing_key <> $1
        AND LOWER(city) = LOWER($2)
        AND ($3::NUMERIC IS NULL OR bedrooms_total BETWEEN GREATEST($3::NUMERIC - 1, 0) AND $3::NUMERIC + 1)
        AND REPLACE(LOWER(COALESCE(property_type, '')), ' ', '') = REPLACE(LOWER($4), ' ', '')
        AND ($5::TEXT IS NULL OR REPLACE(LOWER(COALESCE(property_sub_type, '')), ' ', '') = REPLACE(LOWER($5), ' ', ''))
      `
      const select = `
        listing_key,
        unparsed_address,
        city,
        bedrooms_total,
        bathrooms_total_integer,
        living_area,
        standard_status,
        close_date,
      `

      const activePromise = pool.query(
        `SELECT ${select} list_price AS display_price
         FROM properties
         WHERE ${baseWhere} AND standard_status = 'Active' AND list_price > 0
         ORDER BY ABS(list_price - COALESCE($6::NUMERIC, list_price)), modification_timestamp DESC NULLS LAST
         LIMIT 4`,
        [...baseValues, listPrice]
      )
      const soldPromise = pool.query(
        `SELECT ${select} close_price AS display_price
         FROM properties
         WHERE ${baseWhere}
           AND standard_status IN ('Closed', 'Sold')
           AND close_price IS NOT NULL
           AND close_price > 0
         ORDER BY close_date DESC NULLS LAST, modification_timestamp DESC NULLS LAST
         LIMIT 4`,
        baseValues
      )

      const [activeResult, soldResult] = await Promise.allSettled([activePromise, soldPromise])

      if (activeResult.status === "rejected") {
        console.error("[property-comparables] Active query failed", activeResult.reason)
      }
      if (soldResult.status === "rejected") {
        console.error("[property-comparables] Sold query failed", soldResult.reason)
      }

      return {
        active: activeResult.status === "fulfilled" ? mapRows(activeResult.value.rows) : [],
        sold: soldResult.status === "fulfilled" ? mapRows(soldResult.value.rows) : [],
      }
    } catch (error) {
      console.error("[property-comparables] Database unavailable", error)
      return { active: [], sold: [] }
    }
  }
)
