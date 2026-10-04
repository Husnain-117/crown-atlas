#!/usr/bin/env python3
"""Generate SEO content for remaining San Diego cities one by one."""

import json
import os
from datetime import datetime

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "157.230.160.98"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "user": os.getenv("DB_USER", "redata_user"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME", "trestle_live"),
}

TARGET_CITY_SLUGS = [
    "la-jolla-ca",
    "pacific-beach-ca",
    "ocean-beach-ca",
    "coronado-ca",
    "del-mar-ca",
    "gaslamp-quarter-ca",
    "little-italy-ca",
    "east-village-ca",
    "hillcrest-ca",
    "north-park-ca",
    "rancho-bernardo-ca",
    "poway-ca",
    "scripps-ranch-ca",
    "chula-vista-ca",
]

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def _slug_to_name(slug: str) -> str:
    return slug.replace("-ca", "").replace("-", " ").title()


def get_city_stats(city_slug: str):
    """Fetch city statistics for a slug with fallback match."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute(
                """
                SELECT
                    city_name, city_slug, active_listings, median_price,
                    price_per_sqft, median_days_on_market, houses_count,
                    condos_count, townhomes_count, under_1m_count, pool_count,
                    waterfront_count, ocean_view_count, top_neighborhoods,
                    last_updated, data_source
                FROM city_statistics
                WHERE city_slug = %s
                LIMIT 1
            """,
                (city_slug,),
            )
            row = cur.fetchone()
            if row:
                conn.close()
                return dict(row)

            city_name = _slug_to_name(city_slug)
            cur.execute(
                """
                SELECT
                    city_name, city_slug, active_listings, median_price,
                    price_per_sqft, median_days_on_market, houses_count,
                    condos_count, townhomes_count, under_1m_count, pool_count,
                    waterfront_count, ocean_view_count, top_neighborhoods,
                    last_updated, data_source
                FROM city_statistics
                WHERE city_name ILIKE %s OR city_slug ILIKE %s
                ORDER BY active_listings DESC
                LIMIT 1
            """,
                (f"%{city_name}%", f"%{city_slug.replace('-ca', '')}%"),
            )
            fallback = cur.fetchone()
        conn.close()
        return dict(fallback) if fallback else None
    except Exception as exc:
        print(f"❌ Stats fetch failed for {city_slug}: {exc}")
        return None


def generate_section_a(stats: dict):
    neighborhoods = (
        json.loads(stats["top_neighborhoods"])
        if isinstance(stats["top_neighborhoods"], str)
        else stats["top_neighborhoods"]
    ) or []
    top_3 = [n.get("name", "") for n in neighborhoods[:3] if n.get("name")]
    last_updated = (
        stats["last_updated"].strftime("%B %Y")
        if isinstance(stats.get("last_updated"), datetime)
        else datetime.now().strftime("%B %Y")
    )

    prompt = f"""You are a professional real estate copywriter. Write SEO-optimized content for {stats['city_name']}, California real estate.

STRICT WRITING RULES
- NO hyphens anywhere in the content
- NO parentheses anywhere
- NO exclamation marks
- NO colons or semicolons in the content
- Use natural, flowing sentences
- Write in a professional but welcoming tone

Task
Create TWO outputs:
1. H1 Title with 6 to 12 words naturally mentioning "{stats['city_name']}" and real estate
2. Intro Paragraph with EXACTLY 160 to 220 words

Data to incorporate naturally
- City {stats['city_name']}, California
- Active Listings approximately {stats['active_listings']} homes for sale
- Median Price around ${stats['median_price']:,.0f}
- Top Neighborhoods {', '.join(top_3) if top_3 else 'top local communities'}

Intro Paragraph must
- Mention city name, listings count, and median price
- Reference 2 to 3 top neighborhoods
- End with "Last updated {last_updated} Source {stats['data_source']}"
- Follow all strict writing rules

Output format exactly
H1: [title]

INTRO: [paragraph]
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert real estate copywriter who strictly follows formatting rules.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=500,
        )

        content = response.choices[0].message.content or ""
        lines = content.strip().split("\n")
        h1 = ""
        intro = ""

        for idx, line in enumerate(lines):
            if line.startswith("H1:"):
                h1 = line.replace("H1:", "").strip()
            elif line.startswith("INTRO:"):
                intro = "\n".join(lines[idx:]).replace("INTRO:", "").strip()
                break
        return h1, intro
    except Exception as exc:
        print(f"❌ Section A generation failed: {exc}")
        return None, None


def generate_section_b(stats: dict):
    neighborhoods = (
        json.loads(stats["top_neighborhoods"])
        if isinstance(stats["top_neighborhoods"], str)
        else stats["top_neighborhoods"]
    ) or []
    top_text = ", ".join(
        [f"{n.get('name', 'Area')} avg ${n.get('avg_price', 0):,.0f}" for n in neighborhoods[:8]]
    )
    if not top_text:
        top_text = "Premium and diverse neighborhoods"

    prompt = f"""You are a professional real estate content writer. Create an in-depth editorial article about living in {stats['city_name']}, California.

STRICT WRITING RULES
- NO hyphens anywhere in the content
- NO parentheses anywhere
- NO exclamation marks
- NO colons or semicolons in the content
- Use natural, flowing sentences
- Write in a professional but welcoming tone

Task
Write EXACTLY 850 to 1150 words in 7 paragraphs.

Use these facts naturally
- Active Listings {stats['active_listings']}
- Median Price ${stats['median_price']:,.0f}
- Price per Sqft ${stats['price_per_sqft']:.2f}
- Days on Market {stats['median_days_on_market']}
- Houses {stats['houses_count']}
- Condos {stats['condos_count']}
- Townhomes {stats['townhomes_count']}
- Under 1M {stats['under_1m_count']}
- Pool Homes {stats['pool_count']}
- Waterfront {stats['waterfront_count']}
- Ocean View {stats['ocean_view_count']}
- Top Neighborhoods {top_text}

Paragraph structure
1. City overview and appeal
2. Neighborhood comparison and feel
3. Schools and family life
4. Lifestyle and activities
5. Market analysis with numbers
6. Inventory and property mix
7. Forward outlook and buyer interest

Do not invent specific schools, restaurants, or landmarks.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert real estate writer. Keep content factual and compliant.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=2000,
        )
        return (response.choices[0].message.content or "").strip()
    except Exception as exc:
        print(f"❌ Section B generation failed: {exc}")
        return None


def save_seo_content(city_slug: str, h1: str, intro: str, editorial: str, stats: dict) -> bool:
    try:
        top_neighborhoods = (
            json.loads(stats["top_neighborhoods"])
            if isinstance(stats["top_neighborhoods"], str)
            else stats["top_neighborhoods"]
        )
        conn = psycopg2.connect(**DB_CONFIG)
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO city_seo_content (
                    city_name, city_slug, h1_title, intro_paragraph,
                    editorial_content, active_listings, median_price,
                    top_neighborhoods, last_updated, data_source,
                    gpt_model, generation_status
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (city_slug) DO UPDATE SET
                    h1_title = EXCLUDED.h1_title,
                    intro_paragraph = EXCLUDED.intro_paragraph,
                    editorial_content = EXCLUDED.editorial_content,
                    active_listings = EXCLUDED.active_listings,
                    median_price = EXCLUDED.median_price,
                    top_neighborhoods = EXCLUDED.top_neighborhoods,
                    last_updated = EXCLUDED.last_updated,
                    generated_at = NOW(),
                    generation_status = EXCLUDED.generation_status
            """,
                (
                    stats["city_name"],
                    city_slug,
                    h1,
                    intro,
                    editorial,
                    stats["active_listings"],
                    stats["median_price"],
                    json.dumps(top_neighborhoods),
                    stats["last_updated"],
                    stats["data_source"],
                    "gpt-4o",
                    "completed",
                ),
            )
            conn.commit()
        conn.close()
        return True
    except Exception as exc:
        print(f"❌ Save failed for {city_slug}: {exc}")
        return False


def generate_for_city(city_slug: str) -> bool:
    print(f"\n{'=' * 70}")
    print(f"🚀 Processing {city_slug}")
    print(f"{'=' * 70}")

    stats = get_city_stats(city_slug)
    if not stats:
        print(f"❌ No stats found for {city_slug}")
        return False

    print(
        f"✅ Stats: {stats['city_name']} | Active {stats['active_listings']} | Median ${stats['median_price']:,.0f}"
    )

    h1, intro = generate_section_a(stats)
    if not h1 or not intro:
        print("❌ Failed Section A")
        return False
    print(f"✅ Section A done ({len(intro.split())} words)")

    editorial = generate_section_b(stats)
    if not editorial:
        print("❌ Failed Section B")
        return False
    print(f"✅ Section B done ({len(editorial.split())} words)")

    if not save_seo_content(city_slug, h1, intro, editorial, stats):
        return False

    print(f"✅ Saved SEO content for {city_slug}")
    return True


def main():
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ OPENAI_API_KEY is missing in environment")
        return

    print("=" * 70)
    print("San Diego Remaining Cities SEO Generator")
    print("=" * 70)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Target cities: {len(TARGET_CITY_SLUGS)}")

    success = 0
    failed = 0

    for slug in TARGET_CITY_SLUGS:
        try:
            if generate_for_city(slug):
                success += 1
            else:
                failed += 1
        except Exception as exc:
            print(f"❌ Unexpected failure for {slug}: {exc}")
            failed += 1

    print(f"\n{'=' * 70}")
    print(f"✅ Completed: {success}")
    print(f"❌ Failed: {failed}")
    print(f"Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)


if __name__ == "__main__":
    main()
