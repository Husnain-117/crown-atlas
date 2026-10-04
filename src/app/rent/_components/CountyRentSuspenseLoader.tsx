/**
 * CountyRentSuspenseLoader — async Server Component
 *
 * Fetches county rent data (property listings, stats, counts) and renders the
 * full rent county page. The parent wraps this in <Suspense> so the page shell
 * (filter bar, heading) renders instantly while the heavy DB queries stream in.
 */

import Link from "next/link"
import CitySchema from "@/components/seo/CitySchema"
import FilterBar from "@/components/city/FilterBar"
import PropertyCard from "@/components/property-card-client"
import PropertyListingHeader from "@/app/properties/property-header"
import { getPool, isDatabaseConfigured } from "@/lib/db"
import { CountyConfig } from "@/lib/counties"


interface Props {
  countyData: CountyConfig
  displayName: string
  query: { [key: string]: string | string[] | undefined }
  page: number
}

export default async function CountyRentSuspenseLoader({
  countyData,
  displayName,
  query,
  page,
}: Props) {
  const limit = 12
  const offset = (page - 1) * limit

  // Prepare standard filters
  const minPrice = query.minPrice ? Number(query.minPrice) : undefined
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined
  const minBedrooms = query.beds ? Number(query.beds) : undefined
  const propertyType = query.type ? String(query.type) : undefined
  const sort = (query.sort as string) || "newest"

  const cityNames = countyData.cities.map((c) => c.name)
  const allZipPrefixes = countyData.cities.flatMap((c) => c.zipCodes ?? [])

  const RENT_WHERE =
    "standard_status = 'Active' AND (LOWER(property_type) = 'residentiallease' OR LOWER(property_type) = 'residential lease') AND LOWER(COALESCE(state_or_province,'')) = 'ca'"
  const locationCond =
    allZipPrefixes.length > 0
      ? `(LOWER(city) = ANY($1) OR split_part(postal_code, '-', 1) = ANY($2))`
      : `LOWER(city) = ANY($1)`

  const baseValues: any[] = allZipPrefixes.length > 0 ? [cityNames.map((n) => n.toLowerCase()), allZipPrefixes] : [cityNames.map((n) => n.toLowerCase())]
  let paramCounter = baseValues.length + 1

  let whereClause = `${RENT_WHERE} AND ${locationCond}`
  if (minPrice) {
    whereClause += ` AND list_price >= $${paramCounter++}`
    baseValues.push(minPrice)
  }
  if (maxPrice) {
    whereClause += ` AND list_price <= $${paramCounter++}`
    baseValues.push(maxPrice)
  }
  if (minBedrooms) {
    whereClause += ` AND bedrooms_total >= $${paramCounter++}`
    baseValues.push(minBedrooms)
  }
  if (propertyType) {
    whereClause += ` AND LOWER(property_type) = LOWER($${paramCounter++})`
    baseValues.push(propertyType)
  }

  const selectCols = `
    listing_key AS id, list_price, bedrooms_total AS bedrooms, bathrooms_total_integer AS bathrooms,
    living_area AS sqft, unparsed_address AS street_address, city, state_or_province AS state,
    postal_code AS zip_code, property_type, main_photo_url AS main_image_url,
    updated_at AS list_date, standard_status AS status,
    COALESCE(days_on_market, cumulative_days_on_market, 0)::int AS days_on_market,
    year_built, lot_size_sq_ft AS lot_size_sqft
  `
  let orderBy = "list_price ASC, listing_key ASC"
  if (sort === "price_desc") orderBy = "list_price DESC, listing_key ASC"
  else if (sort === "beds_desc") orderBy = "bedrooms_total DESC NULLS LAST, list_price DESC"
  else if (sort === "sqft_desc") orderBy = "living_area DESC NULLS LAST, list_price DESC"
  else orderBy = "updated_at DESC NULLS LAST, listing_key DESC"

  const countSql = `SELECT COUNT(*) AS total FROM properties WHERE ${whereClause}`
  const listSql = `
    SELECT ${selectCols}
    FROM properties
    WHERE ${whereClause}
    ORDER BY ${orderBy}
    LIMIT $${paramCounter++} OFFSET $${paramCounter++}
  `
  const listValues = [...baseValues, limit, offset]

  let totalFiltered = 0
  let properties: any[] = []
  let dataAvailable = false

  if (isDatabaseConfigured()) {
    try {
      const pool = await getPool()
      const [countRes, propRes] = await Promise.all([
        pool.query(countSql, baseValues),
        pool.query(listSql, listValues),
      ])
      totalFiltered = parseInt(countRes.rows[0]?.total ?? "0", 10)
      properties = propRes.rows
      dataAvailable = true
    } catch (error) {
      console.error(`[CountyRent] Listing query failed for ${countyData.slug}:`, error)
    }
  }

  const totalPages = Math.ceil(totalFiltered / limit)

  const mappedProperties = properties.map((p: any) => {
    return {
      listing_key: p.id,
      id: p.id,
      list_price: p.list_price,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      living_area_sqft: p.sqft,
      lot_size_sqft: p.lot_size_sqft,
      address: p.street_address,
      city: p.city,
      state: p.state,
      county: countyData.name,
      postal_code: p.zip_code,
      property_type: p.property_type,
      main_photo_url: p.main_image_url,
      main_image_url: p.main_image_url,
      images: p.main_image_url ? [p.main_image_url] : [],
      standard_status: p.status,
      days_on_market: p.days_on_market,
      year_built: p.year_built
    };
  })

  return (
    <>
      <CitySchema
        city={displayName}
        canonical={`/rent/${countyData.slug}`}
        featured={mappedProperties.slice(0, 10).map((p: any) => ({ id: p.id }))}
        variant="Rentals"
      />

      <PropertyListingHeader
        title={`Homes for Rent in ${displayName}, CA`}
        subtitle={dataAvailable
          ? `Browse ${totalFiltered.toLocaleString()} current rental properties in ${displayName}.`
          : `Explore rental areas in ${displayName}. Current listing data is temporarily unavailable.`}
      />

      <div className="min-h-screen bg-[var(--bg)] theme-transition">
        <div className="max-w-screen-2xl mx-auto px-4 py-8">

          <div className="mb-8">
            <FilterBar action="rent" />
          </div>

          {!dataAvailable ? (
            <div className="text-center py-20">
              <p className="text-[var(--coastal-text)] text-lg font-semibold">
                Current rental data is temporarily unavailable.
              </p>
              <p className="text-[var(--coastal-muted-text)] text-sm mt-2">
                Please try again shortly or contact the team for current availability.
              </p>
            </div>
          ) : mappedProperties.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[var(--coastal-muted-text)] text-lg">
                No rentals found in {displayName}.
              </p>
              <p className="text-[var(--coastal-muted-text)] text-sm mt-2">
                Try adjusting your filters or check back later for new listings.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {mappedProperties.map((prop: any) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-3">
                  {page > 1 && (
                    <Link
                      href={`?${new URLSearchParams({ ...query as Record<string, string>, page: String(page - 1) }).toString()}`}
                      className="px-5 py-2.5 border border-[var(--coastal-border)] rounded-xl font-semibold text-[var(--coastal-text)] hover:bg-[var(--surface-muted)] transition-colors"
                    >
                      Previous
                    </Link>
                  )}
                  <span className="px-4 py-2 text-[var(--coastal-muted-text)] text-sm">
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages && (
                    <Link
                      href={`?${new URLSearchParams({ ...query as Record<string, string>, page: String(page + 1) }).toString()}`}
                      className="px-5 py-2.5 border border-[var(--coastal-border)] rounded-xl font-semibold text-[var(--coastal-text)] hover:bg-[var(--surface-muted)] transition-colors"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </>
  )
}
