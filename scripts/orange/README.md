# Orange County SEO Content Scripts

Generate **Schools & Education** and **Lifestyle & Amenities** sections for Crown Coastal Homes Orange County and city landing pages using the master prompts and OpenAI (API key from `.env`).

## Setup

- **OPENAI_API_KEY** must be set in the repo root `.env` or `.env.local`.
- Optional: **OPENAI_MODEL** (default: `gpt-4o-mini`).

Run all commands from the **repo root**:

```bash
cd "d:\New folder (10)\costal-prime-back-new"
```

## Scripts

| Script | Purpose |
|--------|--------|
| `generate_orange_county_schools_education.py` | Schools & Education for **Orange County** (county page) |
| `generate_orange_cities_schools_education.py` | Schools & Education for **each Orange County city** |
| `generate_orange_cities_lifestyle_amenities.py` | **Lifestyle & Amenities** for each Orange County city only |
| `run_all_orange_seo.py` | Run county first, then all cities (schools then lifestyle) |
| `upsert_city_lifestyle_to_db.js` | Insert/update `city_lifestyle_research` from output JSON (requires DATABASE_URL) |

## Usage

**1. Orange County (county) – Schools & Education only**

```bash
python scripts/orange/generate_orange_county_schools_education.py
```

Output: `scripts/orange/output/orange_county_schools_education.txt` and `.json`.

**2. All Orange County cities – Schools & Education**

```bash
# All 34 cities
python scripts/orange/generate_orange_cities_schools_education.py

# Single city
python scripts/orange/generate_orange_cities_schools_education.py --city irvine-ca

# First N cities (e.g. 5)
python scripts/orange/generate_orange_cities_schools_education.py --limit 5

# Dry run (print prompts, no API calls)
python scripts/orange/generate_orange_cities_schools_education.py --dry-run
```

Output: `scripts/orange/output/<city-slug>_schools_education.txt` and `orange_cities_schools_education.json`.

**3. All Orange County cities – Lifestyle & Amenities (city only)**

```bash
python scripts/orange/generate_orange_cities_lifestyle_amenities.py
python scripts/orange/generate_orange_cities_lifestyle_amenities.py --city newport-beach-ca
python scripts/orange/generate_orange_cities_lifestyle_amenities.py --limit 5
```

Output: `scripts/orange/output/<city-slug>_lifestyle_amenities.txt` and `orange_cities_lifestyle_amenities.json`.

**4. Run all (county first, then all cities)**

```bash
python scripts/orange/run_all_orange_seo.py
```

Runs in order: Orange County schools → all cities schools → all cities lifestyle.

## Master prompts

- **Schools & Education**: `config.py` → `SCHOOLS_EDUCATION_MASTER_PROMPT` (place, state, page type, optional school districts, universities, education notes, focus keyword).
- **Lifestyle & Amenities**: `config.py` → `LIFESTYLE_AMENITIES_MASTER_PROMPT` (place, state). Used for **city** pages only.

Rules: no underscores, no quotation marks, no hyphens; no invented names or stats; Fair Housing compliant; Crown Coastal Homes tone; 180–230 words; structure as in the master prompt.

## Cities (34)

Aliso Viejo, Anaheim, Brea, Buena Park, Costa Mesa, Cypress, Dana Point, Fountain Valley, Fullerton, Garden Grove, Huntington Beach, Irvine, La Habra, La Palma, Laguna Beach, Laguna Hills, Laguna Niguel, Laguna Woods, Lake Forest, Los Alamitos, Mission Viejo, Newport Beach, Orange, Placentia, Rancho Santa Margarita, San Clemente, San Juan Capistrano, Santa Ana, Seal Beach, Stanton, Tustin, Villa Park, Westminster, Yorba Linda.
