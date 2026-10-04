#!/usr/bin/env python3
"""Seed missing San Diego city_statistics rows so SEO upserts can succeed."""

import json
import os
from datetime import datetime

import psycopg2
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "157.230.160.98"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "user": os.getenv("DB_USER", "redata_user"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME", "trestle_live"),
}

MISSING_CITIES = [
    ("pacific-beach", "Pacific Beach", ["92109", "92110"]),
    ("ocean-beach", "Ocean Beach", ["92107"]),
    ("gaslamp-quarter", "Gaslamp Quarter", ["92101"]),
    ("little-italy", "Little Italy", ["92101"]),
    ("east-village", "East Village", ["92101"]),
    ("hillcrest", "Hillcrest", ["92103"]),
    ("north-park", "North Park", ["92104"]),
    ("rancho-bernardo", "Rancho Bernardo", ["92127", "92128"]),
    ("scripps-ranch", "Scripps Ranch", ["92131"]),
]


def main():
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False
    cur = conn.cursor()

    for slug, city_name, zips in MISSING_CITIES:
        cur.execute(
            """
            SELECT
              COUNT(*)::int AS total_properties,
              COUNT(*) FILTER (WHERE standard_status = 'Active')::int AS active_listings,
              COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY list_price) FILTER (WHERE list_price IS NOT NULL), 0)::numeric AS median_price,
              COALESCE(AVG(list_price), 0)::numeric AS avg_price,
              COALESCE(MIN(list_price), 0)::numeric AS min_price,
              COALESCE(MAX(list_price), 0)::numeric AS max_price,
              COALESCE(AVG(CASE WHEN living_area > 0 THEN list_price / living_area END), 0)::numeric AS price_per_sqft,
              COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_on_market) FILTER (WHERE days_on_market IS NOT NULL), 0)::int AS median_days_on_market,
              COALESCE(AVG(days_on_market), 0)::numeric AS avg_days_on_market,
              COUNT(*) FILTER (WHERE LOWER(COALESCE(property_type,'')) LIKE '%%house%%')::int AS houses_count,
              COUNT(*) FILTER (WHERE LOWER(COALESCE(property_type,'')) LIKE '%%condo%%')::int AS condos_count,
              COUNT(*) FILTER (WHERE LOWER(COALESCE(property_type,'')) LIKE '%%town%%')::int AS townhomes_count,
              COUNT(*) FILTER (WHERE list_price < 1000000)::int AS under_1m_count,
              COUNT(*) FILTER (WHERE LOWER(COALESCE(pool_private_yn::text,'')) IN ('yes','y','true','1','t'))::int AS pool_count,
              COUNT(*) FILTER (WHERE LOWER(COALESCE(waterfront_yn::text,'')) IN ('yes','y','true','1','t'))::int AS waterfront_count,
              COUNT(*) FILTER (WHERE LOWER(COALESCE(view_yn::text,'')) IN ('yes','y','true','1','t'))::int AS ocean_view_count,
              COUNT(*) FILTER (WHERE garage_spaces > 0)::int AS garage_count
            FROM properties
            WHERE split_part(postal_code, '-', 1) = ANY(%s)
            """,
            (zips,),
        )
        s = cur.fetchone()

        cur.execute(
            """
            SELECT
              COALESCE(
                jsonb_agg(
                  jsonb_build_object(
                    'name', subdivision_name,
                    'avg_price', avg_price,
                    'count', listing_count
                  )
                  ORDER BY listing_count DESC
                ),
                '[]'::jsonb
              ) AS top_neighborhoods
            FROM (
              SELECT
                subdivision_name,
                AVG(list_price)::numeric AS avg_price,
                COUNT(*)::int AS listing_count
              FROM properties
              WHERE split_part(postal_code, '-', 1) = ANY(%s)
                AND subdivision_name IS NOT NULL
                AND subdivision_name <> ''
              GROUP BY subdivision_name
              ORDER BY listing_count DESC
              LIMIT 8
            ) t
            """,
            (zips,),
        )
        top_neighborhoods = cur.fetchone()[0]

        cur.execute(
            """
            INSERT INTO city_statistics (
              city_name, city_slug, state, total_properties, active_listings,
              median_price, avg_price, min_price, max_price, price_per_sqft,
              median_days_on_market, avg_days_on_market,
              houses_count, condos_count, townhomes_count, under_1m_count,
              pool_count, waterfront_count, ocean_view_count, garage_count,
              top_neighborhoods, nearby_cities, price_distribution,
              last_updated, data_source, calculation_duration_seconds
            ) VALUES (
              %s, %s, 'CA', %s, %s,
              %s, %s, %s, %s, %s,
              %s, %s,
              %s, %s, %s, %s,
              %s, %s, %s, %s,
              %s, '[]'::jsonb, '{}'::jsonb,
              NOW(), %s, %s
            )
            ON CONFLICT (city_slug) DO UPDATE SET
              city_name = EXCLUDED.city_name,
              state = EXCLUDED.state,
              total_properties = EXCLUDED.total_properties,
              active_listings = EXCLUDED.active_listings,
              median_price = EXCLUDED.median_price,
              avg_price = EXCLUDED.avg_price,
              min_price = EXCLUDED.min_price,
              max_price = EXCLUDED.max_price,
              price_per_sqft = EXCLUDED.price_per_sqft,
              median_days_on_market = EXCLUDED.median_days_on_market,
              avg_days_on_market = EXCLUDED.avg_days_on_market,
              houses_count = EXCLUDED.houses_count,
              condos_count = EXCLUDED.condos_count,
              townhomes_count = EXCLUDED.townhomes_count,
              under_1m_count = EXCLUDED.under_1m_count,
              pool_count = EXCLUDED.pool_count,
              waterfront_count = EXCLUDED.waterfront_count,
              ocean_view_count = EXCLUDED.ocean_view_count,
              garage_count = EXCLUDED.garage_count,
              top_neighborhoods = EXCLUDED.top_neighborhoods,
              last_updated = NOW(),
              data_source = EXCLUDED.data_source,
              calculation_duration_seconds = EXCLUDED.calculation_duration_seconds
            """,
            (
                city_name,
                slug,
                s[0],
                s[1],
                s[2],
                s[3],
                s[4],
                s[5],
                s[6],
                s[7],
                s[8],
                s[9],
                s[10],
                s[11],
                s[12],
                s[13],
                s[14],
                s[15],
                s[16],
                json.dumps(top_neighborhoods),
                "Derived from properties table for SEO generation",
                0,
            ),
        )
        print(f"[OK] Seeded city_statistics for {slug} ({city_name})")

    conn.commit()
    conn.close()
    print("[OK] Done seeding missing San Diego city_statistics rows")


if __name__ == "__main__":
    main()
