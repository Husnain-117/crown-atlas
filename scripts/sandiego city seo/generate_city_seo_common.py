#!/usr/bin/env python3
"""Shared SEO generation logic for individual city scripts."""

import json
import os
from datetime import datetime
from typing import Optional, Tuple

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

_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=_api_key) if _api_key else None


def _slug_to_name(slug: str) -> str:
    return slug.replace("-ca", "").replace("-", " ").title()


def get_city_stats(city_slug: str) -> Optional[dict]:
    """Fetch city stats for exact slug with fallback name search."""
    try:
        base_slug = city_slug[:-3] if city_slug.endswith("-ca") else city_slug
        city_name = _slug_to_name(city_slug)
        conn = psycopg2.connect(**DB_CONFIG)
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            for candidate_slug in [city_slug, base_slug]:
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
                    (candidate_slug,),
                )
                row = cur.fetchone()
                if row:
                    conn.close()
                    return dict(row)

            # Prefer exact city_name match before broader fallback.
            cur.execute(
                """
                SELECT
                    city_name, city_slug, active_listings, median_price,
                    price_per_sqft, median_days_on_market, houses_count,
                    condos_count, townhomes_count, under_1m_count, pool_count,
                    waterfront_count, ocean_view_count, top_neighborhoods,
                    last_updated, data_source
                FROM city_statistics
                WHERE lower(city_name) = lower(%s)
                LIMIT 1
                """,
                (city_name,),
            )
            by_name = cur.fetchone()
            if by_name:
                conn.close()
                return dict(by_name)

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
                (f"%{city_name}%", f"%{base_slug}%"),
            )
            fallback = cur.fetchone()
        conn.close()
        return dict(fallback) if fallback else None
    except Exception as exc:
        print(f"[ERROR] Database error ({city_slug}): {exc}")
        return None


def generate_section_a(stats: dict) -> Tuple[Optional[str], Optional[str]]:
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

    prompt = f"""You are a professional real estate copywriter. Write SEO content for {stats['city_name']}, California real estate.

STRICT WRITING RULES
- NO hyphens anywhere in content
- NO parentheses anywhere
- NO exclamation marks
- NO colons or semicolons
- Professional, natural tone

Task
Create two outputs
1. H1 title with 6 to 12 words mentioning {stats['city_name']} and real estate
2. Intro paragraph with 160 to 220 words

Use naturally
- Active listings about {stats['active_listings']}
- Median price around ${stats['median_price']:,.0f}
- Top neighborhoods {', '.join(top_3) if top_3 else 'top local communities'}

Intro ending must be exactly
Last updated {last_updated} Source {stats['data_source']}

Output format
H1: [title]

INTRO: [paragraph]
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert real estate copywriter following strict punctuation and formatting constraints.",
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
        for i, line in enumerate(lines):
            if line.startswith("H1:"):
                h1 = line.replace("H1:", "").strip()
            elif line.startswith("INTRO:"):
                intro = "\n".join(lines[i:]).replace("INTRO:", "").strip()
                break

        return h1 or None, intro or None
    except Exception as exc:
        print(f"[ERROR] Section A generation failed: {exc}")
        return None, None


def generate_section_b(stats: dict) -> Optional[str]:
    neighborhoods = (
        json.loads(stats["top_neighborhoods"])
        if isinstance(stats["top_neighborhoods"], str)
        else stats["top_neighborhoods"]
    ) or []
    top_text = ", ".join(
        [f"{n.get('name', 'Area')} avg ${n.get('avg_price', 0):,.0f}" for n in neighborhoods[:8]]
    )
    if not top_text:
        top_text = "Diverse local neighborhoods"

    prompt = f"""Create a factual editorial on living in {stats['city_name']}, California.

STRICT WRITING RULES
- NO hyphens
- NO parentheses
- NO exclamation marks
- NO colons or semicolons
- No invented places

Required length and structure
- 850 to 1150 words
- 7 paragraphs
- 3 to 6 sentences per paragraph

Data points to include naturally
- Active listings {stats['active_listings']}
- Median price ${stats['median_price']:,.0f}
- Price per sqft ${stats['price_per_sqft']:.2f}
- Median days on market {stats['median_days_on_market']}
- Houses {stats['houses_count']}
- Condos {stats['condos_count']}
- Townhomes {stats['townhomes_count']}
- Under one million {stats['under_1m_count']}
- With pool {stats['pool_count']}
- Waterfront {stats['waterfront_count']}
- Ocean view {stats['ocean_view_count']}
- Top neighborhoods {top_text}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert real estate writer producing factual, data-driven local market editorials.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=2000,
        )
        return (response.choices[0].message.content or "").strip() or None
    except Exception as exc:
        print(f"[ERROR] Section B generation failed: {exc}")
        return None


def save_seo_content(city_slug: str, h1: str, intro: str, editorial: str, stats: dict) -> bool:
    try:
        neighborhoods = (
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
                    json.dumps(neighborhoods),
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
        print(f"[ERROR] Save failed ({city_slug}): {exc}")
        return False


def run_for_city(city_slug: str) -> bool:
    if not os.getenv("OPENAI_API_KEY") or client is None:
        print("[ERROR] OPENAI_API_KEY is missing")
        return False

    print(f"\n{'=' * 64}")
    print(f"Generating SEO for {city_slug}")
    print(f"{'=' * 64}")

    stats = get_city_stats(city_slug)
    if not stats:
        print(f"[ERROR] No stats found for {city_slug}")
        return False

    print(
        f"[OK] Stats loaded: {stats['city_name']} | Active {stats['active_listings']} | Median ${stats['median_price']:,.0f}"
    )

    h1, intro = generate_section_a(stats)
    if not h1 or not intro:
        return False

    editorial = generate_section_b(stats)
    if not editorial:
        return False

    target_slug = stats.get("city_slug") or city_slug
    if target_slug != city_slug:
        print(f"[INFO] Saving under existing stats slug {target_slug}")

    if not save_seo_content(target_slug, h1, intro, editorial, stats):
        return False

    print(f"[OK] Completed {city_slug} -> {target_slug}")
    return True
