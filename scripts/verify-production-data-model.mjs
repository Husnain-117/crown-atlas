import {
  createPool,
  loadEnvironment,
} from "../ops/trestle-sync/worker-lib.mjs";

loadEnvironment();

const pool = createPool();

try {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*)::bigint FROM properties) AS properties,
      (SELECT COUNT(*)::bigint FROM properties WHERE property_entity_key IS NULL) AS missing_entity_keys,
      (SELECT COUNT(DISTINCT property_entity_key)::bigint FROM properties) AS property_entities,
      (SELECT COUNT(*)::bigint FROM property_entities) AS materialized_entities,
      (SELECT COUNT(*)::bigint FROM property_listing_episodes) AS listing_episodes,
      (SELECT COUNT(*)::bigint FROM open_houses) AS open_houses,
      (SELECT COUNT(*)::bigint FROM location_cities WHERE location_type = 'city') AS location_cities,
      (SELECT COUNT(*)::bigint FROM location_zip_codes) AS location_zip_codes,
      (SELECT COUNT(*)::bigint FROM location_city_zip_codes) AS location_city_zip_links,
      (SELECT COUNT(*)::bigint FROM location_neighborhoods) AS location_neighborhoods,
      (
        SELECT COUNT(*)::bigint
        FROM location_market_statistics AS stats
        JOIN location_cities AS city ON city.city_id = stats.city_id
        WHERE city.location_type = 'city'
      ) AS fresh_location_statistics,
      (
        SELECT COUNT(DISTINCT property_entity_key)::bigint
        FROM properties
        WHERE standard_status = 'Active'
          AND property_type NOT IN (
            'Land', 'ResidentialLease', 'CommercialLease', 'CommercialSale', 'BusinessOpportunity'
          )
          AND LOWER(COALESCE(state_or_province, '')) = 'ca'
      ) AS active_sale_entities,
      (
        SELECT COUNT(*)::bigint
        FROM properties
        WHERE standard_status = 'Active'
          AND LOWER(COALESCE(city, '')) = 'san diego'
          AND LOWER(TRIM(REGEXP_REPLACE(COALESCE(county_or_parish, ''), '\\s+county$', '', 'i'))) = 'san diego'
          AND property_type NOT IN (
            'Land', 'ResidentialLease', 'CommercialLease', 'CommercialSale', 'BusinessOpportunity'
          )
      ) AS san_diego_database_count,
      (
        SELECT active_listings::bigint
        FROM location_market_statistics
        WHERE city_id = 'san-diego:san-diego-ca'
      ) AS san_diego_statistics_count,
      (
        SELECT MAX(COALESCE(modification_timestamp, updated_at))
        FROM properties
      ) AS newest_listing_update
  `);

  const row = result.rows[0];
  const summary = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value,
    ])
  );

  if (summary.missing_entity_keys !== 0) {
    throw new Error(`Data model verification failed: ${summary.missing_entity_keys} listings have no entity key`);
  }
  if (summary.properties !== summary.listing_episodes) {
    throw new Error(
      `Data model verification failed: ${summary.properties} properties but ${summary.listing_episodes} listing episodes`
    );
  }
  if (!summary.location_cities || !summary.location_zip_codes || !summary.location_neighborhoods) {
    throw new Error("Data model verification failed: one or more location dimensions are empty");
  }
  if (summary.san_diego_database_count !== summary.san_diego_statistics_count) {
    throw new Error(
      `Data model verification failed: San Diego has ${summary.san_diego_database_count} DB listings but ${summary.san_diego_statistics_count} in statistics`
    );
  }

  console.log(JSON.stringify({ ok: true, ...summary }, null, 2));
} finally {
  await pool.end();
}
