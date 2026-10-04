#!/usr/bin/env python3
"""Carlsbad Local SEO Content Generator using OpenAI GPT-4"""
import psycopg2
import psycopg2.extras
import json
from datetime import datetime
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Connects directly to the live DigitalOcean droplet
DB_CONFIG = {
    'host': '157.230.160.98',
    'port': 5432,
    'user': 'redata_user',
    'password': os.getenv('DB_PASSWORD'),
    'database': 'trestle_live',
}

# The target city slug for Carlsbad
TARGET_CITY_SLUG = 'carlsbad-ca' # The trailing -ca matches frontend expectations 

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def get_city_stats(city_slug):
    """Fetch city statistics from remote database"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            # We'll try fetching exact match first, or just '%carlsbad%' if exact fails
            cur.execute("""
                SELECT
                    city_name, city_slug, active_listings, median_price,
                    price_per_sqft, median_days_on_market, houses_count,
                    condos_count, townhomes_count, under_1m_count, pool_count,
                    waterfront_count, ocean_view_count, top_neighborhoods,
                    last_updated, data_source
                FROM city_statistics
                WHERE city_slug ILIKE %s
            """, (f"%carlsbad%",))
            result = cur.fetchone()
        conn.close()

        if not result:
            return None

        return dict(result)
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return None

def generate_section_a(stats):
    """Generate Section A: H1 + Intro Paragraph using GPT-4"""

    # Parse top neighborhoods
    neighborhoods = json.loads(stats['top_neighborhoods']) if isinstance(stats['top_neighborhoods'], str) else stats['top_neighborhoods']
    top_3_neighborhoods = [n['name'] for n in neighborhoods[:3]] if neighborhoods else []

    # Format last updated date
    last_updated = stats['last_updated'].strftime('%B %Y') if isinstance(stats['last_updated'], datetime) else datetime.now().strftime('%B %Y')

    prompt = f"""You are a professional real estate copywriter. Write SEO-optimized content for {stats['city_name']}, California real estate.

**STRICT WRITING RULES - FOLLOW EXACTLY:**
- NO hyphens anywhere in the content
- NO parentheses anywhere
- NO exclamation marks
- NO colons or semicolons in the content
- Use natural, flowing sentences
- Write in a professional but welcoming tone

**Task: Generate Section A - Above the Fold**

Create TWO outputs:
1. H1 Title: 6 to 12 words maximum, naturally mentioning "{stats['city_name']}" and real estate
2. Intro Paragraph: EXACTLY 160 to 220 words

**Data to incorporate naturally:**
- City: {stats['city_name']}, California
- Active Listings: approximately {stats['active_listings']} homes for sale
- Median Price: around ${stats['median_price']:,.0f}
- Top Neighborhoods: {', '.join(top_3_neighborhoods) if top_3_neighborhoods else 'various scenic communities'}

**Intro Paragraph Requirements:**
- 160-220 words total
- Naturally mention the city name, listings count, and median price
- Reference 2-3 of these top neighborhoods: {', '.join(top_3_neighborhoods) if top_3_neighborhoods else 'the beautiful coastal areas'}
- End with: "Last updated {last_updated} Source {stats['data_source']}"
- DO NOT use hyphens, parentheses, exclamation marks, colons, or semicolons
- Make it engaging and SEO friendly but natural sounding

**Output Format:**
H1: [your H1 title here]

INTRO: [your 160-220 word intro paragraph here]

Generate now:"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert real estate copywriter who follows strict formatting rules. Never use hyphens, parentheses, exclamation marks, colons, or semicolons in your content."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        content = response.choices[0].message.content

        # Parse H1 and Intro
        lines = content.strip().split('\n')
        h1 = ""
        intro = ""

        for i, line in enumerate(lines):
            if line.startswith('H1:'):
                h1 = line.replace('H1:', '').strip()
            elif line.startswith('INTRO:'):
                intro = '\n'.join(lines[i:]).replace('INTRO:', '').strip()
                break

        return h1, intro

    except Exception as e:
        print(f"Error generating Section A: {e}")
        return None, None

def generate_section_b(stats):
    """Generate Section B: Living in City Editorial using GPT-4o"""

    # Parse top neighborhoods
    neighborhoods = json.loads(stats['top_neighborhoods']) if isinstance(stats['top_neighborhoods'], str) else stats['top_neighborhoods']
    top_neighborhoods_text = ', '.join([f"{n['name']} (avg ${n['avg_price']:,.0f})" for n in neighborhoods[:8]]) if neighborhoods else "Premium coastal neighborhoods"

    prompt = f"""You are a professional real estate content writer. Create an in-depth editorial article about living in {stats['city_name']}, California.

**STRICT WRITING RULES - FOLLOW EXACTLY:**
- NO hyphens anywhere in the content
- NO parentheses anywhere
- NO exclamation marks
- NO colons or semicolons in the content
- Use natural, flowing sentences
- Write in a professional but welcoming tone

**Task: Generate Section B - Living in {stats['city_name']} Editorial**

Write a comprehensive article of EXACTLY 850 to 1150 words in 7 paragraphs.

**Data to incorporate naturally:**
- Active Listings: {stats['active_listings']}
- Median Price: ${stats['median_price']:,.0f}
- Price per Sqft: ${stats['price_per_sqft']:.2f}
- Days on Market: {stats['median_days_on_market']} days median
- Houses Available: {stats['houses_count']}
- Condos Available: {stats['condos_count']}
- Townhomes Available: {stats['townhomes_count']}
- Homes Under $1M: {stats['under_1m_count']}
- Homes with Pool: {stats['pool_count']}
- Waterfront Properties: {stats['waterfront_count']}
- Ocean View Properties: {stats['ocean_view_count']}
- Top Neighborhoods: {top_neighborhoods_text}

**Structure (7 paragraphs, 3-6 sentences each):**
1. Overview of {stats['city_name']} as a place to live and its appeal
2. Top neighborhoods with specific details about each
3. Schools, education, and family friendliness
4. Lifestyle, activities, dining, entertainment
5. Real estate market analysis with actual statistics
6. Property types and inventory breakdown
7. Future outlook and why people choose {stats['city_name']}

**Requirements:**
- 850-1150 words total
- 7 paragraphs, each 3-6 sentences
- Use ONLY factual data provided above
- Natural incorporation of statistics
- DO NOT use hyphens, parentheses, exclamation marks, colons, or semicolons
- DO NOT invent schools, restaurants, or specific places
- Focus on general lifestyle and verified market data
- Professional, informative tone

Generate the article now:"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert real estate content writer who strictly follows formatting rules. Never use hyphens, parentheses, exclamation marks, colons, or semicolons. Write factual, data-driven content without inventing specific details."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Error generating Section B: {e}")
        return None

def save_seo_content(city_slug, h1, intro, editorial, stats):
    """Save generated content to the live remote database"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        with conn.cursor() as cur:
            cur.execute("""
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
            """, (
                stats['city_name'], city_slug, h1, intro, editorial,
                stats['active_listings'], stats['median_price'],
                json.dumps(json.loads(stats['top_neighborhoods']) if isinstance(stats['top_neighborhoods'], str) else stats['top_neighborhoods']),
                stats['last_updated'], stats['data_source'],
                'gpt-4o', 'completed'
            ))
            conn.commit()
        conn.close()
        return True
    except Exception as e:
         print(f"❌ Error saving to database: {e}")
         return False

def main():
    # Check for OpenAI API key
    if not os.getenv('OPENAI_API_KEY'):
        print("❌ Error: OPENAI_API_KEY environment variable not set in .env")
        return

    print("="*60)
    print("🌴 Carlsbad Local SEO Content Generator (GPT-4o)")
    print("="*60)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    print(f"1️⃣ Connecting to DigitalOcean DB ({DB_CONFIG['host']}) to fetch stats...")
    stats = get_city_stats('carlsbad') # Use wildcard '%carlsbad%' via ILIKE in fetch function
    
    if not stats:
        print(f"❌ Failed to retrieve stats for Carlsbad. Either the DB connection failed or the city isn't in city_statistics yet.")
        return

    # Use exact slug found in DB
    actual_city_slug = stats['city_slug']

    print(f"✅ Found stats for {stats['city_name']} ({actual_city_slug}):")
    print(f"   - Active Listings: {stats['active_listings']}")
    print(f"   - Median Price: ${stats['median_price']:,.0f}")
    
    print(f"\n2️⃣ Generating Section A with GPT-4o (H1 + Intro)...")
    h1, intro = generate_section_a(stats)
    if not h1 or not intro:
        print(f"❌ Failed to generate Section A.")
        return
        
    print(f"✅ Section A Done! H1: {h1[:50]}...")
    
    print(f"\n3️⃣ Generating Section B with GPT-4o (1000 word Editorial)...")
    editorial = generate_section_b(stats)
    if not editorial:
        print(f"❌ Failed to generate Section B.")
        return
        
    print(f"✅ Section B Done! Generated {len(editorial.split())} words.")
    
    print(f"\n4️⃣ Pushing content back to DigitalOcean Server...")
    target_slug = actual_city_slug
    if save_seo_content(target_slug, h1, intro, editorial, stats):
        print(f"✅ SUCCESS! Carlsbad SEO content has been injected into the remote 'city_seo_content' table under slug '{target_slug}'.")
    
    print("\n" + "="*60)

if __name__ == '__main__':
    main()
